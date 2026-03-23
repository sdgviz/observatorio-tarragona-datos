## 1. Discovery and data contract

- [x] 1.1 Confirm how to obtain the ordered list of indicator IDs (and labels) for each ODS 1–17 without a municipality context; choose API extension, reference-INE, or static export per `design.md`.
- [x] 1.2 Document the chosen period/year rules for map and beeswarm values (latest period vs fixed year) and align API query parameters.

## 2. Routing and hub

- [x] 2.1 Add `app/pages/ods/[objetivo].vue` with validation for 1–17, SEO (`useHead` / i18n titles), and 404 or redirect for invalid segments.
- [x] 2.2 Replace `app/pages/ods/index.vue` stub with a hub (links to all goals) or redirect; ensure consistency with `ods-goal-pages` spec.
- [x] 2.3 Register static prerender routes for `/ods/1` … `/ods/17` (and `/ods` if needed) in Nuxt config.

## 3. Header ODS menu

- [x] 3.1 Implement popover/dropdown in `AppHeader.vue` with 17 colored rows from shared ODS config; navigate to `/ods/{n}` on select; close on navigation.
- [x] 3.2 Style trigger to reflect current route when `path` matches `/ods/{n}` (background + label per Figma / screenshot).
- [x] 3.3 Add i18n keys (ca/es) for menu labels; verify keyboard focus and aria naming.

## 4. ODS goal page: map and layer selector

- [x] 4.1 Compose `MapWrapper` (or equivalent) on `[objetivo].vue` with props for `values` and `colorScale`; default layer = aggregate from `/api/ods/promedios`.
- [x] 4.2 Add layer control UI (aggregate + per-indicator) per Figma; wire selection to fetches for `/api/indicadores/valores` (all municipios) or agreed endpoint.
- [x] 4.3 Build `Record<string, number>` (or existing map value shape) from API responses; handle nulls and missing INE like homepage.
- [x] 4.4 Ensure legend updates on layer change; keep scale anchored to official ODS color for the page objective.

## 5. Beeswarm gallery and cross-highlight

- [x] 5.1 For each indicator under the objective, map API results to `BeeswarmDatapoint[]` and render `BeeswarmChart` inside `ClientOnly` with skeletons.
- [x] 5.2 Add page-level `highlightedIne` (or equivalent) and connect map + all beeswarms (props + `update:highlightedIne`) following existing homepage patterns.
- [x] 5.3 Implement empty states for indicators with no datapoints without runtime errors.

## 6. Verification

- [x] 6.1 Manually verify all header links reach the correct `/ods/{n}` and trigger styling matches active goal.
- [x] 6.2 Verify map aggregate vs indicator switching and legend on at least two objectives (e.g. 3 and 11).
- [x] 6.3 Run `nuxt generate` (or project equivalent) and confirm prerendered `/ods/{n}` output exists.
- [x] 6.4 Smoke-test ca/es locales on new strings.
