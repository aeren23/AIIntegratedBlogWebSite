import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user profile',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Display name for the user',
    example: 'John Doe',
    nullable: true,
  })
  displayName: string | null;

  @ApiPropertyOptional({
    description: 'User biography',
    example: 'Full-stack developer passionate about NestJS and TypeScript',
    nullable: true,
  })
  bio: string | null;

  @ApiPropertyOptional({
    description: 'URL to the user profile image',
    example: 'https://example.com/profiles/john-doe.jpg',
    nullable: true,
  })
  profileImageUrl: string | null;

  @ApiProperty({
    description: 'Timestamp when the profile was created',
    example: '2023-12-14T10:30:00.000Z',
  })
  createdAt: Date;
}
