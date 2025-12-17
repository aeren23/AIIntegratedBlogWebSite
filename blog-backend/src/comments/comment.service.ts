import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Article } from '../articles/entities/article.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { ServiceResponse } from '../common/service-response';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UserProfileResponseDto } from '../users/dto/user-profile-response.dto';
import { UserRole } from '../auth/enums/user-role.enum';
import { LogService } from '../logs/log.service';
import { LogAction } from '../common/enums/log-action.enum';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logService: LogService,
  ) {}

  async getCommentsByArticle(
    articleId: string,
    requesterRole: UserRole,
  ): Promise<ServiceResponse<CommentResponseDto[]>> {
    try {
      const queryBuilder = this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('user.userRoles', 'userRoles')
        .leftJoinAndSelect('userRoles.role', 'role')
        .where('comment.articleId = :articleId', { articleId })
        .orderBy('comment.createdAt', 'ASC');

      if (!this.isAdminRole(requesterRole)) {
        queryBuilder.andWhere('comment.isDeleted = :isDeleted', { isDeleted: false });
      }

      const comments = await queryBuilder.getMany();
      const tree = this.buildCommentTree(comments);
      return ServiceResponse.ok(tree);
    } catch (error) {
      console.error('Get comments error:', error);
      return ServiceResponse.fail('Failed to retrieve comments');
    }
  }

  async createComment(
    articleId: string,
    dto: CreateCommentDto,
    userId: string,
  ): Promise<ServiceResponse<CommentResponseDto>> {
    try {
      if (dto.articleId && dto.articleId !== articleId) {
        return ServiceResponse.fail('Article ID in route does not match request body');
      }

      const [article, requesterRole] = await Promise.all([
        this.articleRepository.findOne({ where: { id: articleId } }),
        this.getRequesterRoleByUserId(userId),
      ]);

      if (!article || article.isDeleted) {
        return ServiceResponse.fail('Article not found');
      }

      if (!this.isAdminRole(requesterRole) && !article.isPublished) {
        return ServiceResponse.fail('Article is not published');
      }

      const parentCommentId = dto.parentCommentId ?? null;
      if (parentCommentId) {
        const parent = await this.commentRepository.findOne({
          where: { id: parentCommentId, articleId },
        });

        if (!parent) {
          return ServiceResponse.fail('Parent comment not found');
        }

        if (parent.isDeleted) {
          return ServiceResponse.fail('Cannot reply to a deleted comment');
        }
      }

      const comment = this.commentRepository.create({
        content: dto.content,
        articleId,
        userId,
        parentCommentId,
        createdById: userId,
      });

      const saved = await this.commentRepository.save(comment);

      void this.logService.createLog({
        userId,
        action: LogAction.CREATE,
        entityType: 'Comment',
        entityId: saved.id,
        description: parentCommentId ? 'Comment reply created' : 'Comment created',
        metadata: {
          articleId,
          commentAuthorId: userId,
          parentCommentId,
          contentLength: dto.content?.length ?? 0,
        },
      });

      const full = await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('user.userRoles', 'userRoles')
        .leftJoinAndSelect('userRoles.role', 'role')
        .where('comment.id = :id', { id: saved.id })
        .getOne();

      if (!full) {
        return ServiceResponse.fail('Comment created but could not be retrieved');
      }

      return ServiceResponse.ok(this.mapToCommentResponseDto(full));
    } catch (error) {
      console.error('Create comment error:', error);
      return ServiceResponse.fail('Failed to create comment');
    }
  }

  async updateComment(
    commentId: string,
    dto: UpdateCommentDto,
    userId: string,
    requesterRole: UserRole,
  ): Promise<ServiceResponse<CommentResponseDto>> {
    try {
      const comment = await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('user.userRoles', 'userRoles')
        .leftJoinAndSelect('userRoles.role', 'role')
        .where('comment.id = :commentId', { commentId })
        .getOne();

      if (!comment) {
        return ServiceResponse.fail('Comment not found');
      }

      if (comment.isDeleted) {
        return ServiceResponse.fail('Deleted comments cannot be updated');
      }

      const canEdit =
        comment.userId === userId || this.isAdminRole(requesterRole);
      if (!canEdit) {
        return ServiceResponse.fail('You are not allowed to update this comment');
      }

      if (dto.articleId && dto.articleId !== comment.articleId) {
        return ServiceResponse.fail('Changing articleId is not allowed');
      }

      if (
        dto.parentCommentId !== undefined &&
        dto.parentCommentId !== comment.parentCommentId
      ) {
        return ServiceResponse.fail('Changing parentCommentId is not allowed');
      }

      if (dto.content !== undefined) {
        comment.content = dto.content;
      }

      comment.updatedById = userId;

      const updated = await this.commentRepository.save(comment);
      return ServiceResponse.ok(this.mapToCommentResponseDto(updated));
    } catch (error) {
      console.error('Update comment error:', error);
      return ServiceResponse.fail('Failed to update comment');
    }
  }

  async softDeleteComment(
    commentId: string,
    userId: string,
    requesterRole: UserRole,
  ): Promise<ServiceResponse<void>> {
    try {
      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
      });

      if (!comment) {
        return ServiceResponse.fail('Comment not found');
      }

      const canDelete =
        comment.userId === userId || this.isAdminRole(requesterRole);
      if (!canDelete) {
        return ServiceResponse.fail('You are not allowed to delete this comment');
      }

      if (comment.isDeleted && comment.content === '[deleted]') {
        return ServiceResponse.ok(null);
      }

      comment.isDeleted = true;
      comment.content = '[deleted]';
      comment.updatedById = userId;
      await this.commentRepository.save(comment);

      void this.logService.createLog({
        userId,
        action: LogAction.DELETE,
        entityType: 'Comment',
        entityId: commentId,
        description: 'Comment deleted',
        metadata: {
          articleId: comment.articleId,
          commentAuthorId: comment.userId,
          parentCommentId: comment.parentCommentId,
          selfDelete: comment.userId === userId,
          requesterRole,
        },
      });

      return ServiceResponse.ok(null);
    } catch (error) {
      console.error('Soft delete comment error:', error);
      return ServiceResponse.fail('Failed to delete comment');
    }
  }

  private isAdminRole(role: UserRole): boolean {
    return role === UserRole.ADMIN || role === UserRole.SUPERADMIN;
  }

  private async getRequesterRoleByUserId(userId: string): Promise<UserRole> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user || user.isDeleted) {
      return UserRole.USER;
    }

    const roleNames =
      user.userRoles?.map((ur) => ur.role?.name).filter(Boolean) ?? [];

    if (roleNames.includes(UserRole.SUPERADMIN)) {
      return UserRole.SUPERADMIN;
    }
    if (roleNames.includes(UserRole.ADMIN)) {
      return UserRole.ADMIN;
    }
    if (roleNames.includes(UserRole.AUTHOR)) {
      return UserRole.AUTHOR;
    }

    return UserRole.USER;
  }

  private buildCommentTree(comments: Comment[]): CommentResponseDto[] {
    const nodeById = new Map<string, CommentResponseDto>();
    const parentIdById = new Map<string, string | null>();

    for (const comment of comments) {
      nodeById.set(comment.id, this.mapToCommentResponseDto(comment));
      parentIdById.set(comment.id, comment.parentCommentId ?? null);
    }

    const roots: CommentResponseDto[] = [];

    for (const [id, node] of nodeById.entries()) {
      const parentId = parentIdById.get(id) ?? null;
      if (!parentId) {
        roots.push(node);
        continue;
      }

      const parent = nodeById.get(parentId);
      if (!parent) {
        roots.push(node);
        continue;
      }

      parent.children.push(node);
    }

    return roots;
  }

  private mapToCommentResponseDto(comment: Comment): CommentResponseDto {
    const dto = new CommentResponseDto();
    dto.id = comment.id;
    dto.content = comment.content;
    dto.createdAt = comment.createdAt;
    dto.user = this.mapToUserResponseDto(comment.user);
    dto.children = [];
    return dto;
  }

  private mapToUserResponseDto(user?: User): UserResponseDto {
    const dto = new UserResponseDto();

    if (!user) {
      dto.id = '';
      dto.username = '';
      dto.email = '';
      dto.isActive = false;
      dto.roles = [];
      dto.createdAt = new Date(0);
      return dto;
    }

    dto.id = user.id;
    dto.username = user.username;
    dto.email = user.email;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;

    if (user.profile) {
      const profileDto = new UserProfileResponseDto();
      profileDto.id = user.profile.id;
      profileDto.displayName = user.profile.displayName;
      profileDto.bio = user.profile.bio;
      profileDto.profileImageUrl = user.profile.profileImageUrl;
      profileDto.createdAt = user.profile.createdAt;
      dto.profile = profileDto;
    }

    dto.roles =
      user.userRoles?.filter((ur) => ur.role).map((ur) => ur.role.name) ?? [];

    return dto;
  }
}
