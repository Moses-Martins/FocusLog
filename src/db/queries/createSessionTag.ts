import { db } from "../index.js";
import { SessionTag, sessionTags } from "../../schema/session_tags.js";

export async function createSessionTag(sessionTag: SessionTag) {
  const [result] = await db
    .insert(sessionTags)
    .values(sessionTag)
    .onConflictDoNothing()
    .returning();
    
  return result;
}






