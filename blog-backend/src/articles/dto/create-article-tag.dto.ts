import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateArticleTagDto {
  @ApiProperty({
    description: 'UUID of the article',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  articleId: string;

  @ApiProperty({
    description: 'UUID of the tag',
    example: '987fcdeb-51a2-43f7-9876-543210fedcba',
  })
  @IsUUID()
  @IsNotEmpty()
  tagId: string;
}
