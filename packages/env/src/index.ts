import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { envSchema } from "@repo/validations";

const envFilePath = resolve(dirname(fileURLToPath(import.meta.url)), "../.env");

config({ path: envFilePath });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error(
    `Missing or invalid env in ${envFilePath}. Ensure packages/env/.env is configured.`,
  );
}

export const env = parsed.data;
export type Env = typeof env;
