import { db } from "../index.js";
import { NewTag, tags } from "../../schema/tags.js";

export async function createTag(tag: NewTag) {
  const [result] = await db
    .insert(tags)
    .values(tag)
    .onConflictDoNothing()
    .returning();
  return result;
}
