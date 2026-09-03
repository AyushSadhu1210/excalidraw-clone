import { Request, Response } from "express";
import {
  CreateRoomSchema,
  CreateUserSchema,
  SigningSchema,
} from "@repo/validations";
import { prismaClient } from "@repo/db/client";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  userId: string;
}

export const userSignUpController = async (req: Request, res: Response) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.error(parsedData.error);
    res.json({
      message: "Incorrect inputs",
    });
    return;
  }
  try {
    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data?.email,
        password: parsedData.data?.password,
        name: parsedData.data?.name,
      },
    });
    res.json(user.id);
  } catch (e) {
    console.error("signup error", e);
    const err = e as Error & { code?: string };
    res.status(411).json({
      message: err.message || "Signup failed",
      code: err.code,
    });
  }
};

export const userSigninController = async (req: Request, res: Response) => {
  const parsedData = SigningSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.error(parsedData.error);
    res.json({
      message: "Incorrect inputs",
    });
    return;
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.email,
      password: parsedData.data.password,
    },
  });

  if (!user) {
    return res.status(403).json({
      message: "Not Authorised",
    });
  }

  const token = jwt.sign(
    {
      userId: user?.id,
    },
    "secret",
  );
};

export const createRoomController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData || !parsedData.success) {
    console.error(parsedData.error);
    res.json({
      message: "Incorrect inputs",
    });
    return;
  }
  const userId = req.userId;
  try {
    const room = prismaClient.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId as string,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(411).json({
      message: "Room already exists",
    });
  }
};

export const getRoomChatController = async (req: Request, res: Response) => {
  try {
    const roomId = Number(req.params.roomId);
    const chats = prismaClient.chat.findMany({
      where: {
        roomId: roomId,
      },

      orderBy: {
        id: "desc",
      },

      take: 100,
    });
    res.json({ chats });
  } catch (e) {
    console.error(e);
    res.json({
      messages: [],
    });
  }
};
