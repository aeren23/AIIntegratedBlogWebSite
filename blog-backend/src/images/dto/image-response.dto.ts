import { ApiProperty } from '@nestjs/swagger';

export class ImageResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the image',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'URL of the image',
    example: 'https://example.com/images/sample.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Filename of the image',
    example: 'sample-image-123.jpg',
  })
  filename: string;

  @ApiProperty({
    description: 'Timestamp when the image was created',
    example: '2023-12-14T10:30:00.000Z',
  })
  createdAt: Date;
}
