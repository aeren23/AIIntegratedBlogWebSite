import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({
    description: 'UUID of the article',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  articleId: string;

  @ApiProperty({
    description: 'URL of the image',
    example: 'https://example.com/images/sample.jpg',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'Filename of the image',
    example: 'sample-image-123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  filename: string;
}
