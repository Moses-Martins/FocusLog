import { db } from "../index.js";
import { tags } from "../../schema/tags.js";
import { desc } from "drizzle-orm"


export async function getAllTags() {
  const sessions = await db
    .select()
    .from(tags)
    .orderBy(desc(tags.createdAt));

  return sessions;
}


