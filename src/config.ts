// src/config.ts
// Load .env file only in development (local) — safe for Render
if (process.env.NODE_ENV !== "production") {
  try {
    // Node v21+ built-in .env loader
    process.loadEnvFile?.();
  } catch {
    console.warn(" No .env file found — using environment variables only.");
  }
}

type APIConfig = {
  fileserverHits: number;
  dbURL: string;
  secret: string;
};

export const config: APIConfig = {
  fileserverHits: 0,
  dbURL: envOrThrow("DB_URL"),
  secret: envOrThrow("SECRET"),
};

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(` Missing required environment variable: ${key}`);
  }
  return value;
}
