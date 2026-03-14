import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Placeholder: extract active organization from request (e.g. from header or user context).
 * Returns undefined until organization context is implemented.
 */
export const ActiveOrganization = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<{ organizationId?: string }>();
    return request.organizationId;
  },
);
