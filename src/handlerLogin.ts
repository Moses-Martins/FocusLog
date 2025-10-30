import { Request, Response } from 'express';
import { checkPasswordHash } from './auth.js';
import { config } from './config.js';
import { findUserByEmail } from './db/queries/findUserByEmail.js';
import { Error401 } from './ErrorClass.js';
import { makeJWT } from './jwt.js';

type acceptData = {
    email: string;
    password: string;
};

type respSuccessData = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    token: string;
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user using email and password, returning a JWT for authorization.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Successfully authenticated
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
 *                 token:
 *                   type: string
 *                   description: JSON Web Token for authenticated requests
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Incorrect email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Incorrect email or password"
 */

export async function handlerLogin(req: Request, res: Response) {
    const params: acceptData = req.body;

    const userFoundByEmail = await findUserByEmail(params.email);

    const match = checkPasswordHash(params.password, userFoundByEmail.hashedPassword);
    if (await match === false) {
        throw new Error401("Incorrect email or password");
    }

    const token = makeJWT(userFoundByEmail.id, 3600, config.secret);

    const respBody: respSuccessData = {
        id: userFoundByEmail.id,
        createdAt: userFoundByEmail.createdAt,
        updatedAt: userFoundByEmail.updatedAt,
        email: userFoundByEmail.email,
        token: token,
    };

    res.header("Content-Type", "application/json");
    const body = JSON.stringify(respBody);
    res.status(200).send(body);
    res.end();
}
