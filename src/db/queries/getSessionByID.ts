import { db } from "../index.js";
import { studySessions } from "../../schema/studySessions.js";
import { eq } from 'drizzle-orm';

export async function getSessionByID(id: string) {
  const [studySession] = await db
    .select()
    .from(studySessions)
    .where(eq(studySessions.id, id));

  return studySession;
}
