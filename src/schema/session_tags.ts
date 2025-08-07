import { tags } from "./tags.js";
import { studySessions } from "./studySessions.js";
import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";

export const sessionTags = pgTable(
  "session_tags",
  {
    sessionId: uuid("session_id").notNull().references(() => studySessions.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey(table.sessionId, table.tagId),
  })
);

export type SessionTag = typeof sessionTags.$inferInsert;
