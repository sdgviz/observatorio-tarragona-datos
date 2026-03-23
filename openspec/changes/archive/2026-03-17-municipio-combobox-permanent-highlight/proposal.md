# Municipio combobox and permanent highlight on home

## Why

Users need a quick way to focus on a specific municipality on the home page: pick it from a searchable list and see it highlighted on both the map and the beeswarm chart. Today, highlight is only driven by hover, so the selection is lost when the pointer leaves. A single-select combobox above the beeswarm provides a persistent “pinned” municipality that stays highlighted regardless of hover, improving comparison and navigation.

## What Changes

- Add a **single-select combobox** above the beeswarm on `app/pages/index.vue`. The list is the same municipalities as the map/beeswarm (from `/api/municipios/list`), with **search/filter** by name.
- On selection: the chosen municipality gets a **permanent highlight** on the map and on the beeswarm, **independent** of the existing hover highlight. Both can be visible at once (selected = one style, hover = another).
- User can clear the selection (e.g. clear button or empty option) to remove the permanent highlight.
- No change to existing hover behavior: hover still updates transient highlight on map and beeswarm.

## Capabilities

### New Capabilities

- `municipio-combobox-permanent-highlight`: Searchable single-select combobox for municipality on the home page; permanent highlight (by INE) applied to map and beeswarm; visual distinction between “selected” and “hover” highlight; clear selection supported.

### Modified Capabilities

- None. Map and beeswarm components are extended via new props/state only; no change to existing spec requirements.

## Impact

- **Frontend**: `app/pages/index.vue` (new combobox, new state `selectedIne`), `MapWrapper`/`MapTarragona` (optional prop for selected INE to show permanent highlight), `BeeswarmChart` (use selected INE in highlights or equivalent).
- **API**: No new endpoints; reuses `/api/municipios/list`.
- **i18n**: New labels for combobox placeholder and clear action if needed.
