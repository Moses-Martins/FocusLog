import { Request, Response } from 'express';
import { findUserByID } from './db/queries/findUserByID.js';
import { validateJWT } from './jwt.js'
import { config } from './config.js'
import { getBearerToken } from './auth.js'
import { getTagByID } from './db/queries/getTagByID.js';
import { getAllTags } from './db/queries/getAllTags.js';
import { Error401 } from './ErrorClass.js';


export async function handlerGetTagByID(req: Request, res: Response) {
    const token = getBearerToken(req)
    const IDStr = validateJWT(token, config.secret)
    const userFoundByID = await findUserByID(IDStr);
    if (userFoundByID.id !== IDStr) {
        throw new Error401("Invalid or expired token.");
    }

    const TagID = req.params.id
    if (!TagID) {
        const allSessions = await getAllTags()
        res.header("Content-Type", "application/json")
        const body = JSON.stringify(allSessions)
        res.status(200).send(body)
        res.end();
        return
    }

    const tag = await getTagByID(TagID)

    res.header("Content-Type", "application/json")
    const body = JSON.stringify(tag)
    res.status(200).send(body)
    res.end();

}


