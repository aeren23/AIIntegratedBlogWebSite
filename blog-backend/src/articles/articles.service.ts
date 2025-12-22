import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Article } from './entities/article.entity';
import { ArticleTag } from './entities/article-tag.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleResponseDto } from './dto/article-response.dto';
import { ServiceResponse } from '../common/service-response';
import { PaginatedResult } from '../common/types/paginated-result.type';
import { UserRole } from '../auth/enums/user-role.enum';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { CategoryResponseDto } from '../categories/dto/category-response.dto';
import { TagResponseDto } from '../tags/dto/tag-response.dto';
import { UserProfileResponseDto } from '../users/dto/user-profile-response.dto';
import { Image } from '../images/entities/image.entity';
import { LogService } from '../logs/log.service';
import { LogAction } from '../common/enums/log-action.enum';
import type { Multer } from 'multer';
import { Tag } from '../tags/entities/tag.entity';

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
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly logService: LogService,
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
    queryBuilder.loadRelationCountAndMap(
      'article.commentsCount',
      'article.comments',
    );

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
    queryBuilder.loadRelationCountAndMap(
      'article.commentsCount',
      'article.comments',
    );

    // Apply visibility rules
    this.applyVisibilityRules(queryBuilder, requesterRole, requesterUserId, false);

    const article = await queryBuilder.getOne();

    if (!article) {
      return ServiceResponse.fail('Article not found or access denied');
    }

    return ServiceResponse.ok(this.mapToArticleResponseDto(article));
  }

  /**
   * Get single article by ID (author/admin only)
   */
  async getArticleById(
    articleId: string,
    requesterRole: UserRole,
    requesterUserId?: string,
  ): Promise<ServiceResponse<ArticleResponseDto>> {
    const article = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.articleTags', 'articleTags')
      .leftJoinAndSelect('articleTags.tag', 'tag')
      .where('article.id = :articleId', { articleId })
      .loadRelationCountAndMap('article.commentsCount', 'article.comments')
      .getOne();

    if (!article) {
      return ServiceResponse.fail('Article not found');
    }

    const canView = this.canModifyArticle(article, requesterRole, requesterUserId ?? '');
    if (!canView) {
      return ServiceResponse.fail('Access denied: You cannot view this article');
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

    const normalizedTagIds = this.normalizeTagIds(dto.tagIds);
    const tagValidation = await this.validateTagIds(normalizedTagIds);
    if (!tagValidation.success) {
      return ServiceResponse.fail(tagValidation.errorMessage ?? 'Invalid tag IDs');
    }

    const { tagIds: _tagIds, ...articlePayload } = dto;

    // Create article entity
    const article = this.articleRepository.create({
      ...articlePayload,
      authorId,
      createdById: authorId,
    });

    try {
      const savedArticle = await this.articleRepository.save(article);

      if (normalizedTagIds.length > 0) {
        await this.syncArticleTags(savedArticle.id, normalizedTagIds, authorId);
      }

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

    const normalizedTagIds =
      dto.tagIds !== undefined ? this.normalizeTagIds(dto.tagIds) : undefined;

    if (normalizedTagIds) {
      const tagValidation = await this.validateTagIds(normalizedTagIds);
      if (!tagValidation.success) {
        return ServiceResponse.fail(tagValidation.errorMessage ?? 'Invalid tag IDs');
      }
    }

    const { tagIds: _tagIds, ...articlePayload } = dto;

    // Apply updates
    Object.assign(article, articlePayload);
    article.updatedById = requesterUserId;

    try {
      await this.articleRepository.save(article);

      if (normalizedTagIds) {
        await this.syncArticleTags(articleId, normalizedTagIds, requesterUserId);
      }

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
   * Restore a soft-deleted article
   */
  async restoreArticle(
    articleId: string,
    requesterRole: UserRole,
    requesterUserId: string,
  ): Promise<ServiceResponse<void>> {
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });

    if (!article) {
      return ServiceResponse.fail('Article not found');
    }

    if (!article.isDeleted) {
      return ServiceResponse.ok(null);
    }

    const canRestore = this.canModifyArticle(article, requesterRole, requesterUserId);
    if (!canRestore) {
      return ServiceResponse.fail('Access denied: You cannot restore this article');
    }

    article.isDeleted = false;
    article.updatedById = requesterUserId;

    try {
      await this.articleRepository.save(article);
      return ServiceResponse.ok(null);
    } catch (error) {
      return ServiceResponse.fail('Failed to restore article');
    }
  }

  /**
   * Upload an image for an article (AUTHOR/ADMIN only)
   */
  async uploadArticleImage(
    articleId: string,
    file: Multer.File,
    requesterRole: UserRole,
    requesterUserId: string,
  ): Promise<ServiceResponse<{ imageId: string; url: string }>> {
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });

    if (!article || article.isDeleted) {
      return ServiceResponse.fail('Article not found');
    }

    const canUpload = this.canModifyArticle(article, requesterRole, requesterUserId);
    if (!canUpload) {
      return ServiceResponse.fail('Access denied: You cannot upload images for this article');
    }

    if (!file) {
      return ServiceResponse.fail('No file uploaded');
    }

    if (!file.buffer) {
      return ServiceResponse.fail('Invalid file upload');
    }

    const allowedTypes: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };

    const extension = allowedTypes[file.mimetype];
    if (!extension) {
      return ServiceResponse.fail(
        'Unsupported file type. Allowed types: image/jpeg, image/png, image/webp, image/gif',
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return ServiceResponse.fail('File too large. Max size is 5MB');
    }

    const fileName = `${randomUUID()}.${extension}`;
    const articlesDir = path.join(process.cwd(), 'uploads', 'articles', articleId);
    await fs.mkdir(articlesDir, { recursive: true });
    const absolutePath = path.join(articlesDir, fileName);

    try {
      await fs.writeFile(absolutePath, file.buffer);

      const publicUrl = path.posix.join('/uploads/articles', articleId, fileName);
      const filePath = path.posix.join('uploads', 'articles', articleId, fileName);

      const image = this.imageRepository.create({
        articleId,
        fileName,
        publicUrl,
        filePath,
        mimeType: file.mimetype,
        size: file.size,
        createdById: requesterUserId,
      });

      const saved = await this.imageRepository.save(image);

      void this.logService.createLog({
        userId: requesterUserId,
        action: LogAction.UPLOAD,
        entityType: 'Image',
        entityId: saved.id,
        description: 'Article image uploaded',
        metadata: {
          articleId,
          publicUrl,
          mimeType: file.mimetype,
          size: file.size,
        },
      });

      return ServiceResponse.ok({ imageId: saved.id, url: publicUrl });
    } catch (error) {
      await this.deleteFileIfExists(absolutePath);
      console.error('Upload article image error:', error);
      return ServiceResponse.fail('Failed to upload image');
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
      const images = await this.imageRepository.find({
        where: { articleId },
      });

      for (const image of images) {
        const candidatePaths = this.buildImageFilePaths(image);
        for (const filePath of candidatePaths) {
          await this.deleteFileIfExists(filePath);
        }
      }

      await this.articleRepository.remove(article);

      void this.logService.createLog({
        action: LogAction.DELETE,
        entityType: 'Article',
        entityId: article.id,
        description: 'Article permanently deleted',
        metadata: {
          requesterRole,
          slug: article.slug,
          authorId: article.authorId,
          categoryId: article.categoryId,
          hadImages: images.length > 0,
        },
      });
      return ServiceResponse.ok(null);
    } catch (error) {
      console.error('Hard delete article error:', error);
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
    dto.isDeleted = article.isDeleted;
    dto.commentsCount =
      (article as Article & { commentsCount?: number }).commentsCount ?? 0;
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

  private normalizeTagIds(tagIds?: string[]): string[] {
    if (!tagIds || tagIds.length === 0) {
      return [];
    }

    return Array.from(new Set(tagIds.filter(Boolean)));
  }

  private async validateTagIds(tagIds: string[]): Promise<ServiceResponse<void>> {
    if (tagIds.length === 0) {
      return ServiceResponse.ok(null);
    }

    const tags = await this.tagRepository.find({
      where: { id: In(tagIds), isDeleted: false },
    });

    if (tags.length !== tagIds.length) {
      const foundIds = new Set(tags.map((tag) => tag.id));
      const missing = tagIds.filter((tagId) => !foundIds.has(tagId));
      return ServiceResponse.fail(
        `Invalid tag IDs: ${missing.join(', ')}`,
      );
    }

    return ServiceResponse.ok(null);
  }

  private async syncArticleTags(
    articleId: string,
    tagIds: string[],
    userId: string,
  ): Promise<void> {
    const existing = await this.articleTagRepository.find({
      where: { articleId },
    });

    const existingIds = new Set(existing.map((item) => item.tagId));
    const nextIds = new Set(tagIds);

    const toAdd = tagIds.filter((tagId) => !existingIds.has(tagId));
    const toRemove = existing.filter((item) => !nextIds.has(item.tagId));

    if (toRemove.length > 0) {
      await this.articleTagRepository.remove(toRemove);
    }

    if (toAdd.length > 0) {
      const additions = toAdd.map((tagId) =>
        this.articleTagRepository.create({
          articleId,
          tagId,
          createdById: userId,
        }),
      );
      await this.articleTagRepository.save(additions);
    }
  }

  private buildImageFilePaths(image: Image): string[] {
    const paths: (string | null)[] = [];

    const urlPath = this.resolveImageAbsolutePath(image.publicUrl);
    if (urlPath) {
      paths.push(urlPath);
    }

    const filePath = this.resolveImageAbsolutePath(image.filePath);
    if (filePath) {
      paths.push(filePath);
    }

    if (image.fileName) {
      const safeFilename = path.basename(image.fileName);
      const articleDir = image.articleId || 'unknown';
      paths.push(
        path.join(process.cwd(), 'uploads', 'articles', articleDir, safeFilename),
      );
    }

    return Array.from(new Set(paths.filter(Boolean))) as string[];
  }

  private resolveImageAbsolutePath(url?: string | null): string | null {
    if (!url) {
      return null;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return null;
    }

    const normalizedUrl = url.startsWith('/') ? url.slice(1) : url;
    const safePath = path.normalize(normalizedUrl);

    if (safePath.startsWith('..')) {
      return null;
    }

    return path.join(process.cwd(), safePath);
  }

  private async deleteFileIfExists(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Failed to delete image file:', {
          filePath,
          message: (error as Error).message,
        });
      }
    }
  }
}
