import type { Request, Response, NextFunction } from "express";
import { chatSchema } from "./ai.schemas.js";
import { chat } from "./ai.service.js";
import { resolveBusinessContext } from "../../lib/tenant.js";
import { AppError } from "../../lib/errors.js";

export async function chatController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { businessId } = await resolveBusinessContext(req, {
      allowHeaderFallback: true
    });
    const input = chatSchema.parse(req.body);

    const result = await chat({
      businessId,
      sessionId: input.sessionId,
      message: input.message
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("[chatController ERROR]", error instanceof Error ? error.stack : error);
    next(error);
  }
}
