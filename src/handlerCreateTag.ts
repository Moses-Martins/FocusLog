import { Request, Response } from 'express';
import { getBearerToken } from './auth.js';
import { config } from './config.js';
import { createTag } from './db/queries/createTags.js';
import { findUserByID } from './db/queries/findUserByID.js';
import { Error400, Error401 } from './ErrorClass.js';
import { validateJWT } from './jwt.js';

type acceptData = {
  name: string;
  color?: string;
};

type respSuccessData = {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
};

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a new tag
 *     description: Creates a new tag for the authenticated user. If no color is provided, the default color `#000000` is used.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the tag
 *                 example: "Deep Work"
 *               color:
 *                 type: string
 *                 description: Optional hex color code for the tag (e.g. #FF5733)
 *                 example: "#FF5733"
 *     responses:
 *       201:
 *         description: Tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "tag_12345"
 *                 userId:
 *                   type: string
 *                   example: "usr_98765"
 *                 name:
 *                   type: string
 *                   example: "Deep Work"
 *                 color:
 *                   type: string
 *                   example: "#FF5733"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-30T15:00:00Z"
 *       400:
 *         description: Invalid hex color or missing required field
 *       401:
 *         description: Unauthorized — invalid or expired token
 *       500:
 *         description: Internal server error
 */

export async function handlerCreateTag(req: Request, res: Response) {
  const token = getBearerToken(req);
  const IDStr = validateJWT(token, config.secret);
  const userFoundByID = await findUserByID(IDStr);

  if (userFoundByID.id !== IDStr) {
    throw new Error401('Invalid or expired token.');
  }

  const params: acceptData = req.body;

  if (!params.color) {
    params.color = '#000000';
  }

  if (!isValidHexColor(params.color)) {
    throw new Error400('Invalid hex color. Must be in the format #RRGGBB.');
  }

  const createdTag = await createTag({
    userId: IDStr,
    name: params.name,
    color: params.color,
  });

  const respBody: respSuccessData = {
    id: createdTag.id,
    userId: createdTag.userId,
    name: createdTag.name,
    color: createdTag.color,
    createdAt: createdTag.createdAt,
  };

  res.header('Content-Type', 'application/json');
  const body = JSON.stringify(respBody);
  res.status(201).send(body);
  res.end();
}

function isValidHexColor(color: string): boolean {
  const hexRegex = /^#[0-9a-fA-F]{6}$/;
  return hexRegex.test(color);
}
