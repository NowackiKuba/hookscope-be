import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@users/domain/enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles are allowed to access a route.
 * Use together with RolesGuard (do not apply guards to routes unless intended).
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
