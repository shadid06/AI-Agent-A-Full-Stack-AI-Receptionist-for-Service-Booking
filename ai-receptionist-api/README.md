# AI Receptionist API

An open-source, multi-industry AI receptionist backend built to demonstrate a production-style AI agent architecture.

## What it can do

The same backend can power:

- Hotel booking
- Salon booking
- Clinic appointment booking
- Spa booking
- Hospital appointment booking
- Law-firm consultation booking
- Personal meeting booking
- Other appointment/reservation businesses

The AI agent uses **Gemini 2.5 Flash** and function calling to execute real backend tools.

### Current AI tools

1. `search_services`
2. `get_availability`
3. `create_booking`
4. `get_booking`
5. `update_booking`
6. `cancel_booking`

The model does not directly access PostgreSQL. It asks for a tool, the Node.js application validates and executes it, then the result is returned to Gemini.

## Architecture

```text
Next.js / Flutter / Phone / Voice UI
                |
                v
        Express REST API
                |
        +-------+--------+
        |                |
        v                v
   Gemini 2.5 Flash   PostgreSQL
        |
        v
  Function Calling
        |
        v
 Booking Tool Layer
        |
        +--> search services
        +--> availability
        +--> create booking
        +--> get booking
        +--> update booking
        +--> cancel booking
```

## Tech stack

- Node.js 20+
- TypeScript
- Express 5
- Gemini 2.5 Flash
- `@google/genai`
- Prisma ORM 6
- PostgreSQL
- Zod
- Helmet
- CORS
- Morgan

Google's current JavaScript SDK is `@google/genai`; the older `@google/generative-ai` package is deprecated. Gemini 2.5 Flash supports function calling and is intended for low-latency/agentic use cases.

## 1. PostgreSQL

Your PostgreSQL is installed locally. Create a database called:

```sql
CREATE DATABASE ai_receptionist;
```

If `psql` is not available in PATH, use pgAdmin or the `psql.exe` inside your PostgreSQL installation.

Your `.env` should look similar to:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_receptionist?schema=public"
```

The `E:\postgre-install` folder is an installation location, not the database connection string itself. The connection uses PostgreSQL's host, port, username, password and database name.

## 2. Install

```bash
npm install
```

Copy:

```text
.env.example
```

to:

```text
.env
```

Then add your Gemini API key:

```env
GEMINI_API_KEY="YOUR_KEY"
GEMINI_MODEL="gemini-2.5-flash"
```

Keep this key on the Node.js server. Never put it in Next.js browser code.

## 3. Prisma

Generate Prisma Client:

```bash
npm run prisma:generate
```

Create the first migration:

```bash
npm run prisma:migrate -- --name init
```

Seed demo data:

```bash
npm run db:seed
```

The seed command prints:

```text
BUSINESS_ID=...
```

Put that value into:

```env
DEFAULT_BUSINESS_ID="..."
```

## 4. Start

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Health check:

```text
GET http://localhost:4000/health
```

## 5. Test the AI agent

All business-scoped requests use:

```http
x-business-id: YOUR_BUSINESS_ID
```

Example:

```bash
curl -X POST http://localhost:4000/api/v1/ai/chat ^
  -H "Content-Type: application/json" ^
  -H "x-business-id: YOUR_BUSINESS_ID" ^
  -d "{\"sessionId\":\"demo-session-1\",\"message\":\"I want a relaxation massage tomorrow afternoon.\"}"
```

On PowerShell, this can also be easier:

```powershell
$body = @{
  sessionId = "demo-session-1"
  message = "I want a relaxation massage tomorrow afternoon."
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:4000/api/v1/ai/chat" `
  -Method POST `
  -Headers @{
    "Content-Type" = "application/json"
    "x-business-id" = "YOUR_BUSINESS_ID"
  } `
  -Body $body
```

The agent should search the service, ask for missing details, check availability, and only create a booking after enough information is collected.

## REST endpoints

### Health

```http
GET /health
```

### Business

```http
GET /api/v1/businesses/:businessId
```

### Services

```http
GET /api/v1/bookings/services
x-business-id: BUSINESS_ID
```

Optional:

```http
GET /api/v1/bookings/services?q=massage
```

### Availability

```http
GET /api/v1/bookings/availability?serviceId=SERVICE_ID&date=2026-08-11
x-business-id: BUSINESS_ID
```

Optional staff:

```text
&staffId=STAFF_ID
```

### Create booking

```http
POST /api/v1/bookings
x-business-id: BUSINESS_ID
Content-Type: application/json
```

Body:

```json
{
  "serviceId": "SERVICE_ID",
  "customerName": "John Doe",
  "customerPhone": "+8801700000000",
  "customerEmail": "john@example.com",
  "startAt": "2026-08-11T10:00:00.000Z",
  "notes": "First visit"
}
```

### List bookings

```http
GET /api/v1/bookings
x-business-id: BUSINESS_ID
```

Filter by date:

```text
?date=2026-08-11
```

### Get booking

```http
GET /api/v1/bookings/:bookingId
x-business-id: BUSINESS_ID
```

### Update booking

```http
PATCH /api/v1/bookings/:bookingId
x-business-id: BUSINESS_ID
Content-Type: application/json
```

Example:

```json
{
  "startAt": "2026-08-11T11:00:00.000Z"
}
```

### Cancel booking

```http
DELETE /api/v1/bookings/:bookingId
x-business-id: BUSINESS_ID
```

## Important design decision

The LLM is **not** the source of truth.

For example, if the user says:

> "Book me tomorrow at 5 PM."

Gemini should not simply answer:

> "Done."

It must:

1. Identify the service.
2. Ask for missing customer information.
3. Call `get_availability`.
4. Read the actual available slots from PostgreSQL.
5. Confirm the selected slot.
6. Call `create_booking`.
7. Only then tell the customer the booking is confirmed.

The same principle applies to update and cancellation.

## Why this architecture is recruiter-friendly

This project demonstrates more than "I called an LLM API."

It demonstrates:

- LLM integration
- Agent loop
- Function/tool calling
- Tool schema design
- Business logic separation
- Zod validation
- TypeScript
- REST API design
- PostgreSQL data modeling
- Prisma ORM
- Transaction/conflict thinking
- Multi-business architecture
- Conversation persistence
- AI safety rules
- Extensible booking domain

## Next roadmap

### Phase 1 — Current

- Gemini agent
- Tool calling
- PostgreSQL
- Prisma
- Generic booking domain
- CRUD
- Conversation history

### Phase 2 — Next.js

Build:

- Customer chat UI
- Admin dashboard
- Service management
- Staff management
- Booking calendar
- Conversation viewer
- AI tool execution logs

### Phase 3 — Voice

Add:

```text
Browser microphone
      |
      v
Speech-to-text
      |
      v
Gemini agent
      |
      v
Booking tools
      |
      v
Text-to-speech
```

### Phase 4 — Phone receptionist

Integrate a telephony provider so customers can call the business and talk to the receptionist.

### Phase 5 — Production

Add:

- Authentication
- Role-based access
- Rate limiting
- Audit logs
- Redis
- Background jobs
- Notifications
- Email/SMS/WhatsApp
- Payment/deposit support
- Business-specific policies
- Observability
- Automated tests
- Docker
- CI/CD

## Open-source recommendation

Before publishing to GitHub:

```bash
git init
git add .
git commit -m "feat: initial AI receptionist backend"
```

Do not commit `.env`.

Use `.env.example` for public configuration.

## License

MIT
