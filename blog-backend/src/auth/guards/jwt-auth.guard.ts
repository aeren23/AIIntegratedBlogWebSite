import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * 
 * This guard uses Passport's JWT strategy to:
 * 1. Extract JWT token from Authorization header (Bearer token)
 * 2. Verify the token signature using the secret key
 * 3. Check token expiration
 * 4. Attach user data to request.user
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * @Get('protected-route')
 * getProtectedData(@CurrentUser() user) { }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Override canActivate to add custom logic before/after authentication
   */
  canActivate(context: ExecutionContext) {
    // Call the parent AuthGuard's canActivate
    // This triggers the JWT strategy validation
    return super.canActivate(context);
  }

  /**
   * Override handleRequest to customize error handling
   * This is called after the JWT strategy's validate() method
   */
  handleRequest(err: any, user: any, info: any) {
    // If there's an error or no user, throw UnauthorizedException
    if (err || !user) {
      // Provide helpful error messages based on the error type
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired. Please login again.');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token. Please login again.');
      }
      if (info?.message === 'No auth token') {
        throw new UnauthorizedException('No authentication token provided. Please include Bearer token in Authorization header.');
      }
      throw new UnauthorizedException(err?.message || 'Authentication failed');
    }
    
    // Return user object - this will be attached to request.user
    return user;
  }
}
