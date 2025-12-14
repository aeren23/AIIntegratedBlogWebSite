import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    description: 'Name of the tag',
    example: 'JavaScript',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug for the tag',
    example: 'javascript',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;
}
