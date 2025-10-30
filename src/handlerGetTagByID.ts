import { Request, Response } from 'express';
import { getBearerToken } from './auth.js';
import { config } from './config.js';
import { findUserByID } from './db/queries/findUserByID.js';
import { getAllTags } from './db/queries/getAllTags.js';
import { getTagByID } from './db/queries/getTagByID.js';
import { Error401 } from './ErrorClass.js';
import { validateJWT } from './jwt.js';

/**
 * @swagger
 * /api/tags/{id}:
 *   get:
 *     summary: Get a tag by ID
 *     description: Retrieves a single tag by its unique identifier. If no ID is provided, returns all tags instead.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the tag to retrieve
 *         schema:
 *           type: string
 *           example: "tag_12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved tag (or all tags if ID missing)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "tag_12345"
 *                     userId:
 *                       type: string
 *                       example: "usr_98765"
 *                     name:
 *                       type: string
 *                       example: "Deep Work"
 *                     color:
 *                       type: string
 *                       example: "#FF5733"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-30T15:00:00Z"
 *                 - type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       color:
 *                         type: string
 *       401:
 *         description: Unauthorized — invalid or expired token
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Internal server error
 */

export async function handlerGetTagByID(req: Request, res: Response) {
  const token = getBearerToken(req);
  const IDStr = validateJWT(token, config.secret);
  const userFoundByID = await findUserByID(IDStr);

  if (userFoundByID.id !== IDStr) {
    throw new Error401('Invalid or expired token.');
  }

  const TagID = req.params.id;

  if (!TagID) {
    const allTags = await getAllTags();
    res.header('Content-Type', 'application/json');
    const body = JSON.stringify(allTags);
    res.status(200).send(body);
    res.end();
    return;
  }

  const tag = await getTagByID(TagID);

  res.header('Content-Type', 'application/json');
  const body = JSON.stringify(tag);
  res.status(200).send(body);
  res.end();
}
