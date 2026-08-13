# Service Management

## Purpose

Services are what customers book, such as consultations, treatments, or appointments.

## Main routes

- `GET /api/v1/services`
- `POST /api/v1/services`
- `GET /api/v1/services/:serviceId`
- `PATCH /api/v1/services/:serviceId`
- `DELETE /api/v1/services/:serviceId`

## How to use

1. Resolve a business context.
2. Create a service with name, duration, and optional price.
3. Mark the service active or inactive as needed.
4. The AI agent uses active services when searching and booking.

## Important fields

- `name`
- `description`
- `durationMin`
- `price`
- `isActive`

## Notes

- Service names are unique per business.
- Inactive services should not appear in public booking suggestions.

