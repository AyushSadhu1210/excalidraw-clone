import { IRouter, RequestHandler, Router } from "express";
import {
  createRoomController,
  getRoomChatController,
  userSigninController,
  userSignUpController,
} from "../controllers/user.controller.js";
import { authenticationMiddleware } from "../middlewares/authenticationMiddleware.js";

const router: IRouter = Router();

router.post("/signup", userSignUpController);
router.post("/signin", userSigninController);
router.post(
  "/create-room",
  authenticationMiddleware,
  createRoomController as any,
);
router.get(
  "/get-room-chats/:roomId",
  authenticationMiddleware,
  getRoomChatController,
);

export default router;
