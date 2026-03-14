import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../../../../domain/ports/outbound/services/authentication.service.port';

/**
 * Custom decorator to extract the authenticated user from the request.
 * Returns undefined if no user is authenticated (useful for optional auth).
 * The user is set by AuthGuard or OptionalAuthGuard after token verification.
 *
 * @example
 * ```typescript
 * @Get('profile')
 * @UseGuards(AuthGuard)
 * async getProfile(@CurrentUser() user: AuthenticatedUser) {
 *   return user;
 * }
 *
 * @Get('public')
 * @UseGuards(OptionalAuthGuard)
 * async getPublic(@CurrentUser() user?: AuthenticatedUser) {
 *   // user may be undefined
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    return request.user;
  },
);
