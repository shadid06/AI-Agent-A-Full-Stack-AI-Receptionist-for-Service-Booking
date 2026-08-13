# Usage Metering

## Status

Planned.

## Purpose

Usage metering will measure AI, voice, and messaging consumption per business.

## Planned metrics

- AI turns
- voice minutes
- SMS messages
- WhatsApp messages
- booking volume
- active staff count

## Planned use

1. Record usage events whenever the agent or channel is used.
2. Aggregate usage by tenant and billing period.
3. Compare usage against plan limits.
4. Trigger overage billing or quota enforcement.

## Notes

- This should be stored as append-only usage events.

