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

  @ApiPropertyOptional({
    description: 'User profile information',
    type: () => UserProfileResponseDto,
  })
  profile?: UserProfileResponseDto;
}
