import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateUserRoleDto {
  @ApiProperty({
    description: 'UUID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'UUID of the role',
    example: '987fcdeb-51a2-43f7-9876-543210fedcba',
  })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
