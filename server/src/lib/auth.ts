// lib/auth.ts

import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function signJwtToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyJwtToken(token: string): (JwtPayload & { userId: string }) | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload & { userId: string };
  } catch {
    return null;
  }
}
