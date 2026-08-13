# Authentication

## Purpose

Authentication identifies the user who is calling the backend and ties that user to business workspaces.

## Current flow

- Clerk middleware runs on every request.
- Signed-in users can call `GET /api/v1/auth/me`.
- The backend syncs the Clerk user into the local `User` table.
- User access is resolved against business ownership or membership.

## Environment variables

- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## How to use

1. Sign in through Clerk on the client side.
2. Call `GET /api/v1/auth/me`.
3. Read the `user` and `businesses` payload.
4. Use the returned business context for protected API calls.

## Protected routes

The following routes require authentication:

- `/api/v1/auth/me`
- `/api/v1/businesses`

Other routes can still support guest-style business scoping by passing `x-business-id`, but authenticated access is recommended for production.

## Notes

- Authentication is the foundation for multi-tenancy.
- Do not trust client-provided business IDs without authorization checks.

