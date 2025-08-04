import { Request, Response } from 'express';
import { createUser } from './db/queries/users.js';


type acceptData = {
    email: string
}

type respSuccessData = {
    id: string
    createdAt: Date
    updatedAt: Date
    email: string
}


export async function handlerRegister(req: Request, res: Response) {
    const params: acceptData = req.body

    const createdUser = await createUser(params);
    
    const respBody: respSuccessData = {
        id: createdUser.id,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
        email: createdUser.email,
    }
    res.header("Content-Type", "application/json")
    const body = JSON.stringify(respBody)
    res.status(200).send(body)
    res.end();
}