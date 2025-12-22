import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleResponseDto } from './dto/article-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Multer } from 'multer';

@ApiTags('Articles')
@Controller('articles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginated articles',
    description: 'Retrieve a paginated list of articles with optional filters for category, tags, and keyword search. Visibility rules apply based on user role.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page (max: 20, default: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'isAscending',
    required: false,
    type: Boolean,
    description: 'Sort order by creation date (default: false for DESC)',
    example: false,
  })
  @ApiQuery({
    name: 'categorySlug',
    required: false,
    type: String,
    description: 'Filter by category slug',
    example: 'backend',
  })
  @ApiQuery({
    name: 'tagSlug',
    required: false,
    type: String,
    description: 'Filter by tag slug',
    example: 'nestjs',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    type: String,
    description: 'Search keyword (searches in title and content)',
    example: 'typescript',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft-deleted articles (ADMIN only)',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved paginated articles',
    schema: {
      example: {
        success: true,
        data: {
          items: [
            {
              id: 'a1b2c3d4-e89b-12d3-a456-426614174000',
              title: 'Introduction to NestJS',
              slug: 'introduction-to-nestjs',
              content: '<p>NestJS is a progressive Node.js framework for building efficient and scalable server-side applications...</p>',
              isPublished: true,
              createdAt: '2024-01-01T10:00:00.000Z',
              author: {
                id: 'u123-4567-89ab-cdef',
                username: 'ali_developer',
                profile: {
                  id: 'p123-4567-89ab-cdef',
                  displayName: 'Ali Yılmaz',
                  bio: 'Backend developer passionate about clean architecture',
                  profileImageUrl: 'https://example.com/profiles/ali.jpg',
                  createdAt: '2023-12-01T08:00:00.000Z',
                },
              },
              category: {
                id: 'c1',
                name: 'Backend Development',
                slug: 'backend',
                createdAt: '2023-11-01T00:00:00.000Z',
              },
              tags: [
                {
                  id: 't1',
                  name: 'NestJS',
                  slug: 'nestjs',
                  createdAt: '2023-11-01T00:00:00.000Z',
                },
                {
                  id: 't2',
                  name: 'TypeScript',
                  slug: 'typescript',
                  createdAt: '2023-11-01T00:00:00.000Z',
                },
              ],
            },
          ],
          currentPage: 1,
          pageSize: 10,
          totalCount: 42,
          isAscending: false,
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Invalid page or pageSize parameter',
      },
    },
  })
  async getArticles(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('isAscending', new DefaultValuePipe(false), ParseBoolPipe) isAscending: boolean,
    @Query('includeDeleted', new DefaultValuePipe(false), ParseBoolPipe) includeDeleted: boolean,
    @Query('categorySlug') categorySlug?: string,
    @Query('tagSlug') tagSlug?: string,
    @Query('keyword') keyword?: string,
    @CurrentUser() user?: { id: string; roles: string[] },
  ) {
    // Determine user role - default to USER for unauthenticated requests
    const requesterRole = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPERADMIN')
      ? UserRole.ADMIN
      : user?.roles?.includes('AUTHOR')
        ? UserRole.AUTHOR
        : UserRole.USER;

    // Only ADMIN can include deleted articles
    const canIncludeDeleted = requesterRole === UserRole.ADMIN && includeDeleted;

    const result = await this.articlesService.getPagedArticles({
      requesterRole,
      requesterUserId: user?.id,
      categorySlug,
      tagSlug,
      keyword,
      page,
      pageSize,
      isAscending,
      includeDeleted: canIncludeDeleted,
    });

    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Get('id/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get article by ID',
    description:
      'Retrieve a single article by ID. Authors can access their own articles, admins can access any article.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Article UUID',
    example: 'a1b2c3d4-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved article',
    type: ArticleResponseDto,
  })
  async getArticleById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    const requesterRole = this.resolveRequesterRole(user?.roles);
    const result = await this.articlesService.getArticleById(
      id,
      requesterRole,
      user?.id,
    );

    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get article by slug',
    description: 'Retrieve a single article by its slug. Access is controlled based on user role and article visibility.',
  })
  @ApiParam({
    name: 'slug',
    type: String,
    description: 'Article slug',
    example: 'introduction-to-nestjs',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved article',
    schema: {
      example: {
        success: true,
        data: {
          id: 'a1b2c3d4-e89b-12d3-a456-426614174000',
          title: 'Introduction to NestJS',
          slug: 'introduction-to-nestjs',
          content: '<p>NestJS is a progressive Node.js framework...</p>',
          isPublished: true,
          createdAt: '2024-01-01T10:00:00.000Z',
          author: {
            id: 'u123',
            username: 'ali_developer',
            profile: {
              id: 'p123',
              displayName: 'Ali Yılmaz',
              bio: 'Backend developer',
              profileImageUrl: 'https://example.com/profiles/ali.jpg',
              createdAt: '2023-12-01T08:00:00.000Z',
            },
          },
          category: {
            id: 'c1',
            name: 'Backend Development',
            slug: 'backend',
            createdAt: '2023-11-01T00:00:00.000Z',
          },
          tags: [
            {
              id: 't1',
              name: 'NestJS',
              slug: 'nestjs',
              createdAt: '2023-11-01T00:00:00.000Z',
            },
          ],
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found or access denied',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Article not found or access denied',
      },
    },
  })
  async getArticleBySlug(@Param('slug') slug: string) {
    // For public access, assume USER role
    const result = await this.articlesService.getArticleBySlug(
      slug,
      UserRole.USER,
      undefined,
    );

    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create new article',
    description: 'Create a new article. Requires AUTHOR, ADMIN, or SUPERADMIN role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Article successfully created',
    schema: {
      example: {
        success: true,
        data: {
          id: 'new-article-uuid',
          title: 'Getting Started with TypeORM',
          slug: 'getting-started-with-typeorm',
          content: '<p>TypeORM is an ORM that can run in Node.js...</p>',
          isPublished: false,
          createdAt: '2024-01-15T14:30:00.000Z',
          author: {
            id: 'u123',
            username: 'ali_developer',
          },
          category: {
            id: 'c2',
            name: 'Databases',
            slug: 'databases',
            createdAt: '2023-11-01T00:00:00.000Z',
          },
          tags: [],
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or duplicate slug',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Article with this slug already exists',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async createArticle(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    const result = await this.articlesService.createArticle(
      createArticleDto,
      user.id,
    );

    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update article',
    description: 'Update an existing article. Authors can only update their own articles. Admins can update any article.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Article UUID',
    example: 'a1b2c3d4-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Article successfully updated',
    schema: {
      example: {
        success: true,
        data: {
          id: 'a1b2c3d4-e89b-12d3-a456-426614174000',
          title: 'Introduction to NestJS (Updated)',
          slug: 'introduction-to-nestjs',
          content: '<p>Updated content here...</p>',
          isPublished: true,
          createdAt: '2024-01-01T10:00:00.000Z',
          author: {
            id: 'u123',
            username: 'ali_developer',
          },
          category: {
            id: 'c1',
            name: 'Backend Development',
            slug: 'backend',
            createdAt: '2023-11-01T00:00:00.000Z',
          },
          tags: [],
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - cannot update this article',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Access denied: You cannot update this article',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Article not found',
      },
    },
  })
  async updateArticle(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    const userRole = this.resolveRequesterRole(user?.roles);

    const result = await this.articlesService.updateArticle(
      id,
      updateArticleDto,
      userRole,
      user.id,
    );

    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Put(':id/restore')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Restore article',
    description: 'Restore a soft-deleted article. Authors can restore their own articles, admins can restore any article.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Article UUID',
    example: 'a1b2c3d4-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Article successfully restored',
    schema: {
      example: {
        success: true,
        data: null,
        errorMessage: null,
      },
    },
  })
  async restoreArticle(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    const userRole = this.resolveRequesterRole(user?.roles);
    const result = await this.articlesService.restoreArticle(
      id,
      userRole,
      user.id,
    );

    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Soft delete article',
    description: 'Soft delete an article (sets isDeleted flag). Authors can only delete their own articles. Admins can delete any article.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Article UUID',
    example: 'a1b2c3d4-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Article successfully deleted',
    schema: {
      example: {
        success: true,
        data: null,
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - cannot delete this article',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Access denied: You cannot delete this article',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Article not found',
      },
    },
  })
  async softDeleteArticle(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    const userRole = this.resolveRequesterRole(user?.roles);

    const result = await this.articlesService.softDeleteArticle(
      id,
      userRole,
      user.id,
    );

    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Delete(':id/hard')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Hard delete article (permanent)',
    description: 'Permanently delete an article from the database. Only ADMIN and SUPERADMIN roles can perform this action.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Article UUID',
    example: 'a1b2c3d4-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Article permanently deleted',
    schema: {
      example: {
        success: true,
        data: null,
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Access denied: Only admins can permanently delete articles',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Article not found',
      },
    },
  })
  async hardDeleteArticle(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    const userRole = this.resolveRequesterRole(user?.roles);

    const result = await this.articlesService.hardDeleteArticle(id, userRole);

    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload image for article',
    description:
      'Upload an image for an article. Authors can upload only for their own articles. Admins can upload for any article.',
  })
  @ApiParam({
    name: 'id',
    description: 'Article UUID',
    example: 'a1b2c3d4-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Image upload payload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded',
    schema: {
      example: {
        success: true,
        data: {
          imageId: 'img-uuid',
          url: '/uploads/articles/article-uuid/file.jpg',
        },
        errorMessage: null,
      },
    },
  })
  async uploadArticleImage(
    @Param('id') id: string,
    @UploadedFile() file: Multer.File,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    const requesterRole = this.resolveRequesterRole(user?.roles);
    const result = await this.articlesService.uploadArticleImage(
      id,
      file,
      requesterRole,
      user.id,
    );

    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  private resolveRequesterRole(roles?: string[]): UserRole {
    if (roles?.includes(UserRole.SUPERADMIN)) {
      return UserRole.SUPERADMIN;
    }
    if (roles?.includes(UserRole.ADMIN)) {
      return UserRole.ADMIN;
    }
    if (roles?.includes(UserRole.AUTHOR)) {
      return UserRole.AUTHOR;
    }
    return UserRole.USER;
  }
}
