import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({
    description: 'Title of the article',
    example: 'Introduction to NestJS',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'URL-friendly slug for the article',
    example: 'introduction-to-nestjs',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'HTML content of the article',
    example: '<p>This is an introduction to NestJS framework...</p>',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'UUID of the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Whether the article is published',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Tag IDs to attach to the article',
    example: ['987fcdeb-51a2-43f7-9876-543210fedcba'],
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];
}
