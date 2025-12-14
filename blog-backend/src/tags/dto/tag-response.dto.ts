import { ApiProperty } from '@nestjs/swagger';

export class TagResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the tag',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the tag',
    example: 'JavaScript',
  })
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug for the tag',
    example: 'javascript',
  })
  slug: string;

  @ApiProperty({
    description: 'Timestamp when the tag was created',
    example: '2023-12-14T10:30:00.000Z',
  })
  createdAt: Date;
}
