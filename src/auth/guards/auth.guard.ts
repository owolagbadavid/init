import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { IS_PUBLIC_KEY } from 'src/decorators';
import { SecurityService } from 'src/security/security.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger: Logger;
  constructor(
    private reflector: Reflector,
    private securityService: SecurityService,
  ) {
    this.logger = new Logger(AuthGuard.name);
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromHeader(request);

    if (isPublic) {
      if (token) {
        try {
          const payload = this.securityService.verifyJwt(token);
          // Attach the user payload to the request object
          request['user'] = payload;
        } catch (e) {
          // Invalid token, user remains unauthenticated but request is allowed
          this.logger.error(e);
        }
      }

      // Allow the request to proceed (public or authenticated)
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    try {
      const payload = this.securityService.verifyJwt(token);

      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch (e) {
      this.logger.error(e);

      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
