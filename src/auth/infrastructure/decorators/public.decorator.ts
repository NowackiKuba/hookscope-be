import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../guards/jwt-auth.guard';

/**
 * Marks a route as public (no JWT required).
 * Use on controller methods or class when JwtAuthGuard is applied globally.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
