import { eq, and } from "drizzle-orm";
import { db } from "../index.js";
import { tags } from "../../schema/tags.js";

export async function deleteTagByID(userId: string, TagId: string): Promise<boolean> {
  const deleted = await db
    .delete(tags)
    .where(
      and(
        eq(tags.userId, userId),
        eq(tags.id, TagId)
      )
    )
    .returning({ id: tags.id });

  return deleted.length > 0;
}
