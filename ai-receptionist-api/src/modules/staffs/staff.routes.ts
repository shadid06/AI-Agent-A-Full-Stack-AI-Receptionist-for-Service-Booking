import { Router } from "express";
import * as controller from "./staff.controller.js";

export const staffRouter = Router();

staffRouter.get("/", controller.list);
staffRouter.post("/", controller.create);
staffRouter.get("/:staffId", controller.get);
staffRouter.patch("/:staffId", controller.update);
staffRouter.delete("/:staffId", controller.remove);
