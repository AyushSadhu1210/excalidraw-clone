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
  const token = req.headers["authorization"] ?? "";
  const decoded = jwt.verify(token, "secret");

  if (typeof decoded !== "string" && typeof decoded.userId === "string") {
    req.userId = decoded.userId;
    next();
  } else {
    res.status(411).json({
      message: "Unauthorised",
    });
  }
};
