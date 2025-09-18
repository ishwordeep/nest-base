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
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException({
        message: 'Access denied: Authentication required.',
        errors: { auth: ['User not authenticated'] },
      });
    }

    // Always allow ADMIN to access anything
    if (user.role === UserRole.ADMIN) return true;

    // Check if user role is in required roles
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException({
        message: `Access denied: Role "${user.role}" is not authorized for this resource.`,
        errors: { role: [`Required roles: ${requiredRoles.join(', ')}`] },
      });
    }

    return true;
  }
}
