import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as controller from "./business.controller.js";

export const businessRouter = Router();

businessRouter.use(requireAuth);

businessRouter.get("/", controller.list);
businessRouter.post("/", controller.create);

businessRouter.get("/:businessId", controller.get);
businessRouter.patch("/:businessId", controller.update);
businessRouter.delete("/:businessId", controller.remove);
