import type { Request, Response } from "express";
import { chatSchema } from "./ai.schemas.js";
import { chat } from "./ai.service.js";
import { AppError } from "../../lib/errors.js";

export async function chatController(req: Request, res: Response) {
  const businessId = req.header("x-business-id");

  if (!businessId) {
    throw new AppError(400, "Missing x-business-id header");
  }

  const input = chatSchema.parse(req.body);

  const result = await chat({
    businessId,
    sessionId: input.sessionId,
    message: input.message
  });

  res.json({ success: true, data: result });
}
