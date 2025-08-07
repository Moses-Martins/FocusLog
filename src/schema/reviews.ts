import { pgTable, uuid, integer , timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { tags } from "./tags.js";

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").references(() => tags.id),
  reviewTime: timestamp("review_time").notNull(),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type NewReview = typeof reviews.$inferInsert;
