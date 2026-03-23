# indicadores-dashboard-view (change delta)

## ADDED Requirements

### Requirement: Dashboard indicator cards use ODS meta (target) name in subtitle

For each indicator card in the dashboard grid (evolution chart card, BAN card, and empty-data placeholder card), the **context line** below or beside the indicator name that today ties the indicator to the hierarchy SHALL use the **meta (target, nivel 2) `nombre`** from the API hierarchy for that indicator, **not** the goal (objetivo) name alone. ODS **goal number** MAY remain for badge colour and orientation (e.g. `ODS {n} · {meta nombre}`).

#### Scenario: Evolution card subtitle

- **WHEN** an evolution chart card is shown for an indicator whose meta name differs from the section goal title
- **THEN** the card’s hierarchy context line SHALL show the **meta** name

#### Scenario: BAN card subtitle

- **WHEN** a BAN card is shown for an indicator whose meta name differs from the section goal title
- **THEN** the card’s hierarchy context line SHALL show the **meta** name

#### Scenario: Empty series placeholder card

- **WHEN** the placeholder card is shown for an indicator with no series data
- **THEN** the visible hierarchy context line SHALL show the **meta** name
