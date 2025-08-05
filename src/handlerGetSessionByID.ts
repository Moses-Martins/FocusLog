import { Request, Response } from 'express';
import { findUserByID } from './db/queries/findUserByID.js';
import { validateJWT } from './jwt.js'
import { config } from './config.js'
import { getBearerToken } from './auth.js'
import { getSessionByID } from './db/queries/getSessionByID.js';
import { getAllSessions } from './db/queries/getAllSessions.js';
import { Error401 } from './ErrorClass.js';


export async function handlerGetSessionByID(req: Request, res: Response) {
    const token = getBearerToken(req)
    const IDStr = validateJWT(token, config.secret)
    const userFoundByID = await findUserByID(IDStr);
    if (userFoundByID.id !== IDStr) {
        throw new Error401("Invalid or expired token.");
    }

    const sessionID = req.params.id
    if (!sessionID) {
        const allSessions = await getAllSessions()
        res.header("Content-Type", "application/json")
        const body = JSON.stringify(allSessions)
        res.status(200).send(body)
        res.end();
        return
    }

    const session = await getSessionByID(sessionID)

    res.header("Content-Type", "application/json")
    const body = JSON.stringify(session)
    res.status(200).send(body)
    res.end();
}


