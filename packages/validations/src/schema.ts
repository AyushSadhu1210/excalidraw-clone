import { email, z } from "zod";

export const CreateUserSchema = z.object({
  email: z.email().min(3).max(20),
  password: z.string(),
  name: z.string(),
});

export const SigningSchema = z.object({
  email: z.email().min(3).max(20),
  password: z.string(),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(3).max(20),
});
