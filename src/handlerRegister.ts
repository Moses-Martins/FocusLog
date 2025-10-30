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

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function handlerRegister(req: Request, res: Response) {
    const params = req.body as acceptData;

    // Validate input presence
    if (!params?.email || !params?.password) {
        throw new Error400('Email and password are required');
    }

    // Validate email format
    if (!isValidEmail(params.email)) {
        throw new Error400('Invalid email format');
    }

    // Validate password strength
    if (params.password.length < 8) {
        throw new Error400('Password must be at least 8 characters long');
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(params.email);
    if (existingUser) {
        throw new Error400('Email already registered');
    }

    // Create new user
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
