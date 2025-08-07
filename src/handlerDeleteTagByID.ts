import { Request, Response } from 'express';
import { findUserByID } from './db/queries/findUserByID.js';
import { validateJWT } from './jwt.js'
import { config } from './config.js'
import { getBearerToken } from './auth.js'
import { deleteTagByID } from './db/queries/deleteTagByID.js';
import { Error401, Error403 } from './ErrorClass.js';


export async function handlerDeleteTagByID(req: Request, res: Response) {
    const token = getBearerToken(req)
    const IDStr = validateJWT(token, config.secret)
    const userFoundByID = await findUserByID(IDStr);
    if (userFoundByID.id !== IDStr) {
        throw new Error401("Invalid or expired token.");
    }
    const sessionID = req.params.id

    const deleted = await deleteTagByID(userFoundByID.id, sessionID)
    if (deleted === false) {
        throw new Error403("You are not allowed to perform this action")
    }

    res.status(204)
    res.end();
}


