import { db } from "../index.js";
import { studySessions } from "../../schema/studySessions.js";
import { sessionTags } from "../../schema/session_tags.js";
import { tags } from "../../schema/tags.js";
import { eq, sql } from "drizzle-orm"; 


export type sessionTagRow = {
  name: string;       
  startTime: Date;     
  endTime: Date;       
};

export type tagSummary = {
  tag: string;         
  total_minutes: number; 
};

export async function getDateSessionTag(date: Date) {
  const result = await db
    .select({
      startTime: studySessions.startTime,
      endTime: studySessions.endTime,
      name: tags.name,
    })
    .from(studySessions)
    .where(eq(sql`${studySessions.startTime}::date`, sql`${date.toISOString().slice(0, 10)}`))
    .innerJoin(sessionTags, eq(studySessions.id, sessionTags.sessionId))
    .innerJoin(tags, eq(sessionTags.tagId, tags.id));

  return result;
}
