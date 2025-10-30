import { Request, Response } from 'express';
import { getBearerToken } from './auth.js';
import { config } from './config.js';
import { findUserByID } from './db/queries/findUserByID.js';
import { getAllSessions } from './db/queries/getAllSessions.js';
import { Error401 } from './ErrorClass.js';
import { validateJWT } from './jwt.js';

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get all study sessions
 *     description: Retrieves all study sessions for the authenticated user.
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "sess_12345"
 *                   userId:
 *                     type: string
 *                     example: "user_67890"
 *                   title:
 *                     type: string
 *                     example: "Math Study"
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-30T14:00:00Z"
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-30T16:00:00Z"
 *                   note:
 *                     type: string
 *                     example: "Focused on calculus and trigonometry"
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "tag_1"
 *                         name:
 *                           type: string
 *                           example: "math"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-30T14:00:00Z"
 *       401:
 *         description: Unauthorized — invalid or expired token
 *       500:
 *         description: Internal server error
 */

export async function handlerGetSessions(req: Request, res: Response) {
  const token = getBearerToken(req);
  const IDStr = validateJWT(token, config.secret);
  const userFoundByID = await findUserByID(IDStr);

  if (userFoundByID.id !== IDStr) {
    throw new Error401("Invalid or expired token.");
  }

  const allSessions = await getAllSessions();

  res.header("Content-Type", "application/json");
  const body = JSON.stringify(allSessions);
  res.status(200).send(body);
  res.end();
}
