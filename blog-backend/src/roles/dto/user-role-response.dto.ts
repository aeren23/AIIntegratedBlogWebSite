import { ApiProperty } from '@nestjs/swagger';

export class UserRoleResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user-role assignment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'UUID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'UUID of the role',
    example: '987fcdeb-51a2-43f7-9876-543210fedcba',
  })
  roleId: string;

  @ApiProperty({
    description: 'Timestamp when the user-role assignment was created',
    example: '2023-12-14T10:30:00.000Z',
  })
  createdAt: Date;
}
