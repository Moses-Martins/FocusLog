import { Request, Response } from 'express';
import { findUserByID } from './db/queries/findUserByID.js';
import { validateJWT } from './jwt.js';
import { config } from './config.js';
import { getBearerToken } from './auth.js';
import { createObjectCsvStringifier } from 'csv-writer';
import { getAllSessionTagsByUserID, SessionRow, GroupedSession} from './db/queries/getAllSessionTagsByUserID.js';
import { Error401 } from './ErrorClass.js';




export async function handlerExportCsv(req: Request, res: Response) {
    const token = getBearerToken(req)
    const IDStr = validateJWT(token, config.secret)
    const userFoundByID = await findUserByID(IDStr);
    if (userFoundByID.id !== IDStr) {
        throw new Error401("Invalid or expired token.");
    }

    const allSessionTags = await getAllSessionTagsByUserID(userFoundByID.id)

    const allMergedSessionTags = groupSessions(allSessionTags)

    const csvStringifier = createObjectCsvStringifier({
        header: [
            { id: 'id', title: 'ID'},
            { id: 'createdAt', title: 'Created At'},
            { id: 'title', title: 'Title'},
            { id: 'startTime', title: 'Start Time'},
            { id: 'endTime', title: 'End Time'},
            { id: 'note', title: 'Note'},
            { id: 'tags', title: 'Tags'},
        ],
    });

    const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(allMergedSessionTags);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
    console.log(csv)
    res.status(200).send(csv)
    res.end();
}


function groupSessions(rows: SessionRow[]): GroupedSession[] {
  const map = new Map<string, GroupedSession & { tagsArray: string[] }>();

  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        title: row.title,
        startTime: row.startTime,
        endTime: row.endTime,
        note: row.note,
        createdAt: row.createdAt,
        tagsArray: row.name ? [row.name] : [],
        tags: "", // placeholder, will fill later
      });
    } else {
      const session = map.get(row.id)!;
      if (row.name && !session.tagsArray.includes(row.name)) {
        session.tagsArray.push(row.name);
      }
    }
  }

  // Convert tags array to comma-separated string and remove tagsArray helper
  return Array.from(map.values()).map(({ tagsArray, ...session }) => ({
    ...session,
    tags: tagsArray.join(", "),
  }));
}

