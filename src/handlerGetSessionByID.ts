import { Request, Response } from 'express';
import { getBearerToken } from './auth.js';
import { config } from './config.js';
import { findUserByID } from './db/queries/findUserByID.js';
import { getAllSessions } from './db/queries/getAllSessions.js';
import { getSessionByID } from './db/queries/getSessionByID.js';
import { Error401 } from './ErrorClass.js';
import { validateJWT } from './jwt.js';

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get a study session by ID
 *     description: Retrieves a specific study session by its ID for the authenticated user.  
 *                  If no ID is provided, returns all sessions instead.
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the study session
 *         schema:
 *           type: string
 *           example: "sess_12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved the session (or all sessions if no ID provided)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "sess_12345"
 *                     userId:
 *                       type: string
 *                       example: "user_67890"
 *                     title:
 *                       type: string
 *                       example: "Physics Review"
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-30T09:00:00Z"
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-30T10:30:00Z"
 *                     note:
 *                       type: string
 *                       example: "Focused on thermodynamics"
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "tag_2"
 *                           name:
 *                             type: string
 *                             example: "science"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-30T09:00:00Z"
 *                 - type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "sess_12345"
 *                       title:
 *                         type: string
 *                         example: "Math Practice"
 *                       startTime:
 *                         type: string
 *                         format: date-time
 *                       endTime:
 *                         type: string
 *                         format: date-time
 *                       note:
 *                         type: string
 *                         example: "-"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized — invalid or expired token
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */

export async function handlerGetSessionByID(req: Request, res: Response) {
  const token = getBearerToken(req);
  const IDStr = validateJWT(token, config.secret);
  const userFoundByID = await findUserByID(IDStr);

  if (userFoundByID.id !== IDStr) {
    throw new Error401("Invalid or expired token.");
  }

  const sessionID = req.params.id;

  if (!sessionID) {
    const allSessions = await getAllSessions();
    res.header("Content-Type", "application/json");
    const body = JSON.stringify(allSessions);
    res.status(200).send(body);
    res.end();
    return;
  }

  const session = await getSessionByID(sessionID);

  res.header("Content-Type", "application/json");
  const body = JSON.stringify(session);
  res.status(200).send(body);
  res.end();
}
