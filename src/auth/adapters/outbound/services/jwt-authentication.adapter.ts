import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InvalidTokenException } from '@auth/domain/exceptions';
import type {
  AuthenticatedUser,
  AuthenticationPort,
} from '@auth/domain/ports/outbound/services/authentication.service.port';
import { UserRole } from '@users/domain/enums/user-role.enum';

@Injectable()
export class JwtAuthenticationAdapter implements AuthenticationPort {
  constructor(private readonly jwtService: JwtService) {}

  async verifyToken(token: string): Promise<AuthenticatedUser> {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email?: string;
        role?: string;
      }>(token);
      return {
        userId: payload.sub,
        sessionId: payload.sub,
        email: payload.email,
        role: payload.role ?? UserRole.USER,
      };
    } catch {
      throw new InvalidTokenException('Invalid or expired token');
    }
  }
}
