import { Request, Response } from 'express';
import { findUserByID } from './db/queries/findUserByID.js';
import { validateJWT } from './jwt.js'
import { config } from './config.js'
import { getBearerToken } from './auth.js'


type respSuccessData = {
    id: string
    createdAt: Date
    updatedAt: Date
    email: string
}

export async function handlerMe(req: Request, res: Response) {
    const token = getBearerToken(req)
    const IDStr = validateJWT(token, config.secret)
    const userFoundByID = await findUserByID(IDStr);

    const respBody: respSuccessData = {
        id: userFoundByID.id,
        createdAt: userFoundByID.createdAt,
        updatedAt: userFoundByID.updatedAt,
        email: userFoundByID.email,
    }
    res.header("Content-Type", "application/json")
    const body = JSON.stringify(respBody)
    res.status(200).send(body)
    res.end();
}