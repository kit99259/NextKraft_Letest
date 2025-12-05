import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../constants/roles';

export interface JWTPayload {
  id: string;
  role: UserRole;
  username: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.jwt.secret, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, env.jwt.secret, {
      algorithms: ['HS256'],
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

