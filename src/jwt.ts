import jwt, { JwtPayload } from 'jsonwebtoken';
import { Error401 } from './ErrorClass.js';

type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
  const payload: Payload = {
    iss: "focuslog",        
    sub: userID,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  };

  return jwt.sign(payload, secret);
}


export function validateJWT(tokenString: string, secret: string): string {
  try {
    const decoded = jwt.verify(tokenString, secret) as JwtPayload;

    if (!decoded.sub || typeof decoded.sub !== 'string') {
      throw new Error401("Invalid or expired JWT");
    }

    return decoded.sub;
  } catch (err) {
    throw new Error401("Invalid or expired JWT");
  }
}
