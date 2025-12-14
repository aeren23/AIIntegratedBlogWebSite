import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all roles',
    description:
      'Retrieve a list of all available roles in the system (USER, AUTHOR, ADMIN, SUPERADMIN)',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'role-uuid-1',
            name: 'USER',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'role-uuid-2',
            name: 'AUTHOR',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'role-uuid-3',
            name: 'ADMIN',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'role-uuid-4',
            name: 'SUPERADMIN',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        errorMessage: null,
      },
    },
  })
  async getAllRoles() {
    const result = await this.rolesService.getAllRoles();
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }
}
