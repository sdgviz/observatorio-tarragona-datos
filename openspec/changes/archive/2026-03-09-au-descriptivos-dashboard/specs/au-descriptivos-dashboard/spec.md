# Spec: AU Descriptivos Dashboard

## ADDED Requirements

### Requirement: Load descriptivos for current municipality

The dashboard SHALL load indicator data for the current municipality by calling `GET /api/agenda/descriptivos?codigo_ine={codigo_ine}`. The component SHALL receive or resolve the current municipality's `codigo_ine` (e.g. from route params or parent) and SHALL use the response types `DescriptivosResponse` and `DescriptivoIndicador` from `app/types/agenda.ts`.

#### Scenario: Data loaded successfully

- **WHEN** the component is mounted or `codigo_ine` becomes available
- **THEN** the app SHALL request `/api/agenda/descriptivos?codigo_ine={codigo_ine}` and SHALL display the returned list of indicators (subject to filters and search)

#### Scenario: Loading and error states

- **WHEN** the request is in progress
- **THEN** the UI SHALL show a loading state (e.g. skeleton or spinner) and SHALL NOT show stale data as current
- **WHEN** the request fails (e.g. 404, 500)
- **THEN** the UI SHALL show an error state and SHALL NOT crash

---

### Requirement: Display indicator table with code, name, base year, updated year, and range

For each indicator returned by the API, the dashboard SHALL display: code (`id_indicador`), name (`nombre`), base-year value with year in a tooltip (`valor_referencia`, `periodo_referencia`), updated value with year in a tooltip (`valor_actual`, `periodo_actual`), and a visual range representation based on `thr` (1Q–4Q). Numeric values SHALL be formatted with the project's number formatter; null values SHALL be shown as a dash or equivalent. The unit (`unidad`) SHALL be shown when present (e.g. in parentheses next to the value).

#### Scenario: All columns visible per row

- **WHEN** descriptivos data is loaded and filters/search do not hide the row
- **THEN** each indicator row SHALL show code, name, base-year value (with tooltip showing the year), updated value (with tooltip showing the year), and a range visual

#### Scenario: Tooltips show correct year

- **WHEN** the user hovers over the base-year value cell
- **THEN** a tooltip SHALL display the year corresponding to `periodo_referencia`
- **WHEN** the user hovers over the updated value cell
- **THEN** a tooltip SHALL display the year corresponding to `periodo_actual`

---

### Requirement: Filter by strategic objectives (Agenda Urbana)

The dashboard SHALL include a filter by strategic objectives (1–10) with the same toggle behaviour as the reference `listaObjetivos.vue`: objectives can be turned on/off; when all are on and one is turned off, only that one is off; when only one is on and it is clicked again, all are turned on. The list of objectives SHALL be driven by `app/assets/config/objetivos_agenda.json`. Icons SHALL be loaded from `public/svg_agenda/` (e.g. `agenda_{id}.svg`, `agenda_off_{id}.svg`, and optionally `agenda_line_{id}.svg`). Only indicators whose `aue1` array intersects the set of active objective IDs SHALL be shown; if all objectives are active, no objective-based filtering SHALL be applied.

#### Scenario: Toggle filters indicators

- **WHEN** the user deactivates one or more objectives
- **THEN** only indicators that have at least one of the active objective IDs in `aue1` SHALL be shown
- **WHEN** the user reactivates objectives so that all are active
- **THEN** all indicators (from the API response) SHALL be shown, subject only to search

#### Scenario: Objective selector reflects config and assets

- **WHEN** the objective filter component is rendered
- **THEN** it SHALL display exactly the objectives defined in `objetivos_agenda.json` and SHALL use the corresponding SVGs from `public/svg_agenda/` for active/inactive (and optional line) states

---

### Requirement: Search indicators by name

The dashboard SHALL provide a search input that filters the visible indicators by name. Filtering SHALL be done in the client on the already loaded list (after objective filter). The comparison SHALL be case-insensitive and SHALL normalize diacritics (e.g. so that "sostenible" matches "Sostenible" and "sostenible" in the indicator name).

#### Scenario: Typing filters the table

- **WHEN** the user types in the search field
- **THEN** only indicator rows whose `nombre` matches the normalized search string (after a short debounce or on input) SHALL be shown
- **WHEN** the search field is cleared
- **THEN** all indicators (subject to objective filter) SHALL be shown again

---

### Requirement: Compare with another municipality

The dashboard SHALL provide a municipality selector whose options come from `GET /api/municipios/list`. When the user selects a municipality, the app SHALL request that municipality's descriptivos via `GET /api/agenda/descriptivos?codigo_ine={selected_codigo_ine}` and SHALL display a comparison row under each current-municipality indicator row with the same `id_indicador`, showing the comparison municipality's name and that indicator's base-year value, updated value (and optionally range). If the comparison municipality has no data for that indicator, the comparison row SHALL show a dash or empty for those cells. Only one comparison municipality SHALL be selectable at a time.

#### Scenario: Selecting a municipality loads comparison data

- **WHEN** the user selects a municipality from the dropdown
- **THEN** the app SHALL fetch `/api/agenda/descriptivos?codigo_ine={selected}` and SHALL show comparison rows below each current-municipality indicator row with the comparison municipality's values for the same indicator

#### Scenario: No comparison when none selected

- **WHEN** no municipality is selected (or selection is cleared)
- **THEN** comparison rows SHALL NOT be shown

---

### Requirement: Technology stack and code quality

The implementation SHALL use TypeScript, Vue 3 Composition API (`<script setup lang="ts">`), Tailwind CSS for layout and styling, and Nuxt UI components where applicable. Data fetching SHALL use Nuxt composables (`useFetch` / `useAsyncData` or `$fetch` for on-demand comparison fetch). The implementation SHALL NOT copy the reference components verbatim; it SHALL adapt behaviour and data structures to the existing API response types and project conventions.

#### Scenario: TypeScript and Composition API

- **WHEN** the code is built or type-checked
- **THEN** components and composables SHALL be written in TypeScript and SHALL use Composition API (no Options API for this feature)

#### Scenario: Styling and UI library

- **WHEN** implementing layout, forms, and tables
- **THEN** Tailwind utility classes and Nuxt UI components (e.g. UInput, USelect, UTable, UTooltip) SHALL be used instead of custom CSS or unrelated UI libraries
