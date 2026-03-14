export const Token = {
  HashProvider: Symbol('HashProvider'),
  AuthenticationService: Symbol('AuthenticationService'),
};

export const DEFAULT_SALT = 14;

export const JWT_CONFIG = {
  SECRET_KEY_ENV: 'JWT_SECRET',
  EXPIRES_IN_ENV: 'JWT_EXPIRES_IN',
  DEFAULT_EXPIRES_IN: '7d',
} as const;

/** Feature keys for subscription limits (e.g. folders, documents_per_month). */
export const SUBSCRIPTION_FEATURE_LIMIT_KEYS: Record<string, string> = {
  documents: 'documents_per_month',
  folders: 'folders',
  version_history: 'version_history',
};

/** Route path segments that are gated by subscription. */
export const SUBSCRIPTION_LIMITED_FEATURES = ['documents', 'folders'];
