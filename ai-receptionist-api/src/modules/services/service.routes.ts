import { Router } from "express";
import * as controller from "./service.controller.js";

export const serviceRouter = Router();

serviceRouter.get("/", controller.list);
serviceRouter.post("/", controller.create);
serviceRouter.get("/:serviceId", controller.get);
serviceRouter.patch("/:serviceId", controller.update);
serviceRouter.delete("/:serviceId", controller.remove);
