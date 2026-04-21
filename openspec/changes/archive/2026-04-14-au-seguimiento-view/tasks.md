## 1. API Foundation

- [x] 1.1 Create `server/api/au/indicadores.get.ts` — adapt from `server/api/ods/indicadores.get.ts` changing `agenda = '2030'` to `agenda = 'AUE'`, id prefix from `2030-` to `AUE-`, objetivo range from 1-17 to 1-10, and adding `id_especial3 = 'aue'` validation on the municipio
- [x] 1.2 Verify the AU API returns correct hierarchy by testing with a known AU municipio INE code (check REGIONES for one with `id_especial3 = 'aue'`)

## 2. TaxonomyConfig Type and Shared Component Props

- [x] 2.1 Create `app/types/taxonomy.ts` with the `TaxonomyConfig` interface (`key`, `objectiveCount`, `idPrefix`, `iconPath`, `colorByNum`, `sectionLabel`, `scrollAnchorPrefix`)
- [x] 2.2 Create ODS and AU taxonomy config factory functions (or constants) in `app/utils/taxonomyConfigs.ts` using `ods_list` and `objetivos_agenda` from config
- [x] 2.3 Add optional `taxonomyConfig` prop to `IndicadoresListView.vue` — replace hardcoded `odsLogo()`, section heading text, and section `id` attribute with taxonomy-aware resolution (defaulting to ODS behavior when prop is absent)
- [x] 2.4 Add optional `taxonomyConfig` prop to `IndicadoresDashboardView.vue` — same pattern for section headers, icons, and accent color resolution
- [x] 2.5 Add optional `taxonomyConfig` prop to `IndicadoresPanel.vue` — parameterize the objective icon in the detail slide-over
- [x] 2.6 Verify ODS views still render identically (no visual regression) after shared component changes

## 3. AgendaNavStrip Component

- [x] 3.1 Create `app/components/AgendaNavStrip.vue` — 10 AU objective buttons with icons from `/svg_agenda/agenda_N.svg`, colors from `objetivos_agenda`, active state highlighting, hover label, and keyboard navigation (modeled on `OdsIndicadoresNavStrip.vue`)

## 4. AU Pinia Stores

- [x] 4.1 Create `app/stores/municipioAuIndicadoresPicker.ts` — same pattern as `municipioOdsIndicadoresPicker.ts` for managing selected indicator IDs in the AU view
- [x] 4.2 Create `app/stores/municipioAuComparison.ts` — same pattern as `municipioOdsComparison.ts` for managing up to 2 comparison INEs, with the AU-specific constraint that candidates must have `id_especial3 = 'aue'`

## 5. Seguimiento Orchestrator

- [x] 5.1 Implement `app/components/municipio/au/Seguimiento.vue` — orchestrator that receives AU hierarchy data as props, flattens it into sections (same logic as IndicadoresView), manages view mode toggle (list/dashboard), wires scroll spy via `useIndicadoresOdsScrollSpy`, and delegates to shared ListView/DashboardView/Panel with AU `TaxonomyConfig`
- [x] 5.2 Wire comparison selector in Seguimiento — use `municipioAuComparison` store, fetch comparison hierarchies, build comparison columns, filter candidates to `id_especial3 = 'aue'`
- [x] 5.3 Wire `useIndicadorValoresSeries` for time series fetching in Seguimiento (same composable as ODS)
- [x] 5.4 Wire `IndicadoresPanel` for indicator detail slide-over with AU taxonomy config

## 6. Page Wiring

- [x] 6.1 Update `app/pages/municipios/au/[ine].vue` — add `useAsyncData` call to `/api/au/indicadores`, fetch header metadata, pass AU hierarchy data + status + error to `MunicipioAuSeguimiento`, and display population/comarca in the header (matching ODS page pattern)

## 7. i18n

- [x] 7.1 Add AU-specific i18n keys to `ca.json` and `es.json` for section labels, empty states, and comparison UI text (e.g. `municipio.au.seguimiento.*`, `auPage.kicker`)
