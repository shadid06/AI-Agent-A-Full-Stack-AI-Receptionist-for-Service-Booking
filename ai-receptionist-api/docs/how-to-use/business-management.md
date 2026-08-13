# Business Management

## Purpose

Business management lets an owner create and maintain the workspace that powers the receptionist.

## Main routes

- `GET /api/v1/businesses`
- `POST /api/v1/businesses`
- `GET /api/v1/businesses/:businessId`
- `PATCH /api/v1/businesses/:businessId`
- `DELETE /api/v1/businesses/:businessId`

## How to use

1. Sign in.
2. Create a business with name, industry, timezone, and optional contact details.
3. The backend creates the owner membership automatically.
4. Update business metadata as the company changes.

## Key fields

- `name`
- `slug`
- `industry`
- `timezone`
- `phone`
- `email`
- `address`
- `clerkOrganizationId`

## Notes

- Business records are tenant roots.
- Deleting a business is implemented as a soft deactivate.

