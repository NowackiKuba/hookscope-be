import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { Token } from '../../../../constants';
import type { AuthenticationPort } from '../../../../domain/ports/outbound/services/authentication.service.port';
import type { AuthenticatedUser } from '../../../../domain/ports/outbound/services/authentication.service.port';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Optional authentication guard that verifies token if present,
 * but doesn't throw if no token is provided.
 * Useful for endpoints that support both authenticated and unauthenticated access.
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    @Inject(Token.AuthenticationService)
    private readonly authPort: AuthenticationPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const tokens = this.extractTokens(request);

    // If no tokens, allow request to proceed without authentication
    if (tokens.length === 0) {
      return true;
    }

    // Try each token until one successfully verifies
    // This handles cases where multiple Clerk instances have cookies set
    for (const token of tokens) {
      try {
        const user = await this.authPort.verifyToken(token);
        request.user = user;
        return true;
      } catch (error) {
        // Continue trying other tokens
        // If all tokens fail, we'll allow the request without authentication
        continue;
      }
    }

    // If we get here, none of the tokens worked
    // Still allow request to proceed (optional auth)
    return true;
  }

  private extractTokens(request: Request): string[] {
    const tokens: string[] = [];

    // First, try to get token from Authorization header (highest priority)
    const authHeader = request.headers.authorization;
    if (authHeader && typeof authHeader === 'string') {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        tokens.push(token);
        // If we have an Authorization header, use only that (don't check cookies)
        return tokens;
      }
    }

    // If no Authorization header, try to get tokens from Clerk session cookies
    // Clerk stores session tokens in cookies with names like:
    // - __session
    // - __session_<publishableKey>
    const cookies = request.headers.cookie;
    if (cookies && typeof cookies === 'string') {
      // Parse cookies manually
      const cookieMap = this.parseCookies(cookies);

      // Collect all session cookies - we'll try them all until one works
      // This handles cases where multiple Clerk instances have cookies set
      const sessionCookies: string[] = [];

      // Collect all __session_* cookies
      for (const [name, value] of Object.entries(cookieMap)) {
        if (name.startsWith('__session_') && value) {
          sessionCookies.push(value);
        }
      }

      // Also add the generic __session cookie if present
      if (cookieMap.__session) {
        sessionCookies.push(cookieMap.__session);
      }

      // Add all found session tokens to the tokens array
      tokens.push(...sessionCookies);
    }

    return tokens;
  }

  private parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    if (!cookieHeader) return cookies;

    cookieHeader.split(';').forEach((cookie) => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name && rest.length > 0) {
        // Decode URI component to handle URL-encoded values
        cookies[name.trim()] = decodeURIComponent(rest.join('='));
      }
    });

    return cookies;
  }
}
