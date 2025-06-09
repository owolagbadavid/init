import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { AuthenticatedRequest, IS_PUBLIC_KEY } from 'src/decorators';
import { UserRole } from 'src/models/user/user-role';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    //what is the required role

    const requiredRoles = this.reflector.getAllAndOverride<UserRole>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles.length) return true;

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!user) return false;

    console.log('is', user.role, 'one of', requiredRoles, '?');

    //does the user have the required role

    // if (requiredRole === user.role) {
    //   return true;
    // }

    // throw new ForbiddenException(
    //   `${user.role} is not allowed to access this route`,
    // );

    return requiredRoles.includes(user.role);
  }
}
