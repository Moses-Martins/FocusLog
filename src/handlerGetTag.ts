import { Request, Response } from 'express';
import { findUserByID } from './db/queries/findUserByID.js';
import { validateJWT } from './jwt.js'
import { config } from './config.js'
import { getBearerToken } from './auth.js'
import { getAllTags } from './db/queries/getAllTags.js';
import { Error401 } from './ErrorClass.js';


export async function handlerGetTag(req: Request, res: Response) {
    const token = getBearerToken(req)
    const IDStr = validateJWT(token, config.secret)
    const userFoundByID = await findUserByID(IDStr);
    if (userFoundByID.id !== IDStr) {
        throw new Error401("Invalid or expired token.");
    }

    const alltags = await getAllTags()

    res.header("Content-Type", "application/json")
    const body = JSON.stringify(alltags)
    res.status(200).send(body)
    res.end();   

}

