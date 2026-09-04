# Notification Engineering Skill

## Purpose

Treat notifications as a core product system for important lifecycle events without creating duplicates, noise, or provider lock-in.

## Notification Pipeline

Use a conceptual pipeline:

```text
Domain event
→ notification record
→ delivery decision
→ channel delivery
→ read/unread state
→ retry/error handling
```

## Core Events

Tutor:

- profile submitted
- application rejected with reason
- profile approved
- one-time approval acknowledgment
- advanced profile change approved
- advanced profile change rejected
- new matching tuition opportunity
- application status changed
- tutor selected
- assigned tuition changed
- withdrawal decision
- tuition reopened
- account suspended
- account reactivated
- new admin message

Admin:

- new parent tuition request
- tutor application submitted
- tutor resubmission
- advanced profile edit request
- new tuition application
- tutor withdrawal request
- tutor message
- other critical operational events defined in the PRD

Exact event list must follow the approved product documents.

## Idempotency

A domain event should not create duplicate notifications because of retries or repeated processing.

Use a stable event identity or equivalent deduplication strategy.

## In-App Notifications

At minimum, maintain:

- notification ID
- recipient
- type
- title
- body
- created time
- read/unread state
- optional deep-link target
- optional metadata required by the UI

## External Channels

The product prefers low-cost/free services where practical.

Do not tightly couple business logic to one provider.

Use a provider abstraction so email/SMS/push services can be replaced.

## Delivery Failures

A notification failure should not corrupt the underlying business transaction unless the product explicitly says the notification is transaction-critical.

For example:

```text
Tutor approved
→ approval persists
→ notification delivery may retry separately
```

## User Experience

Notifications should lead users to the relevant screen.

Avoid vague notifications such as "Something changed."

Prefer actionable messages.

## Rate and Noise Control

Avoid sending repeated notifications for the same state.

Do not notify tutors for every irrelevant tuition outside the approved matching logic.

## Testing

Test:

- success
- retry
- duplicate event
- read/unread
- invalid recipient
- suspended user
- deleted/inactive notification target
- deep links
