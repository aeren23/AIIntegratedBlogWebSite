import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '../../auth/enums/user-role.enum';

export class AssignRoleDto {
  @ApiProperty({
    description: 'Role to assign to the user',
    enum: UserRole,
    example: UserRole.AUTHOR,
  })
  @IsEnum(UserRole, { message: 'Invalid role. Must be USER, AUTHOR, ADMIN, or SUPERADMIN' })
  role: UserRole;
}
