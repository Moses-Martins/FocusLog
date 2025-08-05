import { eq, and } from "drizzle-orm";
import { db } from "../index.js";
import { studySessions } from "../../schema/studySessions.js";

export async function deleteSessionByID(userId: string, sessionId: string): Promise<boolean> {
  const deleted = await db
    .delete(studySessions)
    .where(
      and(
        eq(studySessions.userId, userId),
        eq(studySessions.id, sessionId)
      )
    )
    .returning({ id: studySessions.id });

  return deleted.length > 0;
}
