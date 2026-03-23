## Why

The current ODS **multi-select** (`OdsMultiSelect`) hides non-selected goals and uses toggle rules (e.g. “all selected → first click isolates one”) that users find **counterintuitive** for exploration. Long lists in Lista and Dashboard lack **spatial anchors** per ODS, so jumping to “where ODS 7 starts” is tedious. The **sort** dropdown adds little value compared to a **search** when the user knows part of an indicator name.

## What Changes

- **ODS navigation UX**: Replace or redesign the control so the **primary action** is **scroll to the in-page section** for that ODS (anchors in Lista and Dashboard). The toolbar row that contains this control (around current `OdsMultiSelect` in `IndicadoresView.vue`) SHALL be **sticky** at the top while scrolling the indicadores content.
- **Anchors / sections**: `IndicadoresListView` and `IndicadoresDashboardView` SHALL expose stable **`id` anchors** (or equivalent) marking where each ODS block begins so `scrollIntoView` / hash navigation works.
- **Remove sort**: Drop the sort `USelect` and related ordering logic from `IndicadoresView.vue`; default ordering SHALL follow **ODS number then stable hierarchy order** (or document in design).
- **Text filter**: Add a **free-text** field; filtering applies **only when the query length is at least 3** characters; below that threshold, no text filter (show all sections / rows per current ODS visibility rules). Matching SHOULD consider indicator name (and optionally description) case-insensitively.
- **Interaction detail**: Clicking an ODS in the sticky strip SHALL **scroll** to that ODS section; spec SHALL clarify whether multi-selection / hiding other ODS is retained, simplified, or removed (see design).

## Capabilities

### New Capabilities

- `municipio-indicadores-sticky-toolbar`: Sticky toolbar on the municipio Indicadores tab containing ODS navigation + filter + view-mode tabs; scroll offset / z-index so it does not obscure page chrome.

### Modified Capabilities

- `indicadores-view-filter`: Update ODS filter requirements to align with scroll-to-section navigation and optional simplified selection semantics; add text-filter requirement (≥3 characters); remove or supersede sort-related UI if referenced.
- `municipio-indicadores-table`: Lista table grouped or preceded by per-ODS anchors; integrate text filter and sticky toolbar context; remove reliance on external sort control.
- `indicadores-dashboard-view`: Dashboard grid (or wrapper) structured with per-ODS anchors compatible with the same scroll targets as Lista.

## Impact

- **Frontend** (`diputacion_tarragona`): `IndicadoresView.vue`, `OdsMultiSelect.vue` (or successor), `IndicadoresListView.vue`, `IndicadoresDashboardView.vue`; possible small changes to spider `selected-ods` if selection model changes.
- **API**: None.
- **Specs** (`diputacion_tarragona_data/openspec`): new `municipio-indicadores-sticky-toolbar` + deltas for the three modified capabilities above.
