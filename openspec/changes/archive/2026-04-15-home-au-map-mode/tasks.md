## 1. API and types

- [x] 1.1 Add `server/api/au/promedios.get.ts` querying `PROMEDIOS_AGENDAS` for `id_dict = 'AUE-' + objetivo` (objetivo 1–10), returning `codigo_ine`, `valor`, `n_indicadores`, `periodo` with latest-period semantics consistent with other AU routes.
- [x] 1.2 Add or reuse a TypeScript response type in `app/types/` mirroring the ODS promedios row shape for the client.

## 2. MapWrapper and MapTarragona

- [x] 2.1 Add optional prop for parent-supplied `zoomRegion` INE list; when set, pass it to `MapTarragona` and avoid overriding it with the internal Camp-only toggle (preserve defaults for other call sites).
- [x] 2.2 Confirm `emphasizedInes`, `fadeUnselected`, and existing home `region-click-action="emit"` still behave correctly when both zoom override and emphasis are set.
- [x] 2.3 In `MapTarragona`, add optional `interactionInes` (or equivalent): when set, only those INEs show tooltip, emit `update:highlightedIne` on hover, and use the pointer cursor; other paths skip tooltip/highlight and use default cursor; optionally ignore `clickRegion` for non-members. Plumb the prop through `MapWrapper` from `index.vue` in AU mode with the AUE INE list.

## 3. Homepage (`index.vue`)

- [x] 3.1 Derive `aueInes` (and an AUE `Set` for guards) from `municipiosList` where `id_especial3 === 'aue'`.
- [x] 3.2 Wire `useFetch` to `/api/au/promedios` when `visualizationStore.isAU`, with `watch` on selected objective; keep ODS fetch for ODS mode.
- [x] 3.3 Replace or parameterize the objective strip: show `OdsSelector` only in ODS mode; in AU mode show AU objectives (`objetivos_agenda`) with the same v-model pattern (clamp objective id when switching modes if needed).
- [x] 3.4 Compute `mapValues`, legend, homogeneous year, and `selected` color from AU data and `objetivos_agenda` when in AU mode.
- [x] 3.5 Build beeswarm datapoints in AU mode by filtering to AUE INEs only (still drop null `valor` like ODS).
- [x] 3.6 Use AUE-filtered items for `USelectMenu` in AU mode; when mode becomes AU, clear `selectedIneRaw` if it is not in `aueInes`.
- [x] 3.7 On map `@click-region` in AU mode, set `selectedIneRaw` only if the INE is in `aueInes`; ignore non-AUE clicks. Apply the same rule for beeswarm `@select-municipio` if it can fire for non-plotted INEs.
- [x] 3.8 Pass `zoomRegion` override (AUE INEs), `emphasizedInes` (same set), and `fadeUnselected` when in AU mode; restore current ODS home map props when in ODS mode.

## 4. i18n and UX polish

- [x] 4.1 Add any missing locale strings for the AU selector label group (if not fully reused from existing AU copy).
- [x] 4.2 Manually verify header toggle on `/`: map updates without navigation; explore button goes to `/municipios/au/{ine}` in AU mode.

## 5. Spec sync (after implementation)

- [x] 5.1 Copy delta specs from `openspec/changes/home-au-map-mode/specs/` into `openspec/specs/<capability>/spec.md` per project archive workflow when the change is completed.
