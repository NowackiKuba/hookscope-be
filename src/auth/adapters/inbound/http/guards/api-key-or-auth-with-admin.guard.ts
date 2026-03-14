import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { InvalidTokenException } from '../../../../domain/exceptions';
import { Token } from '../../../../constants';
import type {
  AuthenticatedUser,
  AuthenticationPort,
} from '../../../../domain/ports/outbound/services/authentication.service.port';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Guard that allows access via EITHER:
 * 1. Valid x-api-key header (admin API key)
 * 2. Valid JWT Bearer token with admin role
 */
@Injectable()
export class ApiKeyOrAuthWithAdminGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    @Inject(Token.AuthenticationService)
    private readonly authPort: AuthenticationPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // 1. Try API key first
    const apiKey = request.headers['x-api-key'];
    const validApiKey = this.configService.get<string>('ADMIN_API_KEY');

    if (apiKey && typeof apiKey === 'string' && apiKey === validApiKey) {
      request.user = {
        userId: '__api_key__',
        sessionId: '__api_key__',
        role: 'admin',
      };
      return true;
    }

    // 2. Fall back to JWT authentication
    const tokens = this.extractTokens(request);

    if (tokens.length === 0) {
      throw new UnauthorizedException(
        'Valid x-api-key header or Bearer token required',
      );
    }

    let lastError: Error | null = null;
    for (const token of tokens) {
      try {
        const user = await this.authPort.verifyToken(token);
        if (user.role !== 'admin') {
          throw new ForbiddenException('Admin access required');
        }
        request.user = user;
        return true;
      } catch (error) {
        if (error instanceof ForbiddenException) {
          throw error;
        }
        lastError = error instanceof Error ? error : new Error(String(error));
        if (error instanceof InvalidTokenException) {
          const errorMessage = error.message || '';
          if (!errorMessage.includes('different Clerk instance')) {
            continue;
          }
        }
      }
    }

    if (lastError instanceof InvalidTokenException) {
      throw lastError;
    }
    throw new InvalidTokenException(
      'Authentication failed - no valid token found',
    );
  }

  private extractTokens(request: Request): string[] {
    const tokens: string[] = [];
    const authHeader = request.headers.authorization;
    if (authHeader && typeof authHeader === 'string') {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        tokens.push(token);
        return tokens;
      }
    }

    const cookies = request.headers.cookie;
    if (cookies && typeof cookies === 'string') {
      const cookieMap = this.parseCookies(cookies);
      const sessionCookies: string[] = [];
      for (const [name, value] of Object.entries(cookieMap)) {
        if (name.startsWith('__session_') && value) {
          sessionCookies.push(value);
        }
      }
      if (cookieMap.__session) {
        sessionCookies.push(cookieMap.__session);
      }
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
        cookies[name.trim()] = decodeURIComponent(rest.join('='));
      }
    });

    return cookies;
  }
}
