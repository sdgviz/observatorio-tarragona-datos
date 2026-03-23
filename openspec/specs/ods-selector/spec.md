# ODS selector

## ADDED Requirements

### Requirement: ODS objective selector displays all 17 objectives
The system SHALL render a horizontal row of 17 selectable items, one per ODS objective. Each item SHALL display the objective number and use the official ODS color as its background when selected or on hover. The selector SHALL use the `ods_list` configuration from `app/assets/config/config.js` as the data source for names, colors, and icon references.

#### Scenario: Initial render with default selection
- **WHEN** the ODS selector component mounts without an initial value
- **THEN** the first objective (ODS 1) SHALL be selected by default
- **AND** all 17 objectives SHALL be visible as a horizontal row of squares

#### Scenario: Objective item displays its number and color
- **WHEN** the selector renders
- **THEN** each item SHALL show the objective number (1–17)
- **AND** the selected item SHALL have its official ODS color as background
- **AND** unselected items SHALL have a neutral/muted appearance

### Requirement: ODS selector emits selection changes
The component SHALL support `v-model` binding for the selected objective number. When the user clicks a different objective, the component SHALL emit the new value.

#### Scenario: User clicks a different objective
- **WHEN** the user clicks on objective number 5
- **THEN** the component SHALL emit the value `5` via the model update
- **AND** the visual selection SHALL move to objective 5

#### Scenario: External model change updates visual state
- **WHEN** the parent component programmatically changes the model value to `10`
- **THEN** the selector SHALL visually highlight objective 10 as the active selection

### Requirement: ODS selector shows objective name on interaction
The component SHALL display the name of the currently selected (or hovered) ODS objective as a label below or beside the selector row.

#### Scenario: Hovering over an objective shows its name
- **WHEN** the user hovers over objective 6
- **THEN** a label SHALL display "agua limpia y saneamiento" (or the corresponding localized name)

#### Scenario: Selected objective name persists
- **WHEN** objective 3 is selected and the user is not hovering any item
- **THEN** the label SHALL show the name of objective 3 ("salud y bienestar")

### Requirement: ODS selector is accessible
The component SHALL be keyboard-navigable. Arrow keys SHALL move focus between items, and Enter/Space SHALL select the focused item.

#### Scenario: Keyboard navigation through objectives
- **WHEN** the selector has focus and the user presses the right arrow key
- **THEN** focus SHALL move to the next objective
- **AND** pressing Enter SHALL select that objective
