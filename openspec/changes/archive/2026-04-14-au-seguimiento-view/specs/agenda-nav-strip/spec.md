## ADDED Requirements

### Requirement: Agenda objectives navigation strip
The system SHALL provide an `AgendaNavStrip` component that displays the 10 AU strategic objectives as a horizontal toolbar of icon buttons, mirroring the structure of `OdsIndicadoresNavStrip`.

#### Scenario: Strip renders 10 objectives
- **WHEN** `AgendaNavStrip` is mounted
- **THEN** it SHALL display exactly 10 buttons, one per AU strategic objective
- **AND** each button SHALL show the objective icon from `/svg_agenda/agenda_N.svg`
- **AND** the active objective SHALL be visually highlighted with its color from `objetivos_agenda`

#### Scenario: User clicks an objective
- **WHEN** the user clicks objective button N
- **THEN** the component SHALL emit a `select` event with value N

#### Scenario: Keyboard navigation
- **WHEN** the user presses ArrowRight/ArrowLeft while a button is focused
- **THEN** focus SHALL move to the next/previous objective (wrapping at boundaries)

### Requirement: Active objective label
The strip SHALL display the name of the currently hovered or active objective below the buttons.

#### Scenario: Hover shows objective name
- **WHEN** the user hovers over objective 3
- **THEN** the label below SHALL show "OE 3: {objective name}"
