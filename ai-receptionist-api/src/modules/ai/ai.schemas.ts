import { z } from "zod";

export const chatSchema = z.object({
  sessionId: z.string().min(1).max(120),
  message: z.string().min(1).max(5000)
});

export type ChatInput = z.infer<typeof chatSchema>;
