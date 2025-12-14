import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateUserProfileDto {
  @ApiPropertyOptional({
    description: 'Display name for the user',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({
    description: 'User biography',
    example: 'Full-stack developer passionate about NestJS and TypeScript',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    description: 'URL to the user profile image',
    example: 'https://example.com/profiles/john-doe.jpg',
  })
  @IsString()
  @IsOptional()
  profileImageUrl?: string;
}
