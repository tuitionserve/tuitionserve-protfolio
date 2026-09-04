# Messaging Engineering Skill

## Purpose

Implement simple reliable web messaging between authorized Admin users and Tutors without overbuilding a social/chat platform.

## Scope

Primary conversation type:

```text
Admin ↔ Tutor
```

Parent ↔ Tutor web messaging is not part of the current requirement.

## Conversation Model

A conversation should identify:

- participants
- branch context when relevant
- created time
- last activity
- unread state
- active/archive state if specified

## Message Model

A message should contain at least:

- sender
- conversation
- text/content
- timestamp
- read state as appropriate
- delivery/error metadata where useful

## Authorization

A tutor can access only conversations in which they are a permitted participant.

An admin can access only conversations within their permitted role/branch scope, except Super Admin platform-wide access.

Never rely on conversation IDs alone.

## Ordering

Messages must display in stable chronological order.

Pagination is required for long histories.

## Duplicate Submission

Prevent duplicate sends from:

- double click
- network retry
- client re-submission

Use idempotency where appropriate.

## Notifications

New messages should generate notification events according to the notification design.

Do not create duplicate notifications when message delivery is retried.

## Realtime

Use realtime transport only if justified by the approved TRD.

A simpler polling or refresh strategy is acceptable if it satisfies the product requirements and expected usage.

Do not introduce a complicated realtime architecture just because chat interfaces often use websockets.

## Attachments

No attachment feature should be invented unless the approved product documents require it.

The tutor CV is a profile/document concept, not automatically a chat attachment.

## Moderation

Admins control the business relationship.

Messaging does not itself assign a tuition, approve a tutor, or modify profile status.

Those actions remain structured domain operations.
