import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.email().min(3).max(255),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(50),
});

export const SigningSchema = z.object({
  email: z.email().min(3).max(255),
  password: z.string().min(1).max(100),
});

export const CreateRoomSchema = z.object({
  slug: z.string().min(3).max(20),
});
