import { db } from "../index.js";
import { studySessions } from "../../schema/studySessions.js";
import { desc, ilike } from "drizzle-orm";

export async function searchSession(searchTerm: string) {
  const sessions = await db
    .select()
    .from(studySessions)
    .where(
      ilike(studySessions.note, `%${searchTerm}%`)
    )
    .orderBy(desc(studySessions.createdAt)); 

  return sessions;
}
