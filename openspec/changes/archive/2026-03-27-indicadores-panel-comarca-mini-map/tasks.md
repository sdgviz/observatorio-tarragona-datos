## 1. API — comarca values for one indicator

- [x] 1.1 Add `GET` handler under `server/api/indicadores/` (name TBD, e.g. `por-comarca.get.ts`) accepting `indicator_id` and `id_especial`, validating non-empty strings.
- [x] 1.2 Implement SQLite query joining indicator values with `REGIONES` on `codigo_ine`, filter `id_especial = ?`, return latest `valor` per municipio consistent with existing indicator APIs; use parameterized statements only.
- [x] 1.3 Add/extend TypeScript types for the response in `app/types/` if needed.

## 2. Colour scale helper (optional dedup)

- [x] 2.1 Extract or copy the ODS hue + `interpolateHsl` + five-stop `scaleLinear` logic from `app/pages/index.vue` (or shared composable) so the mini map uses the same algorithm; document the canonical source in a short comment if not extracted.

## 3. Mini map component

- [x] 3.1 Create `IndicadoresComarcaMiniMap.vue` (or agreed name) under `app/components/municipio/ods/`: `ClientOnly` + skeleton, `useFetch` GeoJSON (`/Municipios_Tarragona_small2.geojson`, `server: false`), fixed width/height suitable for slide-over.
- [x] 3.2 Build features with `geoMercator().fitSize` on full GeoJSON; render paths with neutral fill for OUT-of-comarca INEs, choropleth fill + `colorScale` for INEs in comarca set.
- [x] 3.3 Add hover tooltip (name + formatted value); no viewBox easing; optional `click` emit with `codigo_ine`.
- [x] 3.4 Highlight stroke for `selectedIne` (current municipio) if provided.

## 4. Panel and wiring

- [x] 4.1 Extend `IndicadoresPanel.vue` props with `idEspecial` (optional string | null); watch `item` + `idEspecial` to `$fetch` the new API; derive `Record<string, number>` and comarca INE set (from response + list or API-only).
- [x] 4.2 Compute `colorScale` from comarca values and `item.objetivoNum`; render mini map section below header or after evolution block per UX preference (keep within slide-over width).
- [x] 4.3 Pass `id_especial` from `app/pages/municipios/ods/[ine].vue` into `MunicipioOdsIndicadoresView` → `IndicadoresView` → `IndicadoresPanel`.
- [x] 4.4 Update `IndicadoresChart.vue` (and any other `IndicadoresPanel` host) to pass `idEspecial` when available.

## 5. Specs and verification

- [x] 5.1 Copy or merge `openspec/changes/.../specs/indicadores-panel-comarca-mini-map/spec.md` into `openspec/specs/indicadores-panel-comarca-mini-map/spec.md` during archive/apply per project workflow.
- [x] 5.2 Manually verify: open municipio ODS → Lista/Dashboard → panel shows map; only same-comarca polygons coloured; scale changes with indicator; no MapTarragona-style zoom animation.
