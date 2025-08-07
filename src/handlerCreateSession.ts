import { Request, Response } from 'express';
import { findUserByID } from './db/queries/findUserByID.js';
import { validateJWT } from './jwt.js';
import { config } from './config.js';
import { getBearerToken } from './auth.js';
import { createStudySession } from './db/queries/createSessions.js';
import { createTag } from './db/queries/createTags.js';
import { createSessionTag } from './db/queries/createSessionTag.js';
import { getTagIDByName } from './db/queries/getTagIdByName.js';
import { getInnerJoinSessionTags } from './db/queries/getInnerJoinSessionTags.js';
import { Error401 } from './ErrorClass.js';


type acceptData = {
    title: string
    startTime: string
    endTime: string
    note?: string | null
    tags?: string[]
}

type respSuccessData = {
    id: string
    userId: string
    startTime: Date
    endTime: Date
    note: string
    tags: { id: string; name: string }[] 
    createdAt: Date
}

export async function handlerCreateSession(req: Request, res: Response) {
    const token = getBearerToken(req)
    const IDStr = validateJWT(token, config.secret)
    const userFoundByID = await findUserByID(IDStr);
    if (userFoundByID.id !== IDStr) {
        throw new Error401("Invalid or expired token.");
    }


    const params: acceptData = req.body
    
    const { start, end } = validateSessionTimesOrThrow(params.startTime, params.endTime)

    if (!params.note) {
      params.note = "-"
    }

    const createdSession = await createStudySession({
        title: params.title,
        userId: IDStr,
        startTime: start,
        endTime: end,
        note: params.note,
    });

    if (!params.tags) {
      params.tags = []
    }

    for (const tag of params.tags) {
      const id = await getTagIDByName(tag);

      if (id === null) {
        const createdTag = await createTag({
            userId: IDStr,
            name: tag,
            color: "#000000",
        });   
        await createSessionTag({
          sessionId: createdSession.id,
          tagId: createdTag.id,
        })
        
      } else {
        await createSessionTag({
          sessionId: createdSession.id,
          tagId: id,
        })

      }
    }

    const tagArray = await getInnerJoinSessionTags(createdSession.id)

    const respBody: respSuccessData = {
        id: createdSession.id,
        userId: createdSession.userId,
        startTime: createdSession.startTime,
        endTime: createdSession.endTime,
        note: createdSession.note,
        tags: tagArray,
        createdAt: createdSession.createdAt
    }
    res.header("Content-Type", "application/json")
    const body = JSON.stringify(respBody)
    res.status(201).send(body)
    res.end();
}

function tryParseCommonFormats(value: string): Date | null {
  if (!value || typeof value !== "string") return null;
  value = value.trim();

  // Try native Date first
  const direct = new Date(value);
  if (!isNaN(direct.getTime())) return direct;

  // Try "YYYY-MM-DD HH:mm"
  const ymdHm = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/;
  if (ymdHm.test(value)) {
    const isoLike = value.replace(/\s+/, "T") + ":00";
    const d = new Date(isoLike);
    if (!isNaN(d.getTime())) return d;
  }

  // Try "YYYY-MM-DD"
  const ymd = /^\d{4}-\d{2}-\d{2}$/;
  if (ymd.test(value)) {
    const d = new Date(value + "T00:00:00");
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

export function validateSessionTimesOrThrow(startStr: string, endStr: string): { start: Date; end: Date } {
  const start = tryParseCommonFormats(startStr);
  if (!start) {
    throw new Error401("Invalid startTime format. Use ISO or YYYY-MM-DD hh:mm.");
  }

  const end = tryParseCommonFormats(endStr);
  if (!end) {
    throw new Error401("Invalid endTime format. Use ISO or YYYY-MM-DD hh:mm.");
  }

  const now = new Date();

  // 🚫 Past start time
  if (start.getTime() < now.getTime()) {
    throw new Error401("startTime must not be in the past.");
  }

  // 🚫 End before or equal to start
  if (end.getTime() <= start.getTime()) {
    throw new Error401("endTime must be after startTime.");
  }

  return { start, end };
}
