import { Request, Response } from 'express';
import { findUserByID } from './db/queries/findUserByID.js';
import { validateJWT } from './jwt.js'
import { config } from './config.js'
import { getBearerToken } from './auth.js'
import { createTag } from './db/queries/createTags.js';
import { Error400, Error401 } from './ErrorClass.js';


type acceptData = {
    name: string
    color?: string
}

type respSuccessData = {
    id: string
    userId: string
    name: string
    color: string
    createdAt: Date
}

export async function handlerCreateTag(req: Request, res: Response) {
    const token = getBearerToken(req)
    const IDStr = validateJWT(token, config.secret)
    const userFoundByID = await findUserByID(IDStr);
    if (userFoundByID.id !== IDStr) {
        throw new Error401("Invalid or expired token.");
    }

    const params: acceptData = req.body

    if (!params.color) {
        params.color = "#000000"
    }

    if (!isValidHexColor(params.color)) {
        throw new Error400("Invalid hex color. Must be in the format #RRGGBB.")
    }

    const createdTag = await createTag({
        userId: IDStr,
        name: params.name,
        color: params.color,
    });

    const respBody: respSuccessData = {
        id: createdTag.id,
        userId: createdTag.userId,
        name: createdTag.name,
        color: createdTag.color,
        createdAt: createdTag.createdAt,
    }
    res.header("Content-Type", "application/json")
    const body = JSON.stringify(respBody)
    res.status(201).send(body)
    res.end();
}


function isValidHexColor(color: string): boolean {
  const hexRegex = /^#[0-9a-fA-F]{6}$/;
  return hexRegex.test(color);
}
