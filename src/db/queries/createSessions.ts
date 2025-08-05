import { db } from "../index.js";
import { studySessions, NewStudySession } from "../../schema/studySessions.js";

export async function createStudySession(session: NewStudySession) {
  const [result] = await db
    .insert(studySessions)
    .values(session)
    .onConflictDoNothing()
    .returning();
  return result;
}
