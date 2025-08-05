import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "src/schema",
  out: "src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgres://postgres:postgres@localhost:5432/focuslog?sslmode=disable",
  },
});