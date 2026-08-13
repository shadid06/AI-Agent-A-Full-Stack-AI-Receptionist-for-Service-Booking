import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as controller from "./auth.controller.js";

export const authRouter = Router();

authRouter.get("/me", requireAuth, controller.me);
