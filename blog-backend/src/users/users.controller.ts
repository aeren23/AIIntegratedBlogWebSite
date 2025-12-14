import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { AssignRoleDto } from './dto/assign-role.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Get all users (ADMIN only)',
    description: 'Retrieve a list of all users with their profiles and roles',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'uuid-1',
            username: 'johndoe',
            email: 'john@example.com',
            isActive: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            profile: {
              id: 'profile-uuid',
              displayName: 'John Doe',
              bio: 'Software developer',
              profileImageUrl: null,
              createdAt: '2024-01-01T00:00:00.000Z',
            },
            roles: ['USER', 'AUTHOR'],
          },
        ],
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllUsers() {
    const result = await this.usersService.getAllUsers();
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Get the profile of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user profile retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid-1',
          username: 'johndoe',
          email: 'john@example.com',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          profile: {
            id: 'profile-uuid',
            displayName: 'John Doe',
            bio: 'Software developer',
            profileImageUrl: null,
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          roles: ['USER', 'AUTHOR'],
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async getCurrentUser(@CurrentUser() user: { id: string }) {
    const result = await this.usersService.getCurrentUser(user.id);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Get user by ID (ADMIN only)',
    description: 'Retrieve detailed information about a specific user',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid-1',
          username: 'johndoe',
          email: 'john@example.com',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          profile: {
            id: 'profile-uuid',
            displayName: 'John Doe',
            bio: 'Software developer',
            profileImageUrl: null,
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          roles: ['USER', 'AUTHOR'],
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'User not found',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getUserById(@Param('id') id: string) {
    const result = await this.usersService.getUserById(id);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Post(':id/roles')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Assign role to user (ADMIN only)',
    description: 'Assign a role to a user. Creates a UserRole record.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({
    type: AssignRoleDto,
    description: 'Role to assign',
    examples: {
      assignAuthor: {
        summary: 'Assign AUTHOR role',
        value: { role: 'AUTHOR' },
      },
      assignAdmin: {
        summary: 'Assign ADMIN role',
        value: { role: 'ADMIN' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Role assigned successfully',
    schema: {
      example: {
        success: true,
        data: null,
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'User already has this role or invalid role',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'User already has this role',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User or role not found',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'User not found',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async assignRole(
    @Param('id') userId: string,
    @Body() body: AssignRoleDto,
  ) {
    const result = await this.usersService.assignRoleToUser(userId, body.role);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Delete(':id/roles/:role')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Remove role from user (ADMIN only)',
    description:
      'Remove a role from a user. Prevents removing the last admin role from the system.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiParam({
    name: 'role',
    description: 'Role name to remove',
    enum: UserRole,
    example: 'AUTHOR',
  })
  @ApiResponse({
    status: 200,
    description: 'Role removed successfully',
    schema: {
      example: {
        success: true,
        data: null,
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'User does not have this role or cannot remove last admin role',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Cannot remove the last admin role from the system',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User or role not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async removeRole(@Param('id') userId: string, @Param('role') role: UserRole) {
    const result = await this.usersService.removeRoleFromUser(userId, role);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Delete('me')
  @ApiOperation({
    summary: 'Delete own account (soft delete)',
    description:
      'Authenticated user can delete their own account. This is a soft delete that sets isActive to false. Last admin cannot delete their account.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    schema: {
      example: {
        success: true,
        data: null,
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Account already deactivated or cannot delete last admin',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Cannot delete account: You are the last active admin',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async deleteSelf(@CurrentUser() user: { id: string; username: string }) {
    const result = await this.usersService.deleteSelfAccount(user.id);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Deactivate user (ADMIN only)',
    description:
      'Deactivate a user account (soft delete). Sets isActive to false. Prevents deactivating the last admin.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully',
    schema: {
      example: {
        success: true,
        data: null,
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'User already deactivated or cannot deactivate last admin',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Cannot deactivate the last active admin user',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async deactivateUser(@Param('id') userId: string) {
    const result = await this.usersService.deactivateUser(userId);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Delete(':id/permanent')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Permanently delete user (ADMIN only)',
    description:
      'Permanently delete a user and all related data from database. Cannot delete own account or last admin. This action is irreversible.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID to permanently delete',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'User permanently deleted',
    schema: {
      example: {
        success: true,
        data: null,
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete own account or last admin',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Cannot delete your own account via hard delete',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async hardDeleteUser(
    @Param('id') userId: string,
    @CurrentUser() requester: { id: string; username: string },
  ) {
    const result = await this.usersService.hardDeleteUser(
      userId,
      requester.id,
    );
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }
}
