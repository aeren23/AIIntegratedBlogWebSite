import { Controller, Post, Body, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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

  @Get('verify-email')
  @ApiOperation({
    summary: 'Verify email address',
    description: 'Verify user email address with the token sent via email',
  })
  @ApiQuery({
    name: 'token',
    description: 'Email verification token',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    schema: {
      example: {
        success: true,
        data: {
          message: 'Email verified successfully',
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Invalid verification token',
      },
    },
  })
  async verifyEmail(@Query('token') token: string) {
    const result = await this.authService.verifyEmail(token);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }

  @Post('resend-verification')
  @ApiOperation({
    summary: 'Resend verification email',
    description: 'Resend the email verification link to the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent',
    schema: {
      example: {
        success: true,
        data: {
          message: 'Verification email sent successfully',
        },
        errorMessage: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'User not found or email already verified',
    schema: {
      example: {
        success: false,
        data: null,
        errorMessage: 'Email already verified',
      },
    },
  })
  async resendVerification(@Body() body: { email: string }) {
    const result = await this.authService.resendVerificationEmail(body.email);
    return {
      success: result.success,
      data: result.value,
      errorMessage: result.errorMessage,
    };
  }
}
