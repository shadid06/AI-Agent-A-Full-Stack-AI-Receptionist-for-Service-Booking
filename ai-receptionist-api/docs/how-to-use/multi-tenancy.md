# Multi-Tenancy

## Purpose

Multi-tenancy keeps each business isolated from every other business.

## Tenant model

- `Business` is the workspace boundary.
- `User` is the identity.
- `Membership` links a user to a business.
- `Business.clerkOrganizationId` links a Clerk organization to a workspace.

## How access is resolved

- If a request has an active Clerk organization, the backend resolves the matching business by `clerkOrganizationId`.
- If there is no active organization, the backend falls back to `x-business-id`, query `businessId`, body `businessId`, or `DEFAULT_BUSINESS_ID`.
- Authenticated users must still have membership or ownership access.

## How to use

1. Create or sync a business workspace.
2. Link the business to a Clerk organization.
3. Add users through membership records.
4. Use `resolveBusinessContext()` inside business-aware routes.

## Safety rules

- Never query tenant data without a business filter.
- Never allow one business to read another business’s bookings, services, or staff.
- Never expose inactive workspaces.

