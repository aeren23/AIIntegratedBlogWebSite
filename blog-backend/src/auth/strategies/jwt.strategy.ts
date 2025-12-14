import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT Token Payload Interface
 * This represents the data encoded in the JWT token
 */
export interface JwtPayload {
  sub: string;       // User ID (subject)
  username: string;  // Username
  roles: string[];   // User roles
  iat?: number;      // Issued at
  exp?: number;      // Expiration time
}

/**
 * JWT Strategy for Passport
 * Validates JWT tokens and extracts user information
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extract JWT from Authorization header as Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // Don't ignore expiration - expired tokens will be rejected
      ignoreExpiration: false,
      
      // Secret key from environment variable
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret-change-in-production',
    });
  }

  /**
   * Validate is called after the token signature is verified
   * Whatever we return here is attached to request.user
   */
  async validate(payload: JwtPayload) {
    // You can add additional validation here:
    // - Check if user still exists in database
    // - Check if user is not banned/deactivated
    // - Fetch fresh user data from database
    
    return {
      id: payload.sub,
      username: payload.username,
      roles: payload.roles,
    };
  }
}
