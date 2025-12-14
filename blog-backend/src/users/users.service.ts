import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole as UserRoleEntity } from '../roles/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { ServiceResponse } from '../common/service-response';
import { UserRole } from '../auth/enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Get all users (ADMIN only)
   */
  async getAllUsers(): Promise<ServiceResponse<UserResponseDto[]>> {
    try {
      const users = await this.userRepository.find({
        relations: ['profile', 'userRoles', 'userRoles.role'],
        order: { createdAt: 'DESC' },
      });

      const dtos = users.map((user) => this.mapToUserResponseDto(user));
      return ServiceResponse.ok(dtos);
    } catch (error) {
      console.error('Get all users error:', error);
      return ServiceResponse.fail('Failed to retrieve users');
    }
  }

  /**
   * Get user by ID (ADMIN only)
   */
  async getUserById(userId: string): Promise<ServiceResponse<UserResponseDto>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['profile', 'userRoles', 'userRoles.role'],
      });

      if (!user) {
        return ServiceResponse.fail('User not found');
      }

      return ServiceResponse.ok(this.mapToUserResponseDto(user));
    } catch (error) {
      console.error('Get user by ID error:', error);
      return ServiceResponse.fail('Failed to retrieve user');
    }
  }

  /**
   * Get current authenticated user (any authenticated user)
   */
  async getCurrentUser(userId: string): Promise<ServiceResponse<UserResponseDto>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['profile', 'userRoles', 'userRoles.role'],
      });

      if (!user) {
        return ServiceResponse.fail('User not found');
      }

      if (!user.isActive) {
        return ServiceResponse.fail('User account is deactivated');
      }

      return ServiceResponse.ok(this.mapToUserResponseDto(user));
    } catch (error) {
      console.error('Get current user error:', error);
      return ServiceResponse.fail('Failed to retrieve user');
    }
  }

  /**
   * Assign a role to a user (ADMIN only)
   */
  async assignRoleToUser(
    userId: string,
    roleName: UserRole,
  ): Promise<ServiceResponse<void>> {
    try {
      // Find user
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return ServiceResponse.fail('User not found');
      }

      if (!user.isActive) {
        return ServiceResponse.fail('Cannot assign role to deactivated user');
      }

      // Find role by name
      const role = await this.roleRepository.findOne({
        where: { name: roleName },
      });

      if (!role) {
        return ServiceResponse.fail(`Role "${roleName}" not found`);
      }

      // Check if user already has this role
      const existingUserRole = await this.userRoleRepository.findOne({
        where: {
          userId: user.id,
          roleId: role.id,
        },
      });

      if (existingUserRole) {
        return ServiceResponse.fail('User already has this role');
      }

      // Create UserRole record
      const userRole = this.userRoleRepository.create({
        userId: user.id,
        roleId: role.id,
      });

      await this.userRoleRepository.save(userRole);

      // TODO: Log this action in LogService when implemented
      console.log(`Role "${roleName}" assigned to user ${userId}`);

      return ServiceResponse.ok(null);
    } catch (error) {
      console.error('Assign role error:', error);
      return ServiceResponse.fail('Failed to assign role to user');
    }
  }

  /**
   * Remove a role from a user (ADMIN only)
   */
  async removeRoleFromUser(
    userId: string,
    roleName: UserRole,
  ): Promise<ServiceResponse<void>> {
    try {
      // Find user
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return ServiceResponse.fail('User not found');
      }

      // Find role by name
      const role = await this.roleRepository.findOne({
        where: { name: roleName },
      });

      if (!role) {
        return ServiceResponse.fail(`Role "${roleName}" not found`);
      }

      // Find UserRole record
      const userRole = await this.userRoleRepository.findOne({
        where: {
          userId: user.id,
          roleId: role.id,
        },
      });

      if (!userRole) {
        return ServiceResponse.fail('User does not have this role');
      }

      // Business rule: Prevent removing the last ADMIN role from the system
      if (roleName === UserRole.ADMIN || roleName === UserRole.SUPERADMIN) {
        const adminCount = await this.userRoleRepository
          .createQueryBuilder('ur')
          .innerJoin('ur.role', 'role')
          .where('role.name IN (:...roles)', {
            roles: [UserRole.ADMIN, UserRole.SUPERADMIN],
          })
          .getCount();

        if (adminCount <= 1) {
          return ServiceResponse.fail(
            'Cannot remove the last admin role from the system',
          );
        }
      }

      // Remove UserRole record
      await this.userRoleRepository.remove(userRole);

      // TODO: Log this action in LogService when implemented
      console.log(`Role "${roleName}" removed from user ${userId}`);

      return ServiceResponse.ok(null);
    } catch (error) {
      console.error('Remove role error:', error);
      return ServiceResponse.fail('Failed to remove role from user');
    }
  }

  /**
   * Deactivate a user (ADMIN only)
   * Does NOT hard delete - sets isActive to false
   */
  async deactivateUser(userId: string): Promise<ServiceResponse<void>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['userRoles', 'userRoles.role'],
      });

      if (!user) {
        return ServiceResponse.fail('User not found');
      }

      if (!user.isActive) {
        return ServiceResponse.fail('User is already deactivated');
      }

      // Business rule: Prevent deactivating the last admin
      const isAdmin = user.userRoles?.some(
        (ur) =>
          ur.role?.name === UserRole.ADMIN ||
          ur.role?.name === UserRole.SUPERADMIN,
      );

      if (isAdmin) {
        const activeAdminCount = await this.userRepository
          .createQueryBuilder('user')
          .innerJoin('user.userRoles', 'ur')
          .innerJoin('ur.role', 'role')
          .where('user.isActive = :isActive', { isActive: true })
          .andWhere('role.name IN (:...roles)', {
            roles: [UserRole.ADMIN, UserRole.SUPERADMIN],
          })
          .getCount();

        if (activeAdminCount <= 1) {
          return ServiceResponse.fail(
            'Cannot deactivate the last active admin user',
          );
        }
      }

      // Deactivate user
      user.isActive = false;
      await this.userRepository.save(user);

      // TODO: Log this action in LogService when implemented
      console.log(`User ${userId} deactivated`);

      return ServiceResponse.ok(null);
    } catch (error) {
      console.error('Deactivate user error:', error);
      return ServiceResponse.fail('Failed to deactivate user');
    }
  }

  /**
   * Delete own account (soft delete - authenticated user)
   * Sets isActive to false
   */
  async deleteSelfAccount(userId: string): Promise<ServiceResponse<void>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['userRoles', 'userRoles.role'],
      });

      if (!user) {
        return ServiceResponse.fail('User not found');
      }

      if (!user.isActive) {
        return ServiceResponse.fail('Account is already deactivated');
      }

      // Business rule: Prevent last admin from deleting their account
      const isAdmin = user.userRoles?.some(
        (ur) =>
          ur.role?.name === UserRole.ADMIN ||
          ur.role?.name === UserRole.SUPERADMIN,
      );

      if (isAdmin) {
        const activeAdminCount = await this.userRepository
          .createQueryBuilder('user')
          .innerJoin('user.userRoles', 'ur')
          .innerJoin('ur.role', 'role')
          .where('user.isActive = :isActive', { isActive: true })
          .andWhere('role.name IN (:...roles)', {
            roles: [UserRole.ADMIN, UserRole.SUPERADMIN],
          })
          .getCount();

        if (activeAdminCount <= 1) {
          return ServiceResponse.fail(
            'Cannot delete account: You are the last active admin',
          );
        }
      }

      // Soft delete (deactivate)
      user.isActive = false;
      await this.userRepository.save(user);

      console.log(`User ${userId} deleted their own account (soft delete)`);

      return ServiceResponse.ok(null);
    } catch (error) {
      console.error('Delete self account error:', error);
      return ServiceResponse.fail('Failed to delete account');
    }
  }

  /**
   * Hard delete user (ADMIN only)
   * Permanently removes user and all related data from database
   */
  async hardDeleteUser(
    userId: string,
    requesterId: string,
  ): Promise<ServiceResponse<void>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['userRoles', 'userRoles.role', 'profile'],
      });

      if (!user) {
        return ServiceResponse.fail('User not found');
      }

      // Prevent admin from deleting themselves
      if (userId === requesterId) {
        return ServiceResponse.fail('Cannot delete your own account via hard delete');
      }

      // Business rule: Prevent deleting last admin
      const isAdmin = user.userRoles?.some(
        (ur) =>
          ur.role?.name === UserRole.ADMIN ||
          ur.role?.name === UserRole.SUPERADMIN,
      );

      if (isAdmin) {
        const activeAdminCount = await this.userRepository
          .createQueryBuilder('user')
          .innerJoin('user.userRoles', 'ur')
          .innerJoin('ur.role', 'role')
          .where('user.isActive = :isActive', { isActive: true })
          .andWhere('role.name IN (:...roles)', {
            roles: [UserRole.ADMIN, UserRole.SUPERADMIN],
          })
          .getCount();

        if (activeAdminCount <= 1) {
          return ServiceResponse.fail(
            'Cannot delete the last admin user',
          );
        }
      }

      // Delete UserRole records first (foreign key constraint)
      await this.userRoleRepository.delete({ userId: user.id });

      // Delete user profile if exists
      if (user.profile) {
        await this.userRepository.manager.remove(user.profile);
      }

      // Hard delete user
      await this.userRepository.remove(user);

      console.log(`User ${userId} permanently deleted by admin ${requesterId}`);

      return ServiceResponse.ok(null);
    } catch (error) {
      console.error('Hard delete user error:', error);
      return ServiceResponse.fail('Failed to permanently delete user');
    }
  }

  /**
   * Map User entity to UserResponseDto
   */
  private mapToUserResponseDto(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.username = user.username;
    dto.email = user.email;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;

    // Map profile if exists
    if (user.profile) {
      const profileDto = new UserProfileResponseDto();
      profileDto.id = user.profile.id;
      profileDto.displayName = user.profile.displayName;
      profileDto.bio = user.profile.bio;
      profileDto.profileImageUrl = user.profile.profileImageUrl;
      profileDto.createdAt = user.profile.createdAt;
      dto.profile = profileDto;
    }

    // Map roles
    if (user.userRoles && user.userRoles.length > 0) {
      dto.roles = user.userRoles
        .filter((ur) => ur.role) // Ensure role exists
        .map((ur) => ur.role.name);
    } else {
      dto.roles = [];
    }

    return dto;
  }
}
