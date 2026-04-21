## 1. State and catalog

- [x] 1.1 Add Pinia store `useMunicipioOdsComparisonStore` with `comparisonInes` (max 2), setters that dedupe and exclude the route primary INE
- [x] 1.2 Add i18n keys (ca/es) for comparison picker label, placeholder, empty state, and optional helper text

## 2. Comparison picker UI

- [x] 2.1 `useFetch` or `useAsyncData` for `GET /api/municipios/list` with a stable key; map rows to `USelectMenu` items (`value-key="codigo_ine"`, label from `nombre`)
- [x] 2.2 Render `USelectMenu` with `multiple`, search enabled, and enforce max two selections (disable third selection or UX per design)
- [x] 2.3 Mount the picker in `IndicadoresView.vue` (or shared municipio ODS header) so it is visible in both list and dashboard modes

## 3. Fetch compared municipio data

- [x] 3.1 In the parent that already loads primary `OdsHierarchyResponse` (`IndicadoresView.vue` or dedicated composable), watch comparison INEs and fetch the same indicator hierarchy for each INE via existing `GET /api/ods/indicadores` (or current equivalent)
- [x] 3.2 Extend series loading so `seriesCache` / `loadingIds` support keys scoped by municipio (e.g. `${ine}:${id_indicador}`) or parallel Maps per comparison INE; ensure primary behavior unchanged when comparison is empty
- [x] 3.3 Resolve display names for comparison INEs from the list response or header API for table/chart legends

## 4. List view (`IndicadoresListView.vue`)

- [x] 4.1 Add props for comparison column data (per-INE `OdsIndicador` lookup or equivalent) and wire from parent
- [x] 4.2 Extend `UTable` columns: for each metric group (valor, año, índice, tendencia), render sub-cells labeled with municipio name (primary + up to two comparisons)
- [x] 4.3 Use `indicadorTrendDirection` per municipio with the correct series cache key; show skeletons while that series loads

## 5. Dashboard and charts

- [x] 5.1 Update `IndicadoresDashboardView.vue` to pass comparison series into `MunicipioOdsIndicadorEvolutionCard` (or chart child) when visualization type is evolution
- [x] 5.2 Implement multi-line rendering: primary line unchanged; first comparison = thick dotted stroke + color A; second = thick dashed stroke + color B; legend entries with municipio names
- [x] 5.3 Preserve existing single-point / empty behaviors for primary and comparisons (no false multi-year lines)

## 6. Verification

- [x] 6.1 Manual check: 0, 1, and 2 comparison municipios; change primary municipio via route and confirm comparison INEs cannot include primary
- [x] 6.2 Quick pass on narrow viewport: table scroll or layout still usable with comparison columns
