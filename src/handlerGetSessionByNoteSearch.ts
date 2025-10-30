import { Request, Response } from 'express';
import { getBearerToken } from './auth.js';
import { config } from './config.js';
import { findUserByID } from './db/queries/findUserByID.js';
import { getAllSessions } from './db/queries/getAllSessions.js';
import { searchSession } from './db/queries/searchSession.js';
import { Error401 } from './ErrorClass.js';
import { validateJWT } from './jwt.js';

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search study sessions by note text
 *     description: Returns all sessions whose notes contain the specified query string. Requires a valid JWT token.
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: false
 *         description: Text to search within session notes. If omitted, returns all sessions.
 *     responses:
 *       200:
 *         description: List of matching sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "sess_1"
 *                   userId:
 *                     type: string
 *                     example: "user_123"
 *                   title:
 *                     type: string
 *                     example: "Deep Work Session"
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-30T09:00:00Z"
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-30T11:00:00Z"
 *                   note:
 *                     type: string
 *                     example: "Worked on project documentation"
 *       401:
 *         description: Unauthorized — invalid or expired token
 *       500:
 *         description: Internal server error
 */

export async function handlerGetSessionByNoteSearch(req: Request, res: Response) {
  const token = getBearerToken(req);
  const IDStr = validateJWT(token, config.secret);
  const userFoundByID = await findUserByID(IDStr);
  if (userFoundByID.id !== IDStr) {
    throw new Error401('Invalid or expired token.');
  }

  const noteSearch = req.query.q;

  if (typeof noteSearch !== 'string') {
    const allSessions = await getAllSessions();
    res.header('Content-Type', 'application/json');
    const body = JSON.stringify(allSessions);
    res.status(200).send(body);
    res.end();
    return;
  }

  const sessionFound = await searchSession(noteSearch);

  res.header('Content-Type', 'application/json');
  const body = JSON.stringify(sessionFound);
  res.status(200).send(body);
  res.end();
}
