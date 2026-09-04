# Performance Engineering Skill

## Purpose

Keep Tuition Serve responsive as tutor, tuition, application, message, notification, and location datasets grow.

## Priority Areas

### Public Website

- Keep initial page load lightweight.
- Optimize images.
- Avoid unnecessary client-side JavaScript.
- Preserve responsive behavior.

### Tutor Opportunity Search

The tuition list may grow significantly.

Use:

- Server-side filtering for large datasets.
- Pagination or cursor pagination.
- Appropriate database indexes.
- Search fields that reflect real product use.
- Efficient location filtering.
- Stable sorting.

Do not load every tuition opportunity into the browser.

### Admin Applicant Review

Applicant lists must support practical filtering and pagination.

### Messaging

Load conversations incrementally.

Do not load an entire message history by default.

### Notifications

Paginate notification history and keep unread-count queries efficient.

## Location

Location search and filtering can become expensive.

Prefer normalized structured location data and indexed identifiers rather than arbitrary text matching for core geographic filters.

## Database

Index fields used frequently for:

- branch
- tutor status
- tuition status
- subject
- grade
- locality/municipality identifiers
- application tuition ID
- application tutor ID
- assignment status
- notification recipient
- notification read status
- message conversation ID

Do not add indexes blindly. Validate them against query patterns.

## UI Performance

Use loading skeletons, optimistic interaction only where safe, debouncing for search, and pagination where appropriate.

Do not sacrifice correctness for micro-optimizations.
