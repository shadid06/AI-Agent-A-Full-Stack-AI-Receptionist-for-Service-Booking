import { env } from "../../config/env.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

/**
 * Returns the LLM instance for the configured provider.
 *
 * To switch providers, change AI_PROVIDER in your .env file:
 *   AI_PROVIDER=gemini      → Google Gemini  (requires GEMINI_API_KEY)
 *   AI_PROVIDER=openai      → OpenAI GPT     (requires OPENAI_API_KEY, install @langchain/openai)
 *   AI_PROVIDER=anthropic   → Anthropic Claude (requires ANTHROPIC_API_KEY, install @langchain/anthropic)
 */
export function getLLM(): BaseChatModel {
  switch (env.AI_PROVIDER) {
    case "openai": {
      // Install first: pnpm add @langchain/openai
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ChatOpenAI } = require("@langchain/openai");
      if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required when AI_PROVIDER=openai");
      return new ChatOpenAI({
        model: env.AI_MODEL ?? "gpt-4o-mini",
        temperature: 0.2,
        apiKey: env.OPENAI_API_KEY
      });
    }

    case "anthropic": {
      // Install first: pnpm add @langchain/anthropic
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ChatAnthropic } = require("@langchain/anthropic");
      if (!env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic");
      return new ChatAnthropic({
        model: env.AI_MODEL ?? "claude-3-5-sonnet-20241022",
        temperature: 0.2,
        apiKey: env.ANTHROPIC_API_KEY
      });
    }

    case "gemini":
    default: {
      if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is required when AI_PROVIDER=gemini");
      return new ChatGoogleGenerativeAI({
        model: env.AI_MODEL ?? env.GEMINI_MODEL,
        temperature: 0.2,
        apiKey: env.GEMINI_API_KEY
      });
    }
  }
}
