import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * JWT Authentication Guard
 * TODO: Implement actual JWT validation with @nestjs/jwt and @nestjs/passport
 * 
 * For now, this is a placeholder that allows all requests through
 * and adds mock user data to req.user for testing purposes
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // TODO: Replace with actual JWT token validation
    // For now, add mock user to request for testing
    request.user = {
      id: 'mock-user-id',
      roles: ['ADMIN'], // Mock role - replace with actual JWT claims
    };
    
    return true;
  }
}
