import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig, env } from "prisma/config";

// Shared monorepo env lives in packages/env/.env
config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../../env/.env"),
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
