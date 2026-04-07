## Why

The municipal ODS indicators view uses a free-text field that only filters after three characters, which is easy to miss and does not support an explicit “which indicators am I looking at?” workflow. A **command palette inside a modal** gives fuzzy search (via Nuxt UI’s [CommandPalette](https://ui.nuxt.com/docs/components/command-palette)) plus **multi-select** so users can narrow the list deliberately or reset to everything.

## What Changes

- **Remove** the sticky-bar `UInput` used as the indicator search box in `IndicadoresView.vue`.
- **Add** a control (e.g. button) that opens a **`UModal`** whose body contains **`UCommandPalette`** with:
  - Built-in **search** (palette input).
  - **One group** listing **all** indicators from the current municipio hierarchy (label + optional suffix for meta/ODS context).
  - **`multiple`** selection: each row can be toggled selected/unselected; **`v-model`** (or equivalent) tracks chosen indicator ids.
  - **Select all** and **Select none** actions (buttons), with **all indicators selected by default** when data loads or resets.
- **Replace** the current filter pipeline: instead of `searchQuery` + “≥3 characters” substring filter, the visible list / sections / series ids SHALL be derived from **selected indicator ids** ∩ available `flatItems` (default = full list).
- **Empty state**: when the user selects no indicators, the view SHALL show an appropriate empty message (distinct from “no data from API”).
- **i18n**: new strings for modal title, trigger label, placeholder, select all/none, and empty-selection copy in **Catalan and Spanish**.
- **Persist selection across municipios**: the chosen set of `id_indicador` values SHALL be held in a **Pinia** store so that navigating from one municipio ODS page to another **keeps the same selection** (intersected with indicators available in the new municipality). **First-time / cold behaviour** remains “all selected” when the store has not been written yet (see design for merge rules when ids do not overlap).

## Capabilities

### New Capabilities

- `municipio-indicadores-command-palette`: Modal command palette for searching and multi-selecting ODS indicators on the municipio indicators view; select-all/none; default all selected; drives which indicators appear in list and dashboard; **Pinia-persisted selection across municipio navigation**.

### Modified Capabilities

- _(none — existing `indicadores-evolution-chart` spec does not define text search behavior.)_

## Impact

- **Frontend** (`diputacion_tarragona`): new or extended **Pinia** store for ODS indicator picker selection; `IndicadoresView.vue` (read/write store, computed `filteredItems` / `indicatorIds`, modal + palette UI); possible small extract to a child component; `@nuxt/ui` `UModal`, `UCommandPalette`, `UButton`.
- **Backend / API**: none.
- **Data**: none.
