import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtHelper } from './jwt.helper';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing.');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Authorization header format must be Bearer <token>');
    }

    const token = parts[1];
    const payload = JwtHelper.verify(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired JWT token.');
    }

    request.user = payload;
    return true;
  }
}
