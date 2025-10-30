import { Request, Response } from 'express';
import { hashPassword } from './auth.js';
import { findUserByEmail } from './db/queries/findUserByEmail.js';
import { createUser } from './db/queries/users.js';
import { Error400 } from './ErrorClass.js';

type acceptData = {
    email: string;
    password: string;
};

type respSuccessData = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
};

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints related to user registration and login
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     description: Creates a new user with a unique email and hashed password.
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
 *                 minLength: 8
 *                 example: securePassword123
 *     responses:
 *       201:
 *         description: User successfully registered
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
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email already registered"
 */

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function handlerRegister(req: Request, res: Response) {
    const params = req.body as acceptData;

    if (!params?.email || !params?.password) {
        throw new Error400('Email and password are required');
    }

    if (!isValidEmail(params.email)) {
        throw new Error400('Invalid email format');
    }

    if (params.password.length < 8) {
        throw new Error400('Password must be at least 8 characters long');
    }

    const existingUser = await findUserByEmail(params.email);
    if (existingUser) {
        throw new Error400('Email already registered');
    }

    const hashedPassword = await hashPassword(params.password);
    const createdUser = await createUser({ email: params.email, hashedPassword });

    const respBody: respSuccessData = {
        id: createdUser.id,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
        email: createdUser.email,
    };

    res.status(201).json(respBody);
}
