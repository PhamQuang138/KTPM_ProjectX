const DEFAULT_JWT_SECRET = 'change-me-in-production';

const requireValue = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

export const getJwtSecret = (): string => {
  const secret = requireValue('JWT_SECRET');
  if (secret === DEFAULT_JWT_SECRET || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters and must not use the example value');
  }
  return secret;
};

export const getDatabaseUrl = (): string => requireValue('DATABASE_URL');
