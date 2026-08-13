# Booking Engine

## Purpose

The booking engine searches availability and creates real bookings from validated business data.

## Main routes

- `GET /api/v1/bookings/services`
- `GET /api/v1/bookings/availability`
- `GET /api/v1/bookings`
- `POST /api/v1/bookings`
- `GET /api/v1/bookings/:bookingId`
- `PATCH /api/v1/bookings/:bookingId`
- `DELETE /api/v1/bookings/:bookingId`

## How to use

1. Search active services.
2. Check availability for a service on a given date.
3. Create a booking only after a valid slot is found.
4. Update or cancel bookings using the booking ID.

## Booking rules

- Booking times must be in the future.
- The backend checks staff schedules and conflicting bookings.
- Cancelled bookings are not updated.

## Required headers

- `x-business-id`

## Notes

- This is the source of truth for reservation data.
- The AI agent must call these validations instead of inventing availability.

