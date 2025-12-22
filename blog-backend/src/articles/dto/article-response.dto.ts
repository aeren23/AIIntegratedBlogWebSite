import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { TagResponseDto } from '../../tags/dto/tag-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class ArticleResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the article',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the article',
    example: 'Introduction to NestJS',
  })
  title: string;

  @ApiProperty({
    description: 'URL-friendly slug for the article',
    example: 'introduction-to-nestjs',
  })
  slug: string;

  @ApiProperty({
    description: 'HTML content of the article',
    example: '<p>This is an introduction to NestJS framework...</p>',
  })
  content: string;

  @ApiProperty({
    description: 'Whether the article is published',
    example: true,
  })
  isPublished: boolean;

  @ApiProperty({
    description: 'Whether the article is soft deleted',
    example: false,
  })
  isDeleted: boolean;

  @ApiProperty({
    description: 'Total number of comments attached to the article',
    example: 12,
  })
  commentsCount: number;

  @ApiProperty({
    description: 'Timestamp when the article was created',
    example: '2023-12-14T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Author of the article',
    type: () => UserResponseDto,
  })
  author: UserResponseDto;

  @ApiProperty({
    description: 'Category of the article',
    type: () => CategoryResponseDto,
  })
  category: CategoryResponseDto;

  @ApiProperty({
    description: 'Tags associated with the article',
    type: () => [TagResponseDto],
  })
  tags: TagResponseDto[];
}
