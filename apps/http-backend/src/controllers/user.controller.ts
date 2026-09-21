import { Request, Response } from "express";
import {
  CreateRoomSchema,
  CreateUserSchema,
  SigningSchema,
} from "@repo/validations";
import { prismaClient } from "@repo/db/client";
import jwt from "jsonwebtoken";
import { env } from "@repo/env";

interface AuthenticatedRequest extends Request {
  userId: string;
}

export const userSignUpController = async (req: Request, res: Response) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.error(parsedData.error);
    res.status(400).json({
      message: "Incorrect inputs",
    });
    return;
  }
  try {
    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data.email,
        password: parsedData.data.password,
        name: parsedData.data.name,
      },
    });
    const token = jwt.sign(
      {
        userId: user.id,
      },
      env.JWT_SECRET,
    );
    return res.status(201).json({
      token,
      userId: user.id,
    });
  } catch (e) {
    console.error("signup error", e);
    const err = e as Error & { code?: string };
    if (err.code === "P2002") {
      return res.status(409).json({
        message: "Email already registered",
      });
    }
    res.status(500).json({
      message: err.message || "Signup failed",
    });
  }
};

export const userSigninController = async (req: Request, res: Response) => {
  const parsedData = SigningSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.error(parsedData.error);
    res.status(400).json({
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
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    env.JWT_SECRET,
  );
  return res.json({
    token,
  });
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
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.slug,
        adminId: userId,
      },
    });
    return res.json({
      message: "Room created successfully",
      roomId: room.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(411).json({
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

export const getRoomBySlugController = async (req: Request, res: Response) => {
  const slug = req.params.slug || "";
  const room = await prismaClient.room.findFirst({
    where: {
      slug: slug as string,
    },
  });
  if (!room) {
    return res.status(404).json({
      message: "Room not found",
    });
  }
  return res.json({
    roomId: room.id,
  });
};
