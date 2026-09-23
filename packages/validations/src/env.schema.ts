import z from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  PORT: z.coerce.number().int().positive().default(5000),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  NEXT_PUBLIC_BACKEND_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_BACKEND_URL is required"),
  NEXT_PUBLIC_WS_URL: z.string().min(1, "NEXT_PUBLIC_WS_URL is required"),
});
