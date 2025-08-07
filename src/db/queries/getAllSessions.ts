import { db } from "../index.js";
import { studySessions } from "../../schema/studySessions.js";
import { desc } from "drizzle-orm"


export async function getAllSessions() {
  const sessions = await db
    .select()
    .from(studySessions)
    .orderBy(desc(studySessions.startTime));

  return sessions;
}

