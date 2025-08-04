import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}


export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
  const match = await bcrypt.compare(password, hash);
  return match;
}
