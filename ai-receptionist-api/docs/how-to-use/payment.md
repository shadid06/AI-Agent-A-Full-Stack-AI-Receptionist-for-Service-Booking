# Payment

## Status

Planned.

## Purpose

Payment will handle subscription checkout, invoice generation, and billing portal access.

## Planned flow

1. Select a subscription plan.
2. Create a checkout session.
3. Confirm payment.
4. Sync subscription state back to the tenant record.

## Notes

- Stripe is the recommended provider.
- Payment state should be mirrored into the local database using webhooks.

