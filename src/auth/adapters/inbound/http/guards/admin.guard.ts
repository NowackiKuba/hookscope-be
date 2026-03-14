import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '@users/domain/enums/user-role.enum';
import { Token } from '../../../../constants';
import type {
  AuthenticatedUser,
  AuthenticationPort,
} from '../../../../domain/ports/outbound/services/authentication.service.port';
import { AuthGuard } from './auth.guard';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Guard that requires a valid JWT and the authenticated user to have the ADMIN role.
 * Use on routes that should be accessible only to admins (e.g. create user, manage settings).
 */
@Injectable()
export class AdminGuard extends AuthGuard implements CanActivate {
  constructor(
    @Inject(Token.AuthenticationService)
    authPort: AuthenticationPort,
  ) {
    super(authPort);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const passed = await super.canActivate(context);
    if (!passed) return false;

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();
    const role = request.user?.role?.toUpperCase();

    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
