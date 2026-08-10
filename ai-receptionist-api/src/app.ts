import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { aiRouter } from "./modules/ai/ai.routes.js";
import { bookingRouter } from "./modules/booking/booking.routes.js";
import { businessRouter } from "./modules/business/business.routes.js";
import { serviceRouter } from "./modules/services/service.routes.js";
import { staffRouter } from "./modules/staffs/staff.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "ai-receptionist-api",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/businesses", businessRouter);
app.use("/api/v1/services", serviceRouter);
app.use("/api/v1/staffs", staffRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
