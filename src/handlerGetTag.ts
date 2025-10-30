import { Request, Response } from 'express';
import { getBearerToken } from './auth.js';
import { config } from './config.js';
import { findUserByID } from './db/queries/findUserByID.js';
import { getAllTags } from './db/queries/getAllTags.js';
import { Error401 } from './ErrorClass.js';
import { validateJWT } from './jwt.js';

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags
 *     description: Retrieves all tags associated with the authenticated user.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved list of tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "tag_12345"
 *                   userId:
 *                     type: string
 *                     example: "usr_98765"
 *                   name:
 *                     type: string
 *                     example: "Deep Work"
 *                   color:
 *                     type: string
 *                     example: "#FF5733"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-30T15:00:00Z"
 *       401:
 *         description: Unauthorized — invalid or expired token
 *       500:
 *         description: Internal server error
 */

export async function handlerGetTag(req: Request, res: Response) {
  const token = getBearerToken(req);
  const IDStr = validateJWT(token, config.secret);
  const userFoundByID = await findUserByID(IDStr);

  if (userFoundByID.id !== IDStr) {
    throw new Error401('Invalid or expired token.');
  }

  const alltags = await getAllTags();

  res.header('Content-Type', 'application/json');
  const body = JSON.stringify(alltags);
  res.status(200).send(body);
  res.end();
}
