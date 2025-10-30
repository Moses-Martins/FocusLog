import { Request, Response } from 'express';
import { getBearerToken } from './auth.js';
import { config } from './config.js';
import { deleteSessionByID } from './db/queries/deleteSessionByID.js';
import { findUserByID } from './db/queries/findUserByID.js';
import { Error401, Error403 } from './ErrorClass.js';
import { validateJWT } from './jwt.js';

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: Delete a study session
 *     description: Deletes a study session by its ID for the authenticated user.
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the session to delete
 *         schema:
 *           type: string
 *           example: "sess_12345"
 *     responses:
 *       204:
 *         description: Session deleted successfully (no content returned)
 *       401:
 *         description: Unauthorized — invalid or expired token
 *       403:
 *         description: Forbidden — user does not have permission to delete this session
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */

export async function handlerDeleteSessionByID(req: Request, res: Response) {
  const token = getBearerToken(req);
  const IDStr = validateJWT(token, config.secret);
  const userFoundByID = await findUserByID(IDStr);

  if (userFoundByID.id !== IDStr) {
    throw new Error401('Invalid or expired token.');
  }

  const sessionID = req.params.id;
  const deleted = await deleteSessionByID(userFoundByID.id, sessionID);

  if (deleted === false) {
    throw new Error403('You are not allowed to perform this action');
  }

  res.status(204);
  res.end();
}
