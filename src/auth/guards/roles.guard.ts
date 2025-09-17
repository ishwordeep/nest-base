

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/user/schema/user.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Debug logs (remove in production)
    console.log('🔐 Required Roles:', requiredRoles);
    console.log('👤 Authenticated User:', user);

    if (!user) {
      throw new ForbiddenException('Access denied: User is not authenticated.');
    }

    if (!user.role) {
      throw new ForbiddenException(
        'Access denied: You are not authorized to perform this action.',
      );
    }

    // Always allow ADMIN role to access any resource
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied: User role "${user.role}" is not authorized to access this resource.`,
      );
    }

    return true;
  }
}
