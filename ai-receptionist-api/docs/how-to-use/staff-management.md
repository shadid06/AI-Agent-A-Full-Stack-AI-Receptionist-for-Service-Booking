# Staff Management

## Purpose

Staff management stores the people who can handle bookings and their recurring schedules.

## Main routes

- `GET /api/v1/staffs`
- `POST /api/v1/staffs`
- `GET /api/v1/staffs/:staffId`
- `PATCH /api/v1/staffs/:staffId`
- `DELETE /api/v1/staffs/:staffId`

## How to use

1. Create a staff member under a business.
2. Add their role, contact info, and availability windows.
3. Update availability when shifts change.
4. Deactivate staff instead of deleting records permanently.

## Important fields

- `name`
- `role`
- `email`
- `phone`
- `availability`
- `isActive`

## Notes

- Availability is recurring by day of week.
- Booking availability is validated against staff schedules.

