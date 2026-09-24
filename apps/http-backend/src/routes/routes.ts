import { IRouter, Router } from "express";
import {
  createRoomController,
  getRoomBySlugController,
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
router.get("/get-room-chats/:roomId", getRoomChatController);
router.get("/get-room-by-slug/:slug", getRoomBySlugController);
export default router;
