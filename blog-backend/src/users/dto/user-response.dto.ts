import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserProfileResponseDto } from './user-profile-response.dto';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'List of role names assigned to the user',
    example: ['USER', 'AUTHOR'],
    type: [String],
  })
  roles: string[];

  @ApiProperty({
    description: 'Timestamp when the user was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'User profile information',
    type: () => UserProfileResponseDto,
  })
  profile?: UserProfileResponseDto;
}
