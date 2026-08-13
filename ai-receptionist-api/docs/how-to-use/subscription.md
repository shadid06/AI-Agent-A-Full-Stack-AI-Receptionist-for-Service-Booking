# Subscription

## Status

Planned.

## Purpose

Subscription management will control which businesses can use the platform and which features they can access.

## Planned capabilities

- plans
- trials
- monthly or yearly billing
- feature gates
- seat limits

## Planned use

1. Create a plan for a business.
2. Attach plan features.
3. Track active subscription state.
4. Block premium features when the subscription is inactive.

## Notes

- Stripe is the recommended billing provider.
- Subscription logic should be workspace-aware, not user-only.

