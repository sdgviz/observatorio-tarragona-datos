## 1. Data and types

- [x] 1.1 Ensure `Descriptivo.vue` receives or resolves `codigo_ine` (prop or from route/context) for the current municipality
- [x] 1.2 In `Descriptivo.vue`, call `GET /api/agenda/descriptivos?codigo_ine={codigo_ine}` with `useFetch` or `useAsyncData`, using types from `app/types/agenda.ts`
- [x] 1.3 Add loading and error handling (skeleton/spinner and error message) for the descriptivos request

## 2. Objective filter component

- [x] 2.1 Create a new component (e.g. `AgendaObjetivosFilter.vue`) that loads `app/assets/config/objetivos_agenda.json` and displays the 10 objectives with toggle state
- [x] 2.2 Use SVGs from `public/svg_agenda/` for each objective (e.g. `agenda_{id}.svg` when active, `agenda_off_{id}.svg` when inactive)
- [x] 2.3 Implement toggle logic matching the reference: when all are on and one is clicked off, only that one turns off; when only one is on and it is clicked again, turn all on; otherwise toggle the clicked one
- [x] 2.4 Emit the list of objectives with active state (e.g. `defineEmits<{ objetivos: [ObjetivoAgenda[]] }>()`) so the parent can filter indicators by `aue1`

## 3. Range visual component

- [x] 3.1 Create a component (e.g. `DescriptivoRango.vue`) that accepts `thr: '1Q' | '2Q' | '3Q' | '4Q'` and optionally a range `[min, max]` if needed later
- [x] 3.2 Render a horizontal bar with a marker (e.g. circle) at the position corresponding to the quartile (e.g. 1Q ~25%, 2Q ~50%, 3Q ~75%, 4Q ~100%) using Tailwind/SVG
- [x] 3.3 Ensure the component is responsive and fits within the table cell

## 4. Descriptivo.vue layout and filters

- [x] 4.1 Add the "Filtrar" section with subtitle "Por objetivos estratégicos" and embed the new objective filter component; below it show the count of selected indicators (e.g. "X indicadores seleccionados")
- [x] 4.2 Add the "Visualizar" section with subtitle "Selecciona otros municipios de referencia" and a municipality selector (e.g. `USelect`) that loads options from `GET /api/municipios/list`
- [x] 4.3 Implement client-side filtering: combine objective filter (show indicator if `aue1` intersects active objective IDs) and search (filter by normalized `nombre`); when all objectives are active, do not filter by objective
- [x] 4.4 Add a search input (e.g. `UInput`) with placeholder "filtra por nombre del indicador" that filters the visible indicators by name (case-insensitive, diacritic-normalized)

## 5. Indicator table

- [x] 5.1 Build the table (e.g. `UTable` or semantic table) with columns: Código, Nombre (with search input in header or above), Año base, Actualizado, Rango (último dato)
- [x] 5.2 For each filtered indicator, render a row with: `id_indicador`, `nombre`, base value with `UTooltip` showing `periodo_referencia`, updated value with `UTooltip` showing `periodo_actual`, and the range component with `thr`; format numbers and show "-" for null
- [x] 5.3 Show unit (`unidad`) when present (e.g. in parentheses next to the value)

## 6. Municipality comparison

- [x] 6.1 When a municipality is selected in the selector, fetch its descriptivos via `GET /api/agenda/descriptivos?codigo_ine={selected_codigo_ine}` (e.g. with `$fetch` in a watch or handler, storing result in a ref)
- [x] 6.2 For each indicator row of the current municipality, add a comparison row below it (visually distinct, e.g. background and italic) showing the comparison municipality name and that indicator's values (same columns) by matching `id_indicador`; show "-" if the comparison municipality has no data for that indicator
- [x] 6.3 When no municipality is selected or selection is cleared, hide all comparison rows

## 7. i18n

- [x] 7.1 Add or reuse i18n keys for: "Filtrar", "Por objetivos estratégicos", "Visualizar", "Selecciona otros municipios de referencia", "Elige municipio", "filtra por nombre del indicador", "Código", "Año base", "Actualizado", "Rango (último dato)", "X indicadores seleccionados", and tooltip year label in both locale files (e.g. `ca.json`, `es.json`)
