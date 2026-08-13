# AI Receptionist SaaS Architecture

This document describes how to evolve the current AI receptionist backend into a multi-tenant SaaS platform.

## Product Goal

Build a multi-tenant AI receptionist SaaS platform where autonomous AI agents use validated business tools to search availability, create, update, and cancel real bookings.

## Strategic Direction

The current backend is already a strong booking engine. The SaaS product should add:

- identity and workspace access
- tenant isolation and role-based authorization
- subscriptions and usage metering
- dashboard and onboarding experience
- notification orchestration
- voice and phone channels
- observability and auditability

## Recommended System Layout

```text
Public web / dashboard / voice / messaging channels
                     |
                     v
              Next.js SaaS App
                     |
        +------------+-------------+
        |                          |
        v                          v
   Auth / RBAC layer         Public APIs / webhooks
        |                          |
        +------------+-------------+
                     v
            SaaS core application API
                     |
    +----------------+-------------------+
    |                |                   |
    v                v                   v
 PostgreSQL      Stripe billing      AI agent runtime
 tenant data     usage and plans     with validated tools
    |
    v
 Notifications, analytics, audit logs, voice/phone adapters
```

## Tenant and Identity Model

The safest SaaS shape is workspace-first:

- `Business` or `Organization` is the tenant boundary
- `User` is the global identity
- `Membership` links users to businesses and stores roles
- `Invitation` handles onboarding new team members
- every operational row must include `businessId`
- every service layer query must resolve against the active tenant

Recommended roles:

- owner
- admin
- manager
- receptionist
- staff
- viewer

## Data Model Expansion

The existing schema already contains the booking domain. For SaaS, add:

- `User`
- `Membership`
- `Invitation`
- `Plan`
- `Subscription`
- `UsageEvent`
- `Invoice`
- `ApiKey`
- `Notification`
- `AuditLog`
- `ChannelConfig`
- `WebhookEndpoint`

## Feature Map

### Authentication

- sign up
- sign in
- sign out
- password reset
- invitation acceptance
- optional SSO later

### Multi-tenancy

- business onboarding flow
- tenant-scoped APIs
- row-level authorization checks
- switchable workspaces for a single user

### Booking Engine

- search services
- calculate availability
- create booking
- update booking
- cancel booking
- list bookings

### AI Agent

- Gemini-first or provider-agnostic model abstraction
- tool calling only
- memory backed by PostgreSQL
- guardrails against hallucinated slots, prices, or staff
- structured escalation when human confirmation is needed

### Conversation

- store message history
- track conversation state
- retain tool calls and outcomes
- attach transcript to booking and customer records

### Notifications

- email confirmations
- SMS reminders
- WhatsApp reminders and updates
- booking cancellation notices
- admin alerts

### Voice

- browser voice receptionist
- STT and TTS pipeline
- optional telephony gateway
- human handoff when needed

### Subscription and Usage

- free trial
- monthly and yearly plans
- usage-based overages
- metering by AI turns, voice minutes, and message volume
- plan limits on businesses, users, services, bookings, and channels

### Admin Dashboard

- tenant onboarding
- service and staff management
- booking calendar
- conversation history
- usage and billing views
- notification settings
- agent configuration

## Implementation Order

### Step 1 - AI Agent

Keep the current validated ReAct agent as the core booking brain.

### Step 2 - Real Booking Tools

Harden tool contracts, add idempotency, and log every tool call.

### Step 3 - Authentication

Add user auth, sessions, invites, and route protection.

### Step 4 - Multi-tenancy

Move from header-only tenant scoping to authenticated workspace scoping.

### Step 5 - Next.js Dashboard

Ship the operator portal for onboarding and day-to-day business management.

### Step 6 - Subscription + Usage

Connect Stripe and start metering tenant usage.

### Step 7 - Voice Receptionist

Add browser voice and conversational handoff flows.

### Step 8 - WhatsApp / Phone

Expose the receptionist through phone and messaging channels.

## Guardrails

- never let the model invent availability
- never let the model bypass billing or tenant checks
- never let one tenant access another tenant's records
- never create bookings without validating service, staff, and timeslot
- never expose internal tool errors directly to end users

## Success Criteria

- a new business can self-serve onboard in minutes
- each business sees only its own data
- subscriptions gate access cleanly
- bookings are created from validated source-of-truth data
- the AI agent can operate through chat, voice, and messaging
- administrators can monitor usage and revenue

