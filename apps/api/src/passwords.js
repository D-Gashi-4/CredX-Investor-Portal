import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const digest = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${digest}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, expected] = stored.split(':');
  const actual = scryptSync(password, salt, 64).toString('hex');
  return expected.length === actual.length && timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}