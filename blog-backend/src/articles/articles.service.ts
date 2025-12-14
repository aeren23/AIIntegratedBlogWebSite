import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { ArticleTag } from './entities/article-tag.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleResponseDto } from './dto/article-response.dto';
import { ServiceResponse } from '../common/service-response';
import { PaginatedResult } from '../common/types/paginated-result.type';
import { UserRole } from '../common/enums';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { CategoryResponseDto } from '../categories/dto/category-response.dto';
import { TagResponseDto } from '../tags/dto/tag-response.dto';
import { UserProfileResponseDto } from '../users/dto/user-profile-response.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(ArticleTag)
    private readonly articleTagRepository: Repository<ArticleTag>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Unified pagination method with role-based visibility, search, and filtering
   */
  async getPagedArticles(params: {
    requesterRole: UserRole;
    requesterUserId?: string;
    categorySlug?: string;
    tagSlug?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
    isAscending?: boolean;
    includeDeleted?: boolean;
  }): Promise<ServiceResponse<PaginatedResult<ArticleResponseDto>>> {
    const {
      requesterRole,
      requesterUserId,
      categorySlug,
      tagSlug,
      keyword,
      page = 1,
      pageSize: requestedPageSize = 10,
      isAscending = false,
      includeDeleted = false,
    } = params;

    // Clamp page size to max 20
    const pageSize = Math.min(requestedPageSize, 20);
    const skip = (page - 1) * pageSize;

    // Build base query with joins
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.articleTags', 'articleTags')
      .leftJoinAndSelect('articleTags.tag', 'tag');

    // Apply role-based visibility rules
    this.applyVisibilityRules(
      queryBuilder,
      requesterRole,
      requesterUserId,
      includeDeleted,
    );

    // Apply category filter
    if (categorySlug) {
      queryBuilder.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    // Apply tag filter
    if (tagSlug) {
      queryBuilder.andWhere('tag.slug = :tagSlug', { tagSlug });
    }

    // Apply search filter (case-insensitive LIKE across title and content)
    if (keyword) {
      queryBuilder.andWhere(
        '(LOWER(article.title) LIKE LOWER(:keyword) OR LOWER(article.content) LIKE LOWER(:keyword))',
        { keyword: `%${keyword}%` },
      );
    }

    // Get total count before pagination
    const totalCount = await queryBuilder.getCount();

    // Apply sorting
    const sortOrder = isAscending ? 'ASC' : 'DESC';
    queryBuilder.orderBy('article.createdAt', sortOrder);

    // Apply pagination
    queryBuilder.skip(skip).take(pageSize);

    // Execute query
    const articles = await queryBuilder.getMany();

    // Map to DTOs
    const items = articles.map((article) => this.mapToArticleResponseDto(article));

    return ServiceResponse.ok({
      items,
      currentPage: page,
      pageSize,
      totalCount,
      isAscending,
    });
  }

  /**
   * Get single article by slug with role-based access control
   */
  async getArticleBySlug(
    slug: string,
    requesterRole: UserRole,
    requesterUserId?: string,
  ): Promise<ServiceResponse<ArticleResponseDto>> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.articleTags', 'articleTags')
      .leftJoinAndSelect('articleTags.tag', 'tag')
      .where('article.slug = :slug', { slug });

    // Apply visibility rules
    this.applyVisibilityRules(queryBuilder, requesterRole, requesterUserId, false);

    const article = await queryBuilder.getOne();

    if (!article) {
      return ServiceResponse.fail('Article not found or access denied');
    }

    return ServiceResponse.ok(this.mapToArticleResponseDto(article));
  }

  /**
   * Create new article
   */
  async createArticle(
    dto: CreateArticleDto,
    authorId: string,
  ): Promise<ServiceResponse<ArticleResponseDto>> {
    // Validate author exists
    const author = await this.userRepository.findOne({
      where: { id: authorId },
    });
    
    if (!author) {
      return ServiceResponse.fail(
        `Invalid author: User with ID "${authorId}" does not exist. This is likely a mock authentication issue - you need to create a real user first or fix the JWT mock.`
      );
    }
    
    if (author.isDeleted) {
      return ServiceResponse.fail('Author account has been deleted');
    }

    // Validate category exists and is not deleted
    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.categoryId },
      });
      
      if (!category) {
        return ServiceResponse.fail(
          `Invalid category ID: Category with ID "${dto.categoryId}" does not exist. Use GET /categories to find valid categories.`
        );
      }
      
      if (category.isDeleted) {
        return ServiceResponse.fail(
          `Invalid category: The selected category has been deleted. Use GET /categories to find active categories.`
        );
      }
    }

    // Create article entity
    const article = this.articleRepository.create({
      ...dto,
      authorId,
      createdById: authorId,
    });

    try {
      const savedArticle = await this.articleRepository.save(article);

      // Fetch full article with relations
      const fullArticle = await this.articleRepository
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.author', 'author')
        .leftJoinAndSelect('author.profile', 'profile')
        .leftJoinAndSelect('article.category', 'category')
        .leftJoinAndSelect('article.articleTags', 'articleTags')
        .leftJoinAndSelect('articleTags.tag', 'tag')
        .where('article.id = :id', { id: savedArticle.id })
        .getOne();

      if (!fullArticle) {
        return ServiceResponse.fail('Article created but could not be retrieved');
      }

      return ServiceResponse.ok(this.mapToArticleResponseDto(fullArticle));
    } catch (error) {
      // Log full error for debugging
      console.error('Article creation error:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        detail: error.detail,
      });

      // Check constraint type
      if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
        const errorMessage = (error.message || '').toLowerCase();
        
        // Foreign key constraint (invalid category or author)
        if (errorMessage.includes('foreign')) {
          // SQLite doesn't always specify which FK failed, so we check the DTO
          // Most likely it's categoryId since authorId comes from JWT (should be valid)
          if (dto.categoryId) {
            return ServiceResponse.fail(
              `Invalid category ID: Category with ID "${dto.categoryId}" does not exist. Use GET /categories to find valid categories.`
            );
          }
          return ServiceResponse.fail('Foreign key constraint violation: Invalid category or author ID');
        }
        
        // Unique constraint (duplicate slug)
        if (errorMessage.includes('unique') || errorMessage.includes('slug')) {
          return ServiceResponse.fail(`Article with slug "${dto.slug}" already exists. Please use a different slug.`);
        }
        
        return ServiceResponse.fail('Database constraint violation');
      }
      
      return ServiceResponse.fail('Failed to create article');
    }
  }

  /**
   * Update article with role-based access control
   */
  async updateArticle(
    articleId: string,
    dto: UpdateArticleDto,
    requesterRole: UserRole,
    requesterUserId: string,
  ): Promise<ServiceResponse<ArticleResponseDto>> {
    // Fetch article
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
      relations: ['author', 'author.profile', 'category'],
    });

    if (!article) {
      return ServiceResponse.fail('Article not found');
    }

    // Check permissions
    const canUpdate = this.canModifyArticle(article, requesterRole, requesterUserId);
    if (!canUpdate) {
      return ServiceResponse.fail('Access denied: You cannot update this article');
    }

    // Apply updates
    Object.assign(article, dto);
    article.updatedById = requesterUserId;

    try {
      await this.articleRepository.save(article);

      // Fetch updated article with all relations
      const updatedArticle = await this.articleRepository
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.author', 'author')
        .leftJoinAndSelect('author.profile', 'profile')
        .leftJoinAndSelect('article.category', 'category')
        .leftJoinAndSelect('article.articleTags', 'articleTags')
        .leftJoinAndSelect('articleTags.tag', 'tag')
        .where('article.id = :id', { id: articleId })
        .getOne();

      if (!updatedArticle) {
        return ServiceResponse.fail('Article updated but could not be retrieved');
      }

      return ServiceResponse.ok(this.mapToArticleResponseDto(updatedArticle));
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
        return ServiceResponse.fail('Article with this slug already exists');
      }
      return ServiceResponse.fail('Failed to update article');
    }
  }

  /**
   * Soft delete article with role-based access control
   */
  async softDeleteArticle(
    articleId: string,
    requesterRole: UserRole,
    requesterUserId: string,
  ): Promise<ServiceResponse<void>> {
    // Fetch article
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });

    if (!article) {
      return ServiceResponse.fail('Article not found');
    }

    if (article.isDeleted) {
      return ServiceResponse.fail('Article is already deleted');
    }

    // Check permissions
    const canDelete = this.canModifyArticle(article, requesterRole, requesterUserId);
    if (!canDelete) {
      return ServiceResponse.fail('Access denied: You cannot delete this article');
    }

    // Soft delete
    article.isDeleted = true;
    article.updatedById = requesterUserId;

    try {
      await this.articleRepository.save(article);
      return ServiceResponse.ok(null);
    } catch (error) {
      return ServiceResponse.fail('Failed to delete article');
    }
  }

  /**
   * Hard delete article (ADMIN/SUPERADMIN only)
   */
  async hardDeleteArticle(
    articleId: string,
    requesterRole: UserRole,
  ): Promise<ServiceResponse<void>> {
    // Only ADMIN and SUPERADMIN can hard delete
    if (requesterRole !== UserRole.ADMIN && requesterRole !== UserRole.SUPERADMIN) {
      return ServiceResponse.fail('Access denied: Only admins can permanently delete articles');
    }

    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });

    if (!article) {
      return ServiceResponse.fail('Article not found');
    }

    try {
      // TODO: Implement image cleanup before hard delete
      // - Query all images associated with this article
      // - Delete physical files from storage
      // - Delete image records from database

      await this.articleRepository.remove(article);
      return ServiceResponse.ok(null);
    } catch (error) {
      return ServiceResponse.fail('Failed to permanently delete article');
    }
  }

  /**
   * Apply role-based visibility rules to QueryBuilder
   * This is the core security logic for article access
   */
  private applyVisibilityRules(
    queryBuilder: any,
    requesterRole: UserRole,
    requesterUserId?: string,
    includeDeleted: boolean = false,
  ): void {
    // Handle deleted articles
    if (requesterRole === UserRole.ADMIN || requesterRole === UserRole.SUPERADMIN) {
      // Admins can optionally see deleted articles
      if (!includeDeleted) {
        queryBuilder.andWhere('article.isDeleted = :isDeleted', { isDeleted: false });
      }
    } else {
      // Non-admins never see deleted articles
      queryBuilder.andWhere('article.isDeleted = :isDeleted', { isDeleted: false });
    }

    // Apply role-specific visibility rules
    switch (requesterRole) {
      case UserRole.USER:
        // Users can only see published articles
        queryBuilder.andWhere('article.isPublished = :isPublished', { isPublished: true });
        break;

      case UserRole.AUTHOR:
        // Authors can see their own articles OR other published articles
        if (requesterUserId) {
          queryBuilder.andWhere(
            '(article.authorId = :authorId OR article.isPublished = :isPublished)',
            { authorId: requesterUserId, isPublished: true },
          );
        } else {
          // If no userId provided, treat as regular user
          queryBuilder.andWhere('article.isPublished = :isPublished', { isPublished: true });
        }
        break;

      case UserRole.ADMIN:
      case UserRole.SUPERADMIN:
        // Admins can see all articles (including unpublished)
        // No additional filters needed
        break;

      default:
        // Default to most restrictive
        queryBuilder.andWhere('article.isPublished = :isPublished', { isPublished: true });
        break;
    }
  }

  /**
   * Check if user can modify (update/delete) an article
   */
  private canModifyArticle(
    article: Article,
    requesterRole: UserRole,
    requesterUserId: string,
  ): boolean {
    // Admins can modify any article
    if (requesterRole === UserRole.ADMIN || requesterRole === UserRole.SUPERADMIN) {
      return true;
    }

    // Authors can only modify their own articles
    if (requesterRole === UserRole.AUTHOR && article.authorId === requesterUserId) {
      return true;
    }

    // All other cases: no permission
    return false;
  }

  /**
   * Map Article entity to ArticleResponseDto
   */
  private mapToArticleResponseDto(article: Article): ArticleResponseDto {
    const dto = new ArticleResponseDto();
    dto.id = article.id;
    dto.title = article.title;
    dto.slug = article.slug;
    dto.content = article.content;
    dto.isPublished = article.isPublished;
    dto.createdAt = article.createdAt;

    // Map author
    if (article.author) {
      const authorDto = new UserResponseDto();
      authorDto.id = article.author.id;
      authorDto.username = article.author.username;

      // Map profile if exists
      if (article.author.profile) {
        const profileDto = new UserProfileResponseDto();
        profileDto.id = article.author.profile.id;
        profileDto.displayName = article.author.profile.displayName;
        profileDto.bio = article.author.profile.bio;
        profileDto.profileImageUrl = article.author.profile.profileImageUrl;
        profileDto.createdAt = article.author.profile.createdAt;
        authorDto.profile = profileDto;
      }

      dto.author = authorDto;
    }

    // Map category
    if (article.category) {
      const categoryDto = new CategoryResponseDto();
      categoryDto.id = article.category.id;
      categoryDto.name = article.category.name;
      categoryDto.slug = article.category.slug;
      categoryDto.createdAt = article.category.createdAt;
      dto.category = categoryDto;
    }

    // Map tags
    if (article.articleTags && article.articleTags.length > 0) {
      dto.tags = article.articleTags
        .filter((at) => at.tag) // Ensure tag exists
        .map((at) => {
          const tagDto = new TagResponseDto();
          tagDto.id = at.tag.id;
          tagDto.name = at.tag.name;
          tagDto.slug = at.tag.slug;
          tagDto.createdAt = at.tag.createdAt;
          return tagDto;
        });
    } else {
      dto.tags = [];
    }

    return dto;
  }
}
