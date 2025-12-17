import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (info?.message === 'No auth token') {
      return null;
    }

    if (err) {
      throw err;
    }

    if (info) {
      throw new UnauthorizedException(info?.message || 'Invalid token');
    }

    return user ?? null;
  }
}
