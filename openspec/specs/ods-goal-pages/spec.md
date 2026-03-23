# ODS goal pages

## ADDED Requirements

### Requirement: Dynamic routes for ODS goals 1–17
The system SHALL provide pages at `/ods/1` through `/ods/17` that render the ODS goal experience (map, layer selector, and indicator beeswarms section). The segment SHALL be a positive integer objective number; values outside 1–17 SHALL not render as a valid goal page.

#### Scenario: Valid objective renders
- **WHEN** a user requests `/ods/5`
- **THEN** the page SHALL render with content scoped to ODS objective 5
- **AND** page metadata (title/description) SHALL include objective 5 in the active locale

#### Scenario: Invalid objective is rejected
- **WHEN** a user requests `/ods/0`, `/ods/99`, or a non-numeric segment
- **THEN** the application SHALL respond with a 404 or redirect to a safe hub route per implementation choice
- **AND** no goal-scoped API calls SHALL be made with invalid objective numbers

### Requirement: ODS index hub behavior
The route `/ods` SHALL either present a hub that links to all 17 goals or redirect to a default objective; the chosen behavior SHALL be consistent with header navigation and SHALL not leave a placeholder stub page in production.

#### Scenario: User lands on /ods
- **WHEN** a user requests `/ods`
- **THEN** they SHALL see navigable content for ODS (list, cards, or redirect), not an empty placeholder

### Requirement: Static generation includes ODS goal routes
Static generation SHALL include prerendered output for `/ods/1` … `/ods/17` so deployed static hosting can serve these URLs without server-side rendering.

#### Scenario: Generate builds ODS pages
- **WHEN** the static build runs
- **THEN** generated artifacts SHALL exist for each `/ods/{n}` for n from 1 to 17
