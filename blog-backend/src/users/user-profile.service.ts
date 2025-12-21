import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Express } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { ServiceResponse } from '../common/service-response';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { LogService } from '../logs/log.service';
import { LogAction } from '../common/enums/log-action.enum';
import type { Multer } from 'multer';


@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly logService: LogService,
  ) {}

  /**
   * Get the authenticated user's profile
   */
  async getMyProfile(
    userId: string,
  ): Promise<ServiceResponse<UserProfileResponseDto | null>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, isDeleted: false },
      });

      if (!user || !user.isActive) {
        return ServiceResponse.fail('User not found or inactive');
      }

      const profile = await this.userProfileRepository.findOne({
        where: { userId },
      });

      if (!profile) {
        return ServiceResponse.ok(null);
      }

      return ServiceResponse.ok(this.mapToResponseDto(profile));
    } catch (error) {
      console.error('Get my profile error:', error);
      return ServiceResponse.fail('Failed to retrieve profile');
    }
  }

  /**
   * Create a profile for the authenticated user
   */
  async createMyProfile(
    userId: string,
    dto: CreateUserProfileDto,
  ): Promise<ServiceResponse<UserProfileResponseDto>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, isDeleted: false },
      });

      if (!user || !user.isActive) {
        return ServiceResponse.fail('User not found or inactive');
      }

      const existingProfile = await this.userProfileRepository.findOne({
        where: { userId },
      });

      if (existingProfile) {
        return ServiceResponse.fail('Profile already exists');
      }

      if (dto.profileImageUrl) {
        return ServiceResponse.fail(
          'Profile image must be uploaded via the avatar endpoint',
        );
      }

      const profile = this.userProfileRepository.create({
        userId,
        displayName: dto.displayName ?? user.username,
        bio: dto.bio ?? null,
        createdById: userId,
      });

      const saved = await this.userProfileRepository.save(profile);
      return ServiceResponse.ok(this.mapToResponseDto(saved));
    } catch (error) {
      console.error('Create my profile error:', error);
      return ServiceResponse.fail('Failed to create profile');
    }
  }

  /**
   * Update authenticated user's profile
   */
  async updateMyProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<ServiceResponse<UserProfileResponseDto>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, isDeleted: false },
      });

      if (!user || !user.isActive) {
        return ServiceResponse.fail('User not found or inactive');
      }

      const profile = await this.userProfileRepository.findOne({
        where: { userId },
      });

      if (!profile) {
        return ServiceResponse.fail('Profile not found');
      }

      if (dto.profileImageUrl) {
        return ServiceResponse.fail(
          'Profile image must be updated via the avatar upload endpoint',
        );
      }

      if (dto.displayName !== undefined) {
        profile.displayName = dto.displayName;
      }

      if (dto.bio !== undefined) {
        profile.bio = dto.bio;
      }

      profile.updatedById = userId;

      const updated = await this.userProfileRepository.save(profile);
      return ServiceResponse.ok(this.mapToResponseDto(updated));
    } catch (error) {
      console.error('Update my profile error:', error);
      return ServiceResponse.fail('Failed to update profile');
    }
  }

  /**
   * Upload or replace user avatar
   */
  async uploadAvatar(
    userId: string,
    file: Multer.File,
  ): Promise<ServiceResponse<UserProfileResponseDto>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, isDeleted: false },
      });

      if (!user || !user.isActive) {
        return ServiceResponse.fail('User not found or inactive');
      }

      if (!file) {
        return ServiceResponse.fail('No file uploaded');
      }

      const allowedTypes: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
      };

      const extension = allowedTypes[file.mimetype];
      if (!extension) {
        return ServiceResponse.fail(
          'Unsupported file type. Allowed types: image/jpeg, image/png, image/webp',
        );
      }

      const maxSize = 2 * 1024 * 1024; // 2 MB
      if (file.size > maxSize) {
        return ServiceResponse.fail('File too large. Max size is 2MB');
      }

      let profile =
        (await this.userProfileRepository.findOne({
          where: { userId },
        })) ||
        this.userProfileRepository.create({
          userId,
          displayName: user.username,
          bio: null,
          createdById: userId,
        });

      const previousAvatarUrl = profile.profileImageUrl;
      const avatarsDir = path.join(process.cwd(), 'uploads', 'avatars');
      await fs.mkdir(avatarsDir, { recursive: true });

      const filename = `user-${userId}.${extension}`;
      const absolutePath = path.join(avatarsDir, filename);

      const previousPath = this.resolveAvatarAbsolutePath(
        previousAvatarUrl,
      );

      if (previousPath && previousPath !== absolutePath) {
        await this.deleteFileIfExists(previousPath);
      }

      if (!file.buffer) {
        return ServiceResponse.fail('Invalid file upload');
      }

      await fs.writeFile(absolutePath, file.buffer);

      const publicPath = path.posix.join('/uploads/avatars', filename);
      profile.profileImageUrl = publicPath;
      profile.updatedById = userId;

      const saved = await this.userProfileRepository.save(profile);

      const overwroteExisting = Boolean(previousAvatarUrl);
      void this.logService.createLog({
        userId,
        action: LogAction.UPLOAD,
        entityType: 'UserProfile',
        entityId: saved.id,
        description: overwroteExisting ? 'Avatar updated' : 'Avatar uploaded',
        metadata: {
          overwroteExisting,
          mimeType: file.mimetype,
          size: file.size,
          publicPath,
        },
      });

      return ServiceResponse.ok(this.mapToResponseDto(saved));
    } catch (error) {
      console.error('Upload avatar error:', error);
      return ServiceResponse.fail('Failed to upload avatar');
    }
  }

  private mapToResponseDto(profile: UserProfile): UserProfileResponseDto {
    const dto = new UserProfileResponseDto();
    dto.id = profile.id;
    dto.displayName = profile.displayName;
    dto.bio = profile.bio;
    dto.profileImageUrl = profile.profileImageUrl;
    dto.createdAt = profile.createdAt;
    return dto;
  }

  private resolveAvatarAbsolutePath(url?: string | null): string | null {
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
        console.error('Failed to delete avatar file:', {
          filePath,
          message: (error as Error).message,
        });
      }
    }
  }
}
