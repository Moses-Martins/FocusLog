import { db } from "../index.js";
import { tags } from "../../schema/tags.js";
import { eq } from 'drizzle-orm';

export async function getTagIDByName(name: string) {
  const [result] = await db
    .select()
    .from(tags)
    .where(eq(tags.name, name));

    return result?.id ?? null;
}


