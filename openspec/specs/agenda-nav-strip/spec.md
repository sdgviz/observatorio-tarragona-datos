# agenda-nav-strip

## Purpose

Horizontal toolbar of icon buttons for navigating between Agenda Urbana / Agenda Metropolitana de Tarragona strategic objectives (líneas estratégicas), mirroring the structure of `OdsIndicadoresNavStrip` for the ODS experience.
## Requirements
### Requirement: Agenda objectives navigation strip
The system SHALL provide an `AgendaNavStrip` component that displays the 6 Tarragona líneas estratégicas as a horizontal toolbar of icon buttons, mirroring the structure of `OdsIndicadoresNavStrip`.

#### Scenario: Strip renders 6 objectives
- **WHEN** `AgendaNavStrip` is mounted
- **THEN** it SHALL display exactly 6 buttons, one per Tarragona línea estratégica
- **AND** each button SHALL show the línea icon from the configured asset path (e.g. `/svg_agenda/agenda_N.svg` for `N` in `1..6`)
- **AND** the active línea SHALL be visually highlighted with its color from the Tarragona taxonomy (`objetivos_agenda`)

#### Scenario: User clicks an objective
- **WHEN** the user clicks objective button N (`1..6`)
- **THEN** the component SHALL emit a `select` event with value N

#### Scenario: Keyboard navigation
- **WHEN** the user presses ArrowRight/ArrowLeft while a button is focused
- **THEN** focus SHALL move to the next/previous línea (wrapping at boundaries — 6 wraps to 1, 1 wraps to 6)

### Requirement: Active objective label
The strip SHALL display the name of the currently hovered or active línea below the buttons.

#### Scenario: Hover shows objective name
- **WHEN** the user hovers over línea 3
- **THEN** the label below SHALL show "LE 3: {línea name}" (using the short label "LE" for Línea Estratégica)

