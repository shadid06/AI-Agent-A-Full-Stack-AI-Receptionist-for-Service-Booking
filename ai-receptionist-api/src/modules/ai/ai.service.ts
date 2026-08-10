import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { prisma } from "../../lib/prisma.js";
import { getLLM } from "./ai.llm.js";
import { buildTools } from "./ai.tools.js";

const SYSTEM_INSTRUCTION = `
You are an AI receptionist for a real business.

Your job:
- Help customers find services.
- Check real availability.
- Create, retrieve, update, and cancel bookings using tools.
- Be concise, friendly, professional, and natural.
- Support English and Bangla. Reply in the language the customer uses.
- Never invent service names, staff names, prices, availability, booking IDs, or policies.
- Never claim a booking is completed unless the create_booking tool succeeds.
- ALWAYS check availability before creating a booking.
- ALWAYS check availability before changing booking time/staff.
- Before creating a booking, collect at minimum: service, date/time, customer name, and phone.
- If a requested slot is unavailable, offer available alternatives returned by the tool.
- For cancellation, make sure the customer has identified the correct booking before calling cancel_booking.
- For a vague service request, call search_services first.
- Use ISO-8601 datetimes for tool calls.
- If the user gives a date without a timezone, assume the business timezone.
- Do not provide medical, legal, or financial advice. For clinics, hospitals, or law firms, act only as a receptionist and booking assistant.
- If a request is outside booking/receptionist capabilities, say so and offer to help with supported booking tasks.
`;

type ChatInput = {
  businessId: string;
  sessionId: string;
  message: string;
};

export async function chat(input: ChatInput) {
  // 1. Load conversation history from DB
  const previousMessages = await prisma.conversation.findMany({
    where: {
      businessId: input.businessId,
      sessionId: input.sessionId
    },
    orderBy: { createdAt: "asc" },
    take: 30
  });

  // 2. Convert DB messages to LangChain message format
  const history = previousMessages.map((msg) =>
    msg.role === "assistant"
      ? new AIMessage(msg.content)
      : new HumanMessage(msg.content)
  );

  // 3. Persist the new user message
  await prisma.conversation.create({
    data: {
      businessId: input.businessId,
      sessionId: input.sessionId,
      role: "user",
      content: input.message
    }
  });

  // 4. Build the agent with the correct LLM + tools for this business
  const llm = getLLM();
  const tools = buildTools(input.businessId);

  const agent = createReactAgent({
    llm,
    tools,
    // System prompt injected as first message
    stateModifier: new SystemMessage(SYSTEM_INSTRUCTION)
  });

  // 5. Run the agent
  const result = await agent.invoke({
    messages: [...history, new HumanMessage(input.message)]
  });

  // 6. Extract the last AI message as the response
  const messages = result.messages as (HumanMessage | AIMessage)[];
  const lastAIMessage = [...messages].reverse().find((m) => m._getType() === "ai");
  const text =
    (typeof lastAIMessage?.content === "string"
      ? lastAIMessage.content
      : lastAIMessage?.content
          ?.filter((c: any) => c.type === "text")
          .map((c: any) => c.text)
          .join("")) || "Sorry, I couldn't generate a response.";

  // 7. Persist assistant reply
  await prisma.conversation.create({
    data: {
      businessId: input.businessId,
      sessionId: input.sessionId,
      role: "assistant",
      content: text
    }
  });

  return { text, sessionId: input.sessionId };
}
