# UI/UX Visual QA Skill

## Purpose

Validate that the implemented Tuition Serve interface faithfully follows the client's supplied UI reference and the approved wireframe specification.

## Primary Reference

The supplied Tuition Serve HTML is the visual baseline for the public-facing website. Preserve its visual language unless the approved wireframe specification intentionally changes it.

The reference establishes:

- Tuition Serve branding
- Light visual system
- Inter typography
- Emerald/green primary treatment
- Structured cards
- Rounded controls
- Desktop-first responsive composition
- Hero section
- Tutor request form
- Process section
- Testimonials
- FAQ
- Footer
- Navigation entry points for Home, Find a Tutor, Become a Tutor, For Schools, Courses, About Us
- Login and Signup affordances

## Validation Method

For each implemented screen:

1. Render at desktop width.
2. Render at tablet width.
3. Render at mobile width.
4. Compare against reference assets/specification.
5. Check hierarchy before decoration.
6. Check spacing, alignment, sizing, typography, borders, shadows, icon placement, and responsive behavior.
7. Correct visual discrepancies before considering the screen complete.

## Avoid Visual Drift

Do not introduce design trends merely for appearance.

Avoid unsolicited:

- Glassmorphism
- Excessive gradients
- Excessive animation
- Giant corner radii
- Decorative blobs everywhere
- Unnecessary dashboards
- Excessive empty space
- Dense enterprise tables where a simpler layout is specified
- Generic AI-generated SaaS visual patterns

## Functional Visual States

Visual QA must include:

- Loading
- Empty
- Error
- Disabled
- Pending
- Approved
- Rejected
- Suspended
- Selected
- Unread
- Notification states
- Confirmation states
- Form validation

## Tutor Dashboard

The tutor dashboard must remain minimal.

Do not move profile editing, experience editing, or advanced edit functionality into the dashboard when the approved flow places them under Profile.

The dashboard should clearly expose:

- Tutor identity
- Tutor UID
- Verification/status indicator
- Relevant tuition/application summaries
- Notifications
- Assigned tuition information as specified

## One-Time Approval Banner

The profile approval banner is an ephemeral onboarding event.

After it has been acknowledged/recorded as seen, it must not reappear.

Visual QA must test both:

- Newly approved tutor
- Previously acknowledged approved tutor

## Quality Bar

A screen is visually complete only when:

- It looks intentional.
- Primary action is visually obvious.
- Status is understandable without relying on color alone.
- Content density is appropriate.
- Mobile layout remains usable.
- It looks like the same product as the client's reference.
