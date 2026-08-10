import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  // AI Provider — "gemini" | "openai" | "anthropic" (default: gemini)
  AI_PROVIDER: z.enum(["gemini", "openai", "anthropic"]).default("gemini"),
  // Model name for the chosen provider (e.g. gemini-2.5-flash, gpt-4o, claude-3-5-sonnet-20241022)
  AI_MODEL: z.string().optional(),
  // Provider-specific API keys (only the key for your chosen provider is required)
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  DEFAULT_BUSINESS_ID: z.string().optional(),
  DEFAULT_TIMEZONE: z.string().default("Asia/Dhaka"),
  CORS_ORIGIN: z.string().default("http://localhost:3000")
});

export const env = envSchema.parse(process.env);
