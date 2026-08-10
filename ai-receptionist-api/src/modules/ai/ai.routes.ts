import { Router } from "express";
import { chatController } from "./ai.controller.js";

export const aiRouter = Router();

aiRouter.post("/chat", chatController);
