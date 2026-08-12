# AI Receptionist API

An open-source, multi-industry AI receptionist backend built to demonstrate a production-grade ReAct AI agent architecture using LangChain, LangGraph, TypeScript, Express, Prisma ORM, and PostgreSQL.

---

## 🚀 What It Can Do & Key Developed Functionalities

The same backend dynamically powers reception and booking workflows for multiple industries:

- 🏨 **Hotel booking** (Rooms & reservations)
- 💇 **Salon & Barber booking** (Stylists, haircuts, treatments)
- 🩺 **Clinic & Healthcare appointment booking** (Doctors, specialists)
- 💆 **Spa & Wellness booking** (Massages, therapies)
- 🏥 **Hospital appointment booking** (Departments & consultations)
- ⚖️ **Law Firm consultation booking** (Attorneys, legal advise)
- 📅 **Personal meeting booking** (Consultants, coaches)
- 🏢 **Other appointment & service-based businesses**

### 🧠 Core Developed Capabilities

1. **ReAct Agent Architecture (LangGraph)**: Built with `@langchain/langgraph` ReAct agents (`createReactAgent`) that reason, select tools, inspect parameters, execute database operations, and return structured answers.
2. **Multi-Provider LLM Abstraction**: Supports seamless switching between AI models via environment variables (`gemini`, `openai`, `anthropic`).
3. **Persisted Session Memory**: Full conversation history stored in PostgreSQL, restoring state across chat turns.
4. **Bilingual AI Communication**: Auto-detects and responds in English and Bangla.
5. **Real-time Slot Availability Calculation**: Computes valid booking slots based on staff schedules, existing reservations, service duration, and business operating hours.
6. **Robust Multi-Tenant Support**: Isolate business data and configurations via `x-business-id` headers.
7. **Complete Administrative REST Suite**: CRUD management APIs for Businesses, Services, Staff Members & Weekly Schedules, and Bookings.

---

## 🛠️ Developed AI Tools (LangChain Tools)

The AI Agent is equipped with **9 native LangChain tools** that bind directly to database services:

| # | Tool Name | Description | Parameters |
|---|---|---|---|
| 1 | `search_services` | Search active services offered by the business when vague service names are requested. | `query` (optional string) |
| 2 | `get_availability` | Computes available appointment time slots for a service on a given date (and optional staff). | `serviceId`, `date` (YYYY-MM-DD), `staffId` (optional) |
| 3 | `create_booking` | Creates a verified booking after slot confirmation and customer detail collection. | `serviceId`, `customerName`, `customerPhone`, `startAt` (ISO), `staffId` (opt), `customerEmail` (opt), `notes` (opt) |
| 4 | `get_booking` | Retrieves an existing booking record by booking ID. | `bookingId` |
| 5 | `update_booking` | Reschedules or modifies an existing booking with availability validation. | `bookingId`, `startAt` (opt ISO), `staffId` (opt), `notes` (opt) |
| 6 | `cancel_booking` | Cancels an active booking after confirmation. | `bookingId` |
| 7 | `search_staff` | Searches active staff members by name or role (`GENERAL`, `DOCTOR`, `LAWYER`, `THERAPIST`, `STYLIST`, `RECEPTIONIST`, `OTHER`). | `name` (optional), `role` (optional) |
| 8 | `get_staff_availability` | Fetches a specific staff member's weekly recurring schedule and working hours. | `staffId` |
| 9 | `list_bookings` | Lists and filters bookings by date or status (`PENDING`, `CONFIRMED`, `CANCELLED`). | `date` (optional YYYY-MM-DD), `status` (optional enum) |

> ⚠️ **Design Principle**: The LLM is **never** the source of truth. It cannot invent slots, prices, staff availability, or confirmation IDs. All data is dynamically validated against PostgreSQL via Prisma.

---

## 🏗️ Architecture

```text
       Next.js Frontends / Mobile Apps / Voice Agents / Webhooks
                                  |
                                  v
                      Express 5 REST API Router
                                  |
                  +---------------+---------------+
                  |                               |
                  v                               v
    LangChain / LangGraph ReAct Agent       PostgreSQL (Prisma ORM)
                  |                               |
      +-----------+-----------+                   |
      |                       |                   |
      v                       v                   v
 Multi-LLM Provider      9 Native AI Tools <--> Booking & Staff Logic
 [Gemini / OpenAI /       (Slot Math, CRUD,      (DB Validation & 
   Anthropic]               Staff Schedule)        Transactions)
```

---

## 💻 Tech Stack

- **Runtime & Language**: Node.js (>=20.9.0), TypeScript 5.9
- **Web Framework**: Express 5.1
- **AI Framework**: LangChain (`@langchain/core`, `@langchain/langgraph`), `@langchain/google-genai`, `@langchain/openai`, `@langchain/anthropic`
- **Database & ORM**: PostgreSQL, Prisma ORM 6.16
- **Validation**: Zod 4.0
- **Security & Utilities**: Helmet 8.1, CORS 2.8, Morgan 1.10, Dotenv 17.2, tsx

---

## 🗄️ Database Schemas & Data Models

The PostgreSQL database powered by Prisma ORM consists of 7 models:

- **Business**: Multi-tenant entity with `industry` enum (`HOTEL`, `SALON`, `CLINIC`, `SPA`, `HOSPITAL`, `LAW_FIRM`, `PERSONAL`, `OTHER`), timezone, and contact metadata.
- **Service**: Business services with `durationMin`, `price` (Decimal), and active state.
- **Staff**: Team members assigned to roles (`DOCTOR`, `LAWYER`, `STYLIST`, etc.).
- **StaffAvailability**: Weekly schedule matrix (`dayOfWeek` 0-6, `startTime`, `endTime`).
- **Customer**: Customer directory indexed by `[businessId, phone]`.
- **Booking**: Central booking registry tracking `startAt`, `endAt`, `status` (`PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`), and `source` (`AI`, `WEB`, `PHONE`, `MANUAL`).
- **Conversation**: Session history log mapping user and assistant messages per business session.

---

## 🚦 Getting Started

### 1. Prerequisites & PostgreSQL Setup

Create a PostgreSQL database locally:

```sql
CREATE DATABASE ai_receptionist;
```

Configure your `.env` file (copied from `.env.example`):

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_receptionist?schema=public"

# AI Provider Configuration ("gemini" | "openai" | "anthropic")
AI_PROVIDER="gemini"
AI_MODEL="gemini-2.5-flash"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Optional Providers
# OPENAI_API_KEY="sk-..."
# ANTHROPIC_API_KEY="sk-ant-..."

DEFAULT_BUSINESS_ID=""
DEFAULT_TIMEZONE="Asia/Dhaka"
CORS_ORIGIN="http://localhost:3000"
```

### 2. Installation & Migrations

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate -- --name init

# Seed initial multi-industry demo data
npm run db:seed
```

Copy the generated `BUSINESS_ID` from the seed output into your `.env` file under `DEFAULT_BUSINESS_ID`.

### 3. Running the Server

```bash
# Development mode with hot-reload
npm run dev

# Production build & start
npm run build
npm start

# Type check
npm run check
```

---

## 📡 Complete REST API Endpoints

### 🩺 Health & Diagnostics
- `GET /health` — Check server status & health.

### 🤖 AI Agent Chat Endpoint
- `POST /api/v1/ai/chat` — Send messages to the ReAct AI Agent.
  - **Headers**: `x-business-id: BUSINESS_ID`
  - **Body**: `{ "sessionId": "string", "message": "string" }`

---

### 📅 Booking & Availability API (`/api/v1/bookings`)
All endpoints accept header `x-business-id: BUSINESS_ID`.

| Method | Endpoint | Description | Query / Body Params |
|---|---|---|---|
| `GET` | `/api/v1/bookings/services` | Search active services | `?q=massage` |
| `GET` | `/api/v1/bookings/availability` | Calculate available time slots | `?serviceId=ID&date=YYYY-MM-DD&staffId=OPTIONAL` |
| `GET` | `/api/v1/bookings` | List bookings | `?date=YYYY-MM-DD&status=CONFIRMED` |
| `POST` | `/api/v1/bookings` | Create new booking | `{ "serviceId", "customerName", "customerPhone", "startAt", "staffId", "notes" }` |
| `GET` | `/api/v1/bookings/:bookingId` | Get single booking | — |
| `PATCH` | `/api/v1/bookings/:bookingId` | Update booking | `{ "startAt", "staffId", "notes" }` |
| `DELETE` | `/api/v1/bookings/:bookingId` | Cancel booking | — |

---

### 🏢 Business Management API (`/api/v1/businesses`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/businesses` | List all businesses |
| `POST` | `/api/v1/businesses` | Create a new business entity |
| `GET` | `/api/v1/businesses/:businessId` | Get business details |
| `PATCH` | `/api/v1/businesses/:businessId` | Update business metadata |
| `DELETE` | `/api/v1/businesses/:businessId` | Delete a business |

---

### 💇 Service Management API (`/api/v1/services`)
Header: `x-business-id: BUSINESS_ID`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/services` | List active business services |
| `POST` | `/api/v1/services` | Create new service (duration, price, name) |
| `GET` | `/api/v1/services/:serviceId` | Get service details |
| `PATCH` | `/api/v1/services/:serviceId` | Update service details |
| `DELETE` | `/api/v1/services/:serviceId` | Delete a service |

---

### 👨‍⚕️ Staff & Schedule Management API (`/api/v1/staffs`)
Header: `x-business-id: BUSINESS_ID`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/staffs` | List business staff members |
| `POST` | `/api/v1/staffs` | Add staff member & set weekly schedules |
| `GET` | `/api/v1/staffs/:staffId` | Get staff details & schedule |
| `PATCH` | `/api/v1/staffs/:staffId` | Update staff details & schedules |
| `DELETE` | `/api/v1/staffs/:staffId` | Remove staff member |

---

## 🧪 Testing the AI Agent

### Example Chat Request (PowerShell)

```powershell
$body = @{
  sessionId = "session-101"
  message   = "Hi, I need a consultation with Dr. Smith tomorrow afternoon."
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:4000/api/v1/ai/chat" `
  -Method POST `
  -Headers @{
    "Content-Type"  = "application/json"
    "x-business-id" = "YOUR_BUSINESS_ID"
  } `
  -Body $body
```

### Example Chat Request (cURL)

```bash
curl -X POST http://localhost:4000/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -H "x-business-id: YOUR_BUSINESS_ID" \
  -d '{"sessionId":"session-101","message":"Book me a haircut for tomorrow at 3 PM"}'
```

---

## 🗺️ Project Roadmap & Next Phases

- [x] **Phase 1 — Core Backend (Complete)**: LangChain ReAct Agent, 9 DB Tools, Express 5, Prisma ORM, PostgreSQL, Multi-LLM support, Full REST CRUD Suite.
- [ ] **Phase 2 — Frontend UI (Next.js)**: Customer chat widget, Business admin portal, Booking calendar view, Staff schedule manager.
- [ ] **Phase 3 — Voice Agent Integration**: WebRTC / Speech-to-Text (STT) and Text-to-Speech (TTS) integration for live browser voice interaction.
- [ ] **Phase 4 — Telephony & Phone Receptionist**: Twilio / Vonage SIP integration for automated phone booking calls.
- [ ] **Phase 5 — Enterprise Ready**: Auth (Clerk / NextAuth), Rate limiting, Redis caching, Email/SMS notifications (Twilio / Resend), Webhook integration.

---

## 📜 License

Distributed under the [MIT License](LICENSE).
