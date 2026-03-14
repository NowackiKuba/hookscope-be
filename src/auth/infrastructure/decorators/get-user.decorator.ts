import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestUser } from '@auth/domain/types/jwt-payload.type';

export const GetUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | string => {
    const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
