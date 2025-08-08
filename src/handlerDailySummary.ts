import { Request, Response } from 'express';
import { findUserByID } from './db/queries/findUserByID.js';
import { validateJWT } from './jwt.js';
import { config } from './config.js';
import { getBearerToken } from './auth.js';
import { sessionTagRow, tagSummary, getDateSessionTag } from './db/queries/getDateSessionTag.js';
import { Error401 } from './ErrorClass.js';


export async function handlerDailySummary(req: Request, res: Response) {
    const token = getBearerToken(req)
    const IDStr = validateJWT(token, config.secret)
    const userFoundByID = await findUserByID(IDStr);
    if (userFoundByID.id !== IDStr) {
        throw new Error401("Invalid or expired token.");
    }

    const date = new Date()
    const sessionTag = await getDateSessionTag(date)
    const respBody = groupByTagTotalMinutes(sessionTag)

    res.header("Content-Type", "application/json")
    const body = JSON.stringify(respBody)
    res.status(200).send(body)
    res.end();
}


function groupByTagTotalMinutes(rows: sessionTagRow[]): tagSummary[] {
  const tagMap = new Map<string, number>();

  for (const row of rows) {
    if (!row.name || !row.startTime || !row.endTime) continue;

    const minutes = Math.max(
      0,
      (new Date(row.endTime).getTime() - new Date(row.startTime).getTime()) / 60000
    );

    tagMap.set(row.name, (tagMap.get(row.name) || 0) + minutes);
  }

  return Array.from(tagMap.entries()).map(([tag, total_minutes]) => ({
    tag,
    total_minutes,
  }));
}
