import { db } from "../index.js";
import { studySessions } from "../../schema/studySessions.js";
import { sessionTags } from "../../schema/session_tags.js";
import { tags } from "../../schema/tags.js";
import { eq } from "drizzle-orm"; 


export type SessionRow = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  note: string;
  createdAt: Date;
  name: string | null; // tag name, can be null
};

export type GroupedSession = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  note: string;
  createdAt: Date;
  tags: string; // comma-separated tag names
};


export async function getAllSessionTagsByUserID(userId: string) {
  const result = await db
    .select({
      id: studySessions.id,
      title: studySessions.title,
      startTime: studySessions.startTime,
      endTime: studySessions.endTime,
      note: studySessions.note,
      createdAt: studySessions.createdAt,
      name: tags.name,
    })
    .from(studySessions)
    .where(eq(studySessions.userId, userId)) // filter by userId
    .leftJoin(sessionTags, eq(studySessions.id, sessionTags.sessionId))
    .leftJoin(tags, eq(sessionTags.tagId, tags.id));

  return result;
}
