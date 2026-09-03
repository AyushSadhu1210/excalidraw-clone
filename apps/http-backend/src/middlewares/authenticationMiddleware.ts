import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authenticationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers["authorization"] ?? "";
  const decoded = jwt.verify(token, "secret");

  if (decoded) {
    //@ts-ignore
    req.userId = decoded.userId;
    next();
  } else {
    res.status(411).json({
      message: "Unauthorised",
    });
  }
};
