import { tags } from "./tags";
import { studySessions } from "./studySessions";
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
