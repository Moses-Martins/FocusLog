import { createObjectCsvStringifier } from 'csv-writer';
import { Request, Response } from 'express';
import { getBearerToken } from './auth.js';
import { config } from './config.js';
import { findUserByID } from './db/queries/findUserByID.js';
import { getAllSessionTagsByUserID, GroupedSession, SessionRow } from './db/queries/getAllSessionTagsByUserID.js';
import { Error401 } from './ErrorClass.js';
import { validateJWT } from './jwt.js';

/**
 * @swagger
 * /api/export/csv:
 *   get:
 *     summary: Export user sessions with tags as CSV
 *     description: Exports all study sessions (with their tags) belonging to the authenticated user as a downloadable CSV file.
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - text/csv
 *     responses:
 *       200:
 *         description: Successfully exported CSV file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               example: |
 *                 ID,Created At,Title,Start Time,End Time,Note,Tags
 *                 sess_1,2025-10-30,Study Math,2025-10-30T10:00:00Z,2025-10-30T12:00:00Z,Chapter 4,Math,Algebra
 *       401:
 *         description: Unauthorized — invalid or expired token
 *       500:
 *         description: Internal server error
 */

export async function handlerExportCsv(req: Request, res: Response) {
  const token = getBearerToken(req);
  const IDStr = validateJWT(token, config.secret);
  const userFoundByID = await findUserByID(IDStr);
  if (userFoundByID.id !== IDStr) {
    throw new Error401('Invalid or expired token.');
  }

  const allSessionTags = await getAllSessionTagsByUserID(userFoundByID.id);
  const allMergedSessionTags = groupSessions(allSessionTags);

  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'id', title: 'ID' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'title', title: 'Title' },
      { id: 'startTime', title: 'Start Time' },
      { id: 'endTime', title: 'End Time' },
      { id: 'note', title: 'Note' },
      { id: 'tags', title: 'Tags' },
    ],
  });

  const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(allMergedSessionTags);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
  res.status(200).send(csv);
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
        tags: '',
      });
    } else {
      const session = map.get(row.id)!;
      if (row.name && !session.tagsArray.includes(row.name)) {
        session.tagsArray.push(row.name);
      }
    }
  }

  return Array.from(map.values()).map(({ tagsArray, ...session }) => ({
    ...session,
    tags: tagsArray.join(', '),
  }));
}
