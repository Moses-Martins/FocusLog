import { Request, Response } from 'express';
import { getBearerToken } from './auth.js';
import { config } from './config.js';
import { deleteTagByID } from './db/queries/deleteTagByID.js';
import { findUserByID } from './db/queries/findUserByID.js';
import { Error401, Error403 } from './ErrorClass.js';
import { validateJWT } from './jwt.js';

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Delete a tag by ID
 *     description: Permanently deletes a tag that belongs to the authenticated user.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the tag to delete
 *         schema:
 *           type: string
 *           example: "tag_12345"
 *     responses:
 *       204:
 *         description: Tag successfully deleted (no content)
 *       401:
 *         description: Unauthorized — invalid or expired token
 *       403:
 *         description: Forbidden — user not allowed to delete this tag
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Internal server error
 */

export async function handlerDeleteTagByID(req: Request, res: Response) {
  const token = getBearerToken(req);
  const IDStr = validateJWT(token, config.secret);
  const userFoundByID = await findUserByID(IDStr);

  if (userFoundByID.id !== IDStr) {
    throw new Error401('Invalid or expired token.');
  }

  const tagID = req.params.id;

  const deleted = await deleteTagByID(userFoundByID.id, tagID);
  if (deleted === false) {
    throw new Error403('You are not allowed to perform this action');
  }

  res.status(204);
  res.end();
}
