import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account and receive a JWT token',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'uuid-here',
            username: 'johndoe',
            email: 'john@example.com',
            roles: ['USER'],
          },
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or user already exists',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Username already exists',
      },
    },
  })
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login with credentials',
    description: 'Authenticate with username/email and password to receive a JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'uuid-here',
            username: 'johndoe',
            email: 'john@example.com',
            roles: ['USER', 'AUTHOR'],
          },
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Invalid credentials',
      },
    },
  })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get the currently authenticated user information',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user information',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid-here',
          username: 'johndoe',
          roles: ['USER', 'AUTHOR'],
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  async getMe(@CurrentUser() user: { id: string; username: string; roles: string[] }) {
    return {
      success: true,
      data: user,
      errorMessage: null,
    };
  }
}
