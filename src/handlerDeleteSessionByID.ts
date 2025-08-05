import { Request, Response } from 'express';
import { findUserByID } from './db/queries/findUserByID.js';
import { validateJWT } from './jwt.js'
import { config } from './config.js'
import { getBearerToken } from './auth.js'
import { deleteSessionByID } from './db/queries/deleteSessionByID.js';
import { Error401, Error403 } from './ErrorClass.js';


export async function handlerDeleteSessionByID(req: Request, res: Response) {
    const token = getBearerToken(req)
    const IDStr = validateJWT(token, config.secret)
    const userFoundByID = await findUserByID(IDStr);
    if (userFoundByID.id !== IDStr) {
        throw new Error401("Invalid or expired token.");
    }
    const sessionID = req.params.id

    const deleted = await deleteSessionByID(userFoundByID.id, sessionID)
    if (deleted === false) {
        throw new Error403("You are not allowed to perform this action")
    }

    res.status(204)
    res.end();
}


