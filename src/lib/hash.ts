import { pbkdf2Sync, randomBytes } from 'crypto';

// Password hashing using Node.js crypto module
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function validatePassword(password: string, hashedPassword: string): boolean {
  // Handle legacy plain text passwords (for existing demo data)
  if (!hashedPassword.includes(':')) {
    return password === hashedPassword;
  }

  const [salt, hash] = hashedPassword.split(':');
  const testHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === testHash;
}