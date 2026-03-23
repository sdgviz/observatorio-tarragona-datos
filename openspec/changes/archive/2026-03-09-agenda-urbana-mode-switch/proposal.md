## Why

The application currently only supports the ODS (Sustainable Development Goals) mode for visualizing municipal data. The toggle in the header (`AppHeader.vue`) switches between ODS and Agenda Urbana modes, but navigating to an Agenda Urbana view is not yet implemented — the toggle has no effect on page routing or content. This needs to be resolved to unlock the Agenda Urbana data visualization experience.

## What Changes

- Add a new page route `pages/municipios/au/[ine].vue` (Agenda Urbana version of the municipio detail page)
- Add two empty placeholder components: `MunicipioAuSeguimiento` and `MunicipioAuDescriptivo`
- The Agenda Urbana municipio page renders two tabs ("Seguimiento" and "Descriptivo") using the new components
- When the header toggle is changed, if the user is currently on a municipio ODS page, automatically navigate to the equivalent Agenda Urbana page (and vice versa), preserving the `ine` parameter
- The global `VisualizationMode` state (Pinia store) already exists and is wired to the toggle — no changes needed there

## Capabilities

### New Capabilities

- `municipio-au-page`: Agenda Urbana detail page for a municipio (`/municipios/au/[ine]`) with "Seguimiento" and "Descriptivo" tabs
- `mode-aware-navigation`: When the header toggle changes mode, if the user is on a municipio mode-specific page (`/municipios/ods/[ine]` or `/municipios/au/[ine]`), automatically navigate to the equivalent page in the other mode

### Modified Capabilities

<!-- No existing specs are changing at the requirements level -->

## Impact

- **New files**: `app/pages/municipios/au/[ine].vue`, `app/components/municipio/au/Seguimiento.vue`, `app/components/municipio/au/Descriptivo.vue`
- **Modified files**: `app/components/AppHeader.vue` — add mode-aware navigation logic when the toggle fires
- **No API changes**: No new data fetching; AU components are empty placeholders for now
- **No store changes**: `useVisualizationStore` already exposes `isODS`/`isAU` and `setMode`
