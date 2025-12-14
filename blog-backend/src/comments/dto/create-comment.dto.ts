import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Content of the comment',
    example: 'Great article! Thanks for sharing.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'UUID of the article',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  articleId: string;

  @ApiPropertyOptional({
    description: 'UUID of the parent comment (for nested replies)',
    example: '987fcdeb-51a2-43f7-9876-543210fedcba',
  })
  @IsUUID()
  @IsOptional()
  parentCommentId?: string;
}
