## Why

The platform currently offers a full ODS (Sustainable Development Goals) indicators view for every municipio, with list/dashboard modes, comparison, and filtering. A parallel "Agenda Urbana" (AU) taxonomy exists in the database (`DICCIONARIO` with `agenda = 'AUE'`) with 10 strategic objectives and ~30 specific objectives, but the AU Seguimiento tab is an empty stub. Municipios that have adopted the Agenda Urbana (`REGIONES.id_especial3 = 'aue'`) need the same indicator-tracking experience organized by the AU taxonomy instead of ODS goals.

## What Changes

- **New API endpoint** `GET /api/au/indicadores` that builds the same hierarchy response shape as the ODS endpoint but queries `DICCIONARIO` where `agenda = 'AUE'` and uses the `AUE-` id prefix. Validates the municipio participates in AU (`id_especial3 = 'aue'`).
- **Taxonomy-aware shared components**: `IndicadoresListView`, `IndicadoresDashboardView`, and `IndicadoresPanel` gain optional props to resolve icons, colors, and section labels from a taxonomy config instead of hardcoded ODS references.
- **New `AgendaNavStrip` component** displaying the 10 AU strategic objectives with their icons and colors (parallel to `OdsIndicadoresNavStrip`).
- **New AU-specific Pinia stores** for indicator picker state and municipio comparison, with comparison candidates filtered to AU-enabled municipios only.
- **`Seguimiento.vue` replaces the empty stub** with a full orchestrator wiring the AU API, AU stores, `AgendaNavStrip`, and the shared list/dashboard views.
- **Page update** for `pages/municipios/au/[ine].vue` to fetch AU hierarchy data and pass it to `Seguimiento`.
- Spider chart generalization and indicator picker modal are **out of scope** — deferred to follow-up changes.

## Capabilities

### New Capabilities
- `au-hierarchy-api`: Server API endpoint that returns AU indicator hierarchy for a municipio, mirroring the ODS hierarchy shape.
- `au-seguimiento-orchestrator`: The Seguimiento view that wires AU data, taxonomy config, navigation, comparison, and list/dashboard sub-views.
- `taxonomy-aware-indicator-views`: Parameterization of existing ODS indicator list/dashboard/panel components to accept a taxonomy config, enabling reuse across ODS and AU.
- `agenda-nav-strip`: Navigation strip for the 10 AU strategic objectives with icons and active-state highlighting.

### Modified Capabilities
- `municipio-au-page`: Page now fetches AU hierarchy data, renders header metadata, and passes data to Seguimiento view.

## Impact

- **Server**: New route at `server/api/au/indicadores.get.ts`. Reads from existing SQLite tables (`DICCIONARIO`, `ARQUITECTURA_L2`, `INDICADORES`, `METADATA`, `PROMEDIOS_ODS`, `REGIONES`) — no schema changes.
- **Components**: `IndicadoresListView.vue`, `IndicadoresDashboardView.vue`, `IndicadoresPanel.vue` gain backward-compatible optional props (ODS behavior unchanged when props are omitted).
- **Stores**: Two new Pinia stores (`municipioAuIndicadoresPicker`, `municipioAuComparison`). Existing ODS stores unchanged.
- **Types**: New `TaxonomyConfig` interface. Existing `OdsHierarchyResponse` type reused as-is (shape fits both taxonomies).
- **Assets**: Existing `public/svg_agenda/` icons and `objetivos_agenda` config already in place.
- **No breaking changes** to ODS functionality.
