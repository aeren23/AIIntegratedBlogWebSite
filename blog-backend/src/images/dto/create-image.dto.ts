import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({
    description: 'UUID of the article',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  articleId: string;

  @ApiProperty({
    description: 'Public URL of the image',
    example: '/uploads/articles/123e4567-e89b-12d3-a456-426614174000/sample.jpg',
  })
  @IsString()
  @IsNotEmpty()
  publicUrl: string;

  @ApiProperty({
    description: 'Stored file name',
    example: 'sample-image-123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: 'Stored file path on server',
    example: 'uploads/articles/123e4567-e89b-12d3-a456-426614174000/sample.jpg',
  })
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty({
    description: 'MIME type of the image',
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 245678,
  })
  @IsNumber()
  @IsNotEmpty()
  size: number;
}
