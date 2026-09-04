# UI/UX Product Fidelity Skill

## Purpose

Prevent the implementation from becoming a generic AI-generated dashboard and preserve the intended product character.

## Product Character

Tuition Serve should feel:

- clear
- professional
- trustworthy
- practical
- education-focused
- operationally simple

The interface should prioritize task completion over decoration.

## Public Website

The client's supplied HTML is the primary reference for:

- navigation
- branding
- typography
- color relationships
- button treatment
- card patterns
- public content hierarchy
- request-a-tutor experience
- Become a Tutor entry point

Do not redesign the public site without an explicit requirement.

## Tutor Dashboard

Keep it minimal.

The dashboard is not the place for every tutor feature.

Profile tasks remain in Profile:

- experience editing
- profile photo editing
- advanced profile change request

The dashboard may surface summarized status and entry points, but should not become a feature wall.

## Status Design

Make status visible and understandable.

Important statuses include:

- pending
- under review
- approved/verified
- rejected
- suspended
- assigned
- open
- closed

Do not rely on color alone.

Use labels and appropriate icons.

## Forms

Forms should:

- group logically related fields
- show required fields clearly
- validate inline
- preserve entered information when possible
- explain why a field cannot be changed
- distinguish locked verified fields from editable fields

## Advanced Edit UX

The UX should communicate:

```text
These fields are verified.
Changing them requires admin approval.
```

Do not make the user believe the change is immediate.

## Admin UX

Admin workflows should optimize for rapid operational work.

For tutor selection, the preferred flow is simple:

```text
View applicants
→ inspect
→ message if necessary
→ assign
```

Do not create unnecessary wizard steps.

## Location UX

Location selection should be structured and searchable.

Avoid huge raw dropdowns with thousands of items when a hierarchical search/combobox can make selection clearer.

The parent should be able to identify the exact address privately while tutors see only the allowed area representation.

## Responsive Design

The product must remain usable across desktop and mobile widths.

Responsive behavior should simplify layouts rather than merely shrinking desktop screens.

## Quality Bar

Before considering a UI complete, verify:

- visual hierarchy
- spacing
- typography
- content density
- responsive behavior
- loading states
- empty states
- errors
- destructive confirmations
- accessibility
- consistency with the supplied visual system
