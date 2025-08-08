import { Request, Response } from 'express';
import { findUserByID } from './db/queries/findUserByID.js';
import { validateJWT } from './jwt.js'
import { config } from './config.js'
import { getBearerToken } from './auth.js'
import { searchSession } from './db/queries/searchSession.js';
import { getAllSessions } from './db/queries/getAllSessions.js';
import { Error401 } from './ErrorClass.js';


export async function handlerGetSessionByNoteSearch(req: Request, res: Response) {
    const token = getBearerToken(req)
    const IDStr = validateJWT(token, config.secret)
    const userFoundByID = await findUserByID(IDStr);
    if (userFoundByID.id !== IDStr) {
        throw new Error401("Invalid or expired token.");
    }

    const noteSearch = req.query.q

    if (typeof noteSearch !== "string") {
        const allSessions = await getAllSessions()
        res.header("Content-Type", "application/json")
        const body = JSON.stringify(allSessions)
        res.status(200).send(body)
        res.end();
        return
    }
    
    const sessionFound = await searchSession(noteSearch)

    res.header("Content-Type", "application/json")
    const body = JSON.stringify(sessionFound)
    res.status(200).send(body)
    res.end();
}


