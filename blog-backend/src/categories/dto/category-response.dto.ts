import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the category',
    example: 'Technology',
  })
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug for the category',
    example: 'technology',
  })
  slug: string;

  @ApiProperty({
    description: 'Timestamp when the category was created',
    example: '2023-12-14T10:30:00.000Z',
  })
  createdAt: Date;
}
