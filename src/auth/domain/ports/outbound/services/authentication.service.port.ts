export type AuthenticatedUser = {
  userId: string;
  sessionId?: string;
  email?: string;
  role?: string;
};

export interface AuthenticationPort {
  verifyToken(token: string): Promise<AuthenticatedUser>;
}
