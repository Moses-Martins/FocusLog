import { db } from "../index.js";
import { studySessions } from "../../schema/studySessions.js";
import { sessionTags } from "../../schema/session_tags.js";
import { tags } from "../../schema/tags.js";
import { eq } from "drizzle-orm"; 


export async function getInnerJoinSessionTags(sessionId: string) {
  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
    })
    .from(studySessions)
    .where(eq(studySessions.id, sessionId)) // ✅ filter by the sessionId
    .innerJoin(sessionTags, eq(studySessions.id, sessionTags.sessionId))
    .innerJoin(tags, eq(sessionTags.tagId, tags.id));

  return result;
}
