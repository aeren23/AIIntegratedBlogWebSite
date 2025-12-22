import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

@ApiTags('Comments')
@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('articles/:articleId/comments')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get comments for an article (threaded)',
    description:
      'Returns a hierarchical (parent → children) comment tree. Deleted comments may be visible to admins.',
  })
  @ApiParam({
    name: 'articleId',
    description: 'UUID of the article',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Threaded comments for the article',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'c1c1c1c1-1111-1111-1111-111111111111',
            content: 'Great article!',
            createdAt: '2024-01-01T10:00:00.000Z',
            user: {
              id: 'u1u1u1u1-1111-1111-1111-111111111111',
              username: 'johndoe',
              email: 'john@example.com',
              isActive: true,
              roles: ['USER'],
              createdAt: '2024-01-01T09:00:00.000Z',
              profile: {
                id: 'p1p1p1p1-1111-1111-1111-111111111111',
                displayName: 'John Doe',
                bio: null,
                profileImageUrl: null,
                createdAt: '2024-01-01T09:00:00.000Z',
              },
            },
            children: [
              {
                id: 'c2c2c2c2-2222-2222-2222-222222222222',
                content: 'Thanks!',
                createdAt: '2024-01-01T10:05:00.000Z',
                user: {
                  id: 'u2u2u2u2-2222-2222-2222-222222222222',
                  username: 'author_user',
                  email: 'author@example.com',
                  isActive: true,
                  roles: ['AUTHOR'],
                  createdAt: '2024-01-01T08:00:00.000Z',
                },
                children: [],
              },
            ],
          },
          {
            id: 'c3c3c3c3-3333-3333-3333-333333333333',
            content: '[deleted]',
            createdAt: '2024-01-01T11:00:00.000Z',
            user: {
              id: 'u3u3u3u3-3333-3333-3333-333333333333',
              username: 'some_user',
              email: 'some@example.com',
              isActive: true,
              roles: ['USER'],
              createdAt: '2024-01-01T07:00:00.000Z',
            },
            children: [
              {
                id: 'c4c4c4c4-4444-4444-4444-444444444444',
                content: 'Replying to keep context.',
                createdAt: '2024-01-01T11:10:00.000Z',
                user: {
                  id: 'u4u4u4u4-4444-4444-4444-444444444444',
                  username: 'reply_user',
                  email: 'reply@example.com',
                  isActive: true,
                  roles: ['USER'],
                  createdAt: '2024-01-01T06:00:00.000Z',
                },
                children: [],
              },
            ],
          },
        ],
        errorMessage: null,
      },
    },
  })
  async getCommentsByArticle(
    @Param('articleId') articleId: string,
    @CurrentUser() user?: { id: string; roles: string[] },
  ): Promise<{
    success: boolean;
    data: CommentResponseDto[] | null;
    errorMessage: string | null;
  }> {
    const requesterRole = this.resolveRequesterRole(user?.roles);
    const result = await this.commentService.getCommentsByArticle(articleId, requesterRole);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Post('articles/:articleId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a comment on an article',
    description:
      'Creates a top-level comment or a reply. Reply must belong to the same article and cannot target a deleted comment.',
  })
  @ApiParam({
    name: 'articleId',
    description: 'UUID of the article',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created',
    schema: {
      example: {
        success: true,
        data: {
          id: 'c1c1c1c1-1111-1111-1111-111111111111',
          content: 'Great article!',
          createdAt: '2024-01-01T10:00:00.000Z',
          user: {
            id: 'u1u1u1u1-1111-1111-1111-111111111111',
            username: 'johndoe',
            email: 'john@example.com',
            isActive: true,
            roles: ['USER'],
            createdAt: '2024-01-01T09:00:00.000Z',
          },
          children: [],
        },
        errorMessage: null,
      },
    },
  })
  async createComment(
    @Param('articleId') articleId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    const result = await this.commentService.createComment(articleId, dto, user.id);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Put('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a comment',
    description: 'Only the comment owner or an ADMIN/SUPERADMIN can update. Deleted comments cannot be updated.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'UUID of the comment',
    example: 'c1c1c1c1-1111-1111-1111-111111111111',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment updated',
    schema: {
      example: {
        success: true,
        data: {
          id: 'c1c1c1c1-1111-1111-1111-111111111111',
          content: 'Updated content',
          createdAt: '2024-01-01T10:00:00.000Z',
          user: {
            id: 'u1u1u1u1-1111-1111-1111-111111111111',
            username: 'johndoe',
            email: 'john@example.com',
            isActive: true,
            roles: ['USER'],
            createdAt: '2024-01-01T09:00:00.000Z',
          },
          children: [],
        },
        errorMessage: null,
      },
    },
  })
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    const requesterRole = this.resolveRequesterRole(user?.roles);
    const result = await this.commentService.updateComment(commentId, dto, user.id, requesterRole);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Soft delete a comment',
    description:
      'Owner or ADMIN/SUPERADMIN only. Performs soft delete by setting isDeleted=true and content="[deleted]".',
  })
  @ApiParam({
    name: 'commentId',
    description: 'UUID of the comment',
    example: 'c1c1c1c1-1111-1111-1111-111111111111',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment soft-deleted',
    schema: {
      example: {
        success: true,
        data: null,
        errorMessage: null,
      },
    },
  })
  async softDeleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    const requesterRole = this.resolveRequesterRole(user?.roles);
    const result = await this.commentService.softDeleteComment(commentId, user.id, requesterRole);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Delete('comments/:commentId/permanent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Hard delete a comment (ADMIN only)',
    description: 'Permanently delete a comment. Only ADMIN and SUPERADMIN can access.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'UUID of the comment',
    example: 'c1c1c1c1-1111-1111-1111-111111111111',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment permanently deleted',
    schema: {
      example: {
        success: true,
        data: null,
        errorMessage: null,
      },
    },
  })
  async hardDeleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    const requesterRole = this.resolveRequesterRole(user?.roles);
    const result = await this.commentService.hardDeleteComment(
      commentId,
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
