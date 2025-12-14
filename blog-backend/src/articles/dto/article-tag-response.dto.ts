import { ApiProperty } from '@nestjs/swagger';

export class ArticleTagResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the article-tag assignment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'UUID of the article',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  articleId: string;

  @ApiProperty({
    description: 'UUID of the tag',
    example: '987fcdeb-51a2-43f7-9876-543210fedcba',
  })
  tagId: string;

  @ApiProperty({
    description: 'Timestamp when the article-tag assignment was created',
    example: '2023-12-14T10:30:00.000Z',
  })
  createdAt: Date;
}
