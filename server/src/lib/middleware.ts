// lib/middleware.ts
import { NextRequest } from 'next/server';
import { verifyJwtToken } from './auth';
export async function requireAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.replace('Bearer ', '');
    const session = verifyJwtToken(token);

    return session;
  } catch {
    return null;
  }
}
