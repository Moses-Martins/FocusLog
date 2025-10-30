import { Request, Response } from 'express';
import { getBearerToken } from './auth.js';
import { config } from './config.js';
import { findUserByID } from './db/queries/findUserByID.js';
import { validateJWT } from './jwt.js';

type respSuccessData = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     description: Returns details about the currently authenticated user based on the JWT in the Authorization header.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "1a2b3c4d"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-30T10:00:00.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-30T10:00:00.000Z"
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *       401:
 *         description: Invalid or expired JWT, or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired JWT"
 */

export async function handlerMe(req: Request, res: Response) {
  const token = getBearerToken(req);
  const IDStr = validateJWT(token, config.secret);
  const userFoundByID = await findUserByID(IDStr);

  const respBody: respSuccessData = {
    id: userFoundByID.id,
    createdAt: userFoundByID.createdAt,
    updatedAt: userFoundByID.updatedAt,
    email: userFoundByID.email,
  };

  res.header('Content-Type', 'application/json');
  const body = JSON.stringify(respBody);
  res.status(200).send(body);
  res.end();
}
