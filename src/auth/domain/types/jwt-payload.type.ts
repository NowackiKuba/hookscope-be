export type JwtPayload = {
  sub: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
};

export type RequestUser = {
  userId: string;
  email: string;
  role?: string;
};
