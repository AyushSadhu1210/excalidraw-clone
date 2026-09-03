import { env } from "@repo/env";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticationMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({
      message: "Unauthorised",
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (typeof decoded !== "string" && typeof decoded.userId === "string") {
      req.userId = decoded.userId;
      return next();
    }
  } catch {
    // malformed, expired, or invalid signature
  }

  return res.status(401).json({
    message: "Unauthorised",
  });
};
