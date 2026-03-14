import { randomBytes } from 'crypto';

export function generatePassword(length: number): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*';
  const all = upper + lower + digits + special;

  const bytes = randomBytes(length);
  return Array.from(bytes)
    .map((b) => all[b % all.length])
    .join('');
}
