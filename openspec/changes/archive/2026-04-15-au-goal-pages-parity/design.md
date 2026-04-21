## Context

- ODS goal pages live at `app/pages/ods/[objetivo].vue` with header menu from `ods_list`, data from `/api/ods/promedios`, `/api/ods/objetivo-indicadores`, `/api/municipios/list`, and per-indicator values from `/api/indicadores/valores`.
- AU aggregate map data already exists at `/api/au/promedios?objetivo=1..10`. Home (`app/pages/index.vue`) filters municipios with `id_especial3 === "aue"` and passes `zoom-region-ines`, `emphasized-ines`, and `interaction-ines` into the map for AU mode.
- `app/assets/config/config.js` exports `objetivos_agenda` (10 objectives with `id`, `name`, `color`) — same source as AU branding elsewhere.
- Municipio AU pages already enforce AUE membership in `server/api/au/indicadores.get.ts`.

## Goals / Non-Goals

**Goals:**

- Parity of **navigation** (header menu) and **page UX** (map + layer selector + beeswarms + cross-highlight + explore link) between ODS and AU for objectives **1–10**.
- **AUE-only** municipality set on AU goal pages: filtering `municipiosList`, map emphasis/zoom, and beeswarm/map value inputs consistent with that set.
- **Single catalog endpoint** for “which indicators belong to AU objective *n*”, analogous to ODS.

**Non-Goals:**

- Changing SDG-only features (17 objectives, SDG-specific assets) or removing the existing ODS menu.
- Backend changes to how `PROMEDIOS_AGENDAS` is populated or to non-AUE municipio records.
- New comarca/region taxonomy for AU beyond what the ODS page already offers (reuse existing region filters with client-side AND against the AUE pool unless product asks to hide them).

## Decisions

1. **Routes** — Use `app/pages/au/[objetivo].vue` with `validate` for integers 1–10 and `app/pages/au/index.vue` as hub (list or redirect; match project convention used for `/ods`).
2. **Header layout** — Show **one** goal dropdown at a time by visualization mode: ODS menu when `visualizationStore.isODS`, AU menu when `isAU`, occupying the same nav slot to avoid two competing 10/17 row menus. Trigger styling mirrors ODS (goal color + localized title on active AU route `/au/{n}`).
3. **AUE pool** — Derive `aueIneList` / `aueIneSet` from `GET /api/municipios/list` the same way as `index.vue`. All beeswarm series and map fill keys intersect with this set; non-AUE INEs have no fill / no interaction (per map component contract already used on home).
4. **Map props** — Reuse the home AU pattern: pass `zoom-region-ines`, `emphasized-ines`, `interaction-ines` (and any related props `MapTarragona` already supports) so the viewport is “zoomed in” on AUE and non-AUE polygons are visually de-emphasized or non-interactive as on the homepage.
5. **API** — Implement `GET /api/au/objetivo-indicadores` with query `objetivo` (1–10), `lang` (es|ca). Implementation mirrors `ods/objetivo-indicadores.get.ts` but uses agenda `AUE` and dictionary ids consistent with `AUE-{n}` / architecture rows already used by promedios (same structural query as ODS with agenda and id prefix swapped).
6. **Code reuse** — Prefer extracting shared composables or presentational chunks only if duplication exceeds ~80 lines or two pages drift; otherwise implement AU page by copying and adapting `ods/[objetivo].vue` first, then refactor in a follow-up if needed (keeps this change reviewable).
7. **Mode toggle on goal routes** — Extend `AppHeader.vue` route regex handling: if path matches `/ods/(\d+)` or `/(ca|es/)?ods/(\d+)` and `n` in 1–10, switch to `/au/n` (with locale prefix preserved); reverse when switching to ODS. For `n` in 11–17, switching to AU can navigate to `/au` hub or last valid AU route — **decision**: navigate to `/au` hub to avoid invalid AU objective.
8. **Mount sync** — On `au/[objetivo].vue` mount, call `setMode(VisualizationMode.AU)`; on `ods/[objetivo].vue`, call `setMode(VisualizationMode.ODS)` so direct URL entry matches toggle state.

## Risks / Trade-offs

- **Duplication** between ODS and AU goal pages → risk of bug fixes only applied to one. Mitigation: shared composable in a later change; for now, document overlap in tasks and align structure.
- **i18n** — `objetivos_agenda` names in config are Spanish uppercase; ODS uses `t('ods_n_name')`. Mitigation: add `au_1_name` … `au_10_name` (or reuse a single nested object) in `ca.json` / `es.json` for proper titles.
- **Prerender** — Static hosting must include `/au/1`…`/au/10`; missing routes cause 404 in production. Mitigation: update `nuxt.config` `routeRules` / `nitro.prerender.routes` (whichever the project uses for `/ods/*`).

## Migration Plan

- Ship frontend + API together; no data migration. Rollback: remove routes and menu; API unused is harmless.

## Open Questions

- Whether region filters on AU goal pages should be **hidden** when the AUE pool is small, or kept for consistency with ODS (default: **keep** for consistency).
