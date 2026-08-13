# Conversation Memory

## Purpose

Conversation memory stores the chat history for each user session.

## Storage

- `Conversation` rows store message role, content, business ID, and session ID.
- Messages are loaded in chronological order before each agent turn.

## How to use

1. Send the same `sessionId` for a continuing conversation.
2. The backend loads recent messages for that business and session.
3. The assistant reply is appended to the conversation table.

## Notes

- This is what makes the receptionist feel persistent.
- Memory is scoped by business and session, so one tenant cannot read another tenant’s transcript.

