import { db } from "../index.js";
import { users } from "../../schema/users.js";
import { eq } from 'drizzle-orm';

export async function findUserByID(id: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id));

  return user;
}
