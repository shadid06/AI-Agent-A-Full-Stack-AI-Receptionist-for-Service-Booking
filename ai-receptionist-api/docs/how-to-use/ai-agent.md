# AI Agent

## Purpose

The AI agent is the receptionist brain that handles conversation and tool calls.

## Main route

- `POST /api/v1/ai/chat`

## How to use

1. Send a `sessionId` and a customer message.
2. The agent loads prior conversation history from PostgreSQL.
3. The agent chooses tools for search, availability, booking, update, or cancel.
4. The response is stored back into conversation history.

## Tool behavior

The agent can:

- search services
- check availability
- create bookings
- retrieve bookings
- update bookings
- cancel bookings
- search staff
- get staff availability
- list bookings

## Guardrails

- Do not let the model invent slots, prices, or booking IDs.
- Always validate availability before creating or changing a booking.
- Keep responses concise, professional, and language-aware.

## Notes

- The backend currently supports a ReAct-style tool-using agent.
- The agent is only as reliable as the business data it can validate against.

