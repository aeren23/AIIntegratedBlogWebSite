import { ApiProperty } from '@nestjs/swagger';

export class ImageResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the image',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Public URL of the image',
    example: '/uploads/articles/123e4567-e89b-12d3-a456-426614174000/sample.jpg',
  })
  publicUrl: string;

  @ApiProperty({
    description: 'Stored file name',
    example: 'sample-image-123.jpg',
  })
  fileName: string;

  @ApiProperty({
    description: 'Stored file path on server',
    example: 'uploads/articles/123e4567-e89b-12d3-a456-426614174000/sample.jpg',
  })
  filePath: string;

  @ApiProperty({
    description: 'MIME type of the image',
    example: 'image/jpeg',
  })
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 245678,
  })
  size: number;

  @ApiProperty({
    description: 'Timestamp when the image was created',
    example: '2023-12-14T10:30:00.000Z',
  })
  createdAt: Date;
}
