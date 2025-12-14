import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class CommentResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the comment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Content of the comment',
    example: 'Great article! Thanks for sharing.',
  })
  content: string;

  @ApiProperty({
    description: 'Timestamp when the comment was created',
    example: '2023-12-14T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User who created the comment',
    type: () => UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Nested replies to this comment',
    type: () => [CommentResponseDto],
  })
  children: CommentResponseDto[];
}
