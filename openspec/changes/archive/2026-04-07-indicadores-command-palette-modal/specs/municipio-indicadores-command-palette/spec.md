## ADDED Requirements

### Requirement: Indicator picker opens from a modal command palette

The municipal ODS indicators view SHALL NOT use an inline free-text search input for filtering indicators. The view SHALL provide a control that opens a modal. Inside the modal, the system SHALL render a Nuxt UI `UCommandPalette` (or equivalent documented component) that includes a search field and a scrollable list of commands representing indicators.

#### Scenario: User opens the picker

- **WHEN** the user activates the indicator-picker control
- **THEN** a modal opens showing the command palette with search and a list of all indicators available for the current municipio hierarchy

#### Scenario: User closes the modal

- **WHEN** the user dismisses the modal
- **THEN** the main list and dashboard reflect the current selection state without requiring the modal to stay open

### Requirement: All indicators listed and searchable in the palette

The command palette SHALL list every indicator from the current municipio ODS hierarchy as selectable entries. The palette’s search SHALL filter or rank those entries (fuzzy search is acceptable) using user-visible fields such as indicator name and supporting text (e.g. meta code or meta name).

#### Scenario: Full list present

- **WHEN** the modal is open and the search term is empty (or matches all)
- **THEN** the user can see entries for all indicators that exist in `flatItems` (or equivalent aggregated list) for the loaded data

#### Scenario: Search narrows entries

- **WHEN** the user types a search term that matches some indicator names or supporting text
- **THEN** the palette shows a subset of entries consistent with the component’s search behavior

### Requirement: Multi-select with default all selected

The system SHALL support selecting and unselecting individual indicators inside the palette when `multiple` selection is enabled. The set of selected indicators SHALL determine which indicators appear in the main list and dashboard sections. When the user has **no prior persisted selection** for this feature (store uninitialized), **every** indicator in the current municipio hierarchy SHALL be selected by default.

#### Scenario: Default shows all indicators on the page

- **WHEN** hierarchy data loads and the user has not changed selection
- **THEN** the main view shows the same indicators as the full hierarchy (equivalent to the previous “no text filter” behavior)

#### Scenario: First visit initializes to all selected

- **WHEN** the Pinia selection store has never been set and hierarchy data becomes available for a municipio
- **THEN** all indicators in that hierarchy are selected and the main view shows the full set

#### Scenario: Deselecting hides an indicator

- **WHEN** the user unselects a specific indicator in the palette (selection is bound to view state)
- **THEN** that indicator no longer appears in the list or dashboard sections and series fetching uses only selected ids

### Requirement: Select all and select none actions

The modal SHALL expose two explicit actions: **Select all** and **Select none**. Select all SHALL select every indicator in the current hierarchy. Select none SHALL clear all selections.

#### Scenario: Select none shows empty state

- **WHEN** the user chooses select none and no indicators remain selected
- **THEN** the main view shows an empty-selection state that is distinct from “no data from the server”

#### Scenario: Select all restores full set

- **WHEN** the user chooses select all after a partial selection
- **THEN** every indicator is selected again and the main view shows the full set

### Requirement: Internationalization for new UI strings

All new user-visible strings for the picker (trigger, modal title or helper text, palette placeholder, select all, select none, empty selection message) SHALL be defined in both Catalan and Spanish locale files using the project’s i18n conventions.

#### Scenario: Locale strings exist

- **WHEN** the implementation adds a new user-visible label for this feature
- **THEN** corresponding keys exist in both `ca` and `es` locale files

### Requirement: Selection persisted in Pinia across municipio navigation

The selected indicator ids SHALL be stored in a **Pinia** store so that **client-side navigation** from one municipio ODS page to another preserves the user’s selection. The effective indicators shown for each municipio SHALL be those whose `id_indicador` is both **selected in the store** and **present in the current municipio’s hierarchy**. If the store holds an explicit empty selection (select none), the view SHALL remain empty for any municipio until the user selects indicators again. If the store holds ids that **do not intersect** the current municipio’s available ids but the municipio has at least one indicator, the system SHALL recover by selecting **all** indicators for that municipio and updating the store accordingly (stale-id case).

#### Scenario: Selection survives changing municipio

- **WHEN** the user has a non-empty selection and navigates to a different municipio ODS route without reloading the app
- **THEN** the store still holds the same chosen ids and the new page shows the intersection of that set with the new municipio’s indicators

#### Scenario: Select none survives navigation

- **WHEN** the user has chosen select none and navigates to another municipio
- **THEN** the main view shows the empty-selection state until the user selects at least one indicator

#### Scenario: Stale ids re-seed to all

- **WHEN** the store contains ids that none of the current municipio’s indicators match, and the hierarchy has at least one indicator
- **THEN** the system selects all indicators for that municipio and persists that set in the store
