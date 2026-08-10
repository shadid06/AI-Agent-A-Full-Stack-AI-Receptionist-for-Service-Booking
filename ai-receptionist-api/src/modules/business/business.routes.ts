import { Router } from "express";
import * as controller from "./business.controller.js";

export const businessRouter = Router();

businessRouter.get("/", controller.list);
businessRouter.post("/", controller.create);

businessRouter.get("/:businessId", controller.get);
businessRouter.patch("/:businessId", controller.update);
businessRouter.delete("/:businessId", controller.remove);
