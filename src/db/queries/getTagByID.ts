import { db } from "../index.js";
import { tags } from "../../schema/tags.js";
import { eq } from 'drizzle-orm';

export async function getTagByID(id: string) {
  const [tag] = await db
    .select()
    .from(tags)
    .where(eq(tags.id, id));

  return tag;
}
