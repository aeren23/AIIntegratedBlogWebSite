import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RoleResponseDto } from './dto/role-response.dto';
import { ServiceResponse } from '../common/service-response';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Get all roles
   * Roles are seeded (USER, AUTHOR, ADMIN, SUPERADMIN)
   */
  async getAllRoles(): Promise<ServiceResponse<RoleResponseDto[]>> {
    try {
      const roles = await this.roleRepository.find({
        order: { name: 'ASC' },
      });

      const dtos = roles.map((role) => this.mapToRoleResponseDto(role));
      return ServiceResponse.ok(dtos);
    } catch (error) {
      console.error('Get all roles error:', error);
      return ServiceResponse.fail('Failed to retrieve roles');
    }
  }

  /**
   * Map Role entity to RoleResponseDto
   */
  private mapToRoleResponseDto(role: Role): RoleResponseDto {
    const dto = new RoleResponseDto();
    dto.id = role.id;
    dto.name = role.name;
    return dto;
  }
}
