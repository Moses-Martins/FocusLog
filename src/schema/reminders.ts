import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const reminders = pgTable("reminders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  remindAt: timestamp("remind_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type NewReminder = typeof reminders.$inferInsert;
