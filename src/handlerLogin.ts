import { Request, Response } from 'express';
import { findUserByEmail } from './db/queries/findUserByEmail.js';
import { Error401 } from './ErrorClass.js';
import { checkPasswordHash } from './auth.js'
import { makeJWT } from './jwt.js'
import { config } from './config.js'


type acceptData = {
    email: string
    password: string
}

type respSuccessData = {
    id: string
    createdAt: Date
    updatedAt: Date
    email: string
    token: string
}

export async function handlerLogin(req: Request, res: Response) {
    const params: acceptData = req.body

    const userFoundByEmail = await findUserByEmail(params.email);
    
    const match = checkPasswordHash(params.password, userFoundByEmail.hashedPassword)
    if (await match === false) {
        throw new Error401("Incorrect email or password")
    }

    const token = makeJWT(userFoundByEmail.id, 3600, config.secret)

    const respBody: respSuccessData = {
        id: userFoundByEmail.id,
        createdAt: userFoundByEmail.createdAt,
        updatedAt: userFoundByEmail.updatedAt,
        email: userFoundByEmail.email,
        token: token,
    }
    res.header("Content-Type", "application/json")
    const body = JSON.stringify(respBody)
    res.status(200).send(body)
    res.end();
}