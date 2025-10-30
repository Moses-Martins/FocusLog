import bcrypt from 'bcrypt';
import { Request } from 'express';
import { Error400, Error401 } from './ErrorClass.js';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}


export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
  const match = await bcrypt.compare(password, hash);
  return match;
}


export function getBearerToken(req: Request): string {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    throw new Error401('Authorization header is missing');
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new Error400('Authorization header is malformed');
  }

  return match[1];
}

