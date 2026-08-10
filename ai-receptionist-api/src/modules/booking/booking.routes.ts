import { Router } from "express";
import * as controller from "./booking.controller.js";

export const bookingRouter = Router();

bookingRouter.get("/services", controller.searchServices);
bookingRouter.get("/availability", controller.availability);
bookingRouter.get("/", controller.list);
bookingRouter.post("/", controller.create);
bookingRouter.get("/:bookingId", controller.get);
bookingRouter.patch("/:bookingId", controller.update);
bookingRouter.delete("/:bookingId", controller.cancel);
