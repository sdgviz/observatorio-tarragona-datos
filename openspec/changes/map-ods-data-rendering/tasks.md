## 1. Database utility and API layer

- [x] 1.1 Create `server/utils/db.ts` that opens a read-only `better-sqlite3` connection, configured via `DATABASE_PATH` env var with a default relative path to `../diputacion_tarragona_data/output/diputacion_tarragona.db`. Include a clear error message if the file is missing.
- [x] 1.2 Create `server/api/ods/promedios.get.ts` endpoint that accepts `objetivo` query param (1–17), converts it to `2030-{N}`, queries `PROMEDIOS_ODS`, and returns `[{ codigo_ine, valor, n_indicadores }]`. Return 400 for missing or invalid params.
- [x] 1.3 Verify the API works by running the dev server and checking `/api/ods/promedios?objetivo=1` returns real data from the database.

## 2. ODS selector component

- [x] 2.1 Create `app/components/OdsSelector.vue` with `v-model` for the selected objective number (1–17). Render a horizontal row of 17 items using `ods_list` from `config.js`, showing the number in each square with the ODS color on the selected item and a muted style for unselected items.
- [x] 2.2 Add a label below the selector that displays the name of the selected or hovered ODS objective.
- [x] 2.3 Add keyboard navigation (arrow keys to move focus, Enter/Space to select).

## 3. MapWrapper refactoring

- [x] 3.1 Refactor `MapWrapper.vue` to accept `values` (Record<string, number>) and `colorScale` ((v: number) => string) as props. Remove the `hashValue` function, the CSV import, and all mock data generation.
- [x] 3.2 Update the legend to dynamically reflect the current color scale and data range instead of hardcoded values.
- [x] 3.3 Ensure municipalities with no matching value in the `values` prop render in a neutral color (light gray).

## 4. Homepage data integration

- [x] 4.1 In `index.vue`, add a reactive `selectedObjective` ref (default: 1) and replace the placeholder ODS selector with the `OdsSelector` component bound via `v-model`.
- [x] 4.2 Use `useFetch` or `useAsyncData` with a reactive key based on `selectedObjective` to fetch `/api/ods/promedios?objetivo={N}`. Transform the response into `Record<string, number>` mapping `codigo_ine` to `valor`.
- [x] 4.3 Compute a color scale function that uses `scaleLinear` from D3, ranging from white to the selected ODS objective's official color, with domain based on the data range (min–max of `valor`).
- [x] 4.4 Pass the computed `values` and `colorScale` to `MapWrapper` as props.

## 5. Static generation support

- [x] 5.1 Configure `nuxt.config.ts` route rules or `prerenderRoutes` so that all 17 API responses (`/api/ods/promedios?objetivo=1` through `17`) are prerendered at build time.
- [x] 5.2 Verify the static build works: run `nuxt generate` and confirm the homepage renders with real ODS data and the API JSON files are present in the output.
