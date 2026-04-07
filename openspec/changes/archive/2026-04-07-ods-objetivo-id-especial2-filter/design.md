## Context

The ODS goal page loads `GET /api/municipios/list` and filters client-side by `id_especial` and `id_poblacion`. The `REGIONES` table (and CSV fixtures) already include `id_especial2`, but the page does not surface it, and `Municipio` in `app/types/municipios.ts` does not declare it—so TypeScript and UX are out of sync with the database.

## Goals / Non-Goals

**Goals:**

- Add an `id_especial2` `USelect` wired like `id_especial` / `id_poblacion` (sentinel `__all__`, sorted distinct values from the list payload).
- Combine filters with **AND** logic in `municipioPoolFiltered`, `filterEmphasisInes`, `hasActiveRegionFilter`, reset, and the watcher that clears invalid municipio selection when the pool shrinks.
- Document the list API and region-filter UI specs so `id_especial2` is an explicit contract.

**Non-Goals:**

- Human-readable labels for raw codes (still display raw DB values like the other region selectors v1).
- Server-side filtering of `/api/municipios/list` by `id_especial2` (client-side intersection remains sufficient).
- Using `id_especial2` on municipio header or other pages unless already requested.

## Decisions

1. **Client-side filtering only** — Reuse the existing pattern: no new query parameters on `/api/municipios/list`. The handler already returns `REGIONES` rows via `SELECT *`; ensuring the column exists in the DB/schema is a data concern; the app only needs types + UI.
2. **Third `USelect` before municipio** — Order: `id_especial`, `id_especial2`, `id_poblacion`, then `USelectMenu` for municipio, then reset—mirrors logical grouping of “region” dimensions before search.
3. **Layout** — Use a responsive grid with one extra column on `md+` (e.g. `md:grid-cols-5`) so the filter row does not crush controls; on narrow screens the stack remains one column.
4. **i18n** — New key `odsPage.filterIdEspecial2` (or equivalent) in `ca` and `es`, parallel to `filterIdEspecial` / `filterIdPoblacion`.

## Risks / Trade-offs

- **[Risk] Empty or sparse `id_especial2` in data** → Mitigation: selector still shows “all” plus any distinct non-empty values; if none, dropdown only has “all”.
- **[Risk] Grid overcrowding on tablet** → Mitigation: stack on small breakpoints; optional shorter labels via i18n if copy is long.

## Migration Plan

Deploy with code + locale changes only. No DB migration required if `id_especial2` already exists in `REGIONES`; if an older DB lacked the column, regeneration/import from the canonical pipeline is outside this change.

## Open Questions

- None for implementation; product can later replace raw codes with labels if a lookup table is added.
