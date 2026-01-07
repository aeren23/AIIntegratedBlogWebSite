import { IsString, IsEmail, MinLength, MaxLength, Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username or email',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Username or email is required' })
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'Unique username (3-30 characters, alphanumeric and underscore only)',
    example: 'johndoe',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(30, { message: 'Username must be at most 30 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @ApiProperty({
    description: 'Valid email address',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Strong password (min 8 characters, must include uppercase, lowercase, number, and special character)',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,#^()_\-+=])[A-Za-z\d@$!%*?&.,#^()_\-+=]+$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&.,#^()_-+=)',
  })
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'uuid-here',
      username: 'johndoe',
      email: 'john@example.com',
      roles: ['USER'],
    },
  })
  user: {
    id: string;
    username: string;
    email: string;
    roles: string[];
  };
}
