import { db } from "../index.js";
import { users } from "../../schema/schema.js";
import { eq } from 'drizzle-orm';

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  return user;
}

