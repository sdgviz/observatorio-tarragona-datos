## Context

`app/pages/ods/[objetivo].vue` shares one `selectedIne` and `highlightedIne` across `MapWrapper` and every `BeeswarmChart`. `REGIONES` already exposes `id_especial` and `id_poblacion`; `GET /api/municipios/list` returns full rows and supports `NMUN` (`id_poblacion`). `BeeswarmChart` already supports `highlights: string[]` (dim non-matching dots) and a single `highlightedIne` for **strong** emphasis (larger radius). `MapTarragona` supports one `highlightedIne`, one `selectedIne`, and zoom-to-selected when `zoomRegion` is empty.

## Goals / Non-Goals

**Goals:**

- Combination UI: independent selectors for **`id_especial`** and **`id_poblacion`** plus **municipio** (searchable select with “all” / cleared state), aligned with the reference layout (filter row above charts).
- Derive a **set of `codigo_ine`** matching the active combination (AND across chosen dimensions; empty dimension means “no constraint” on that axis).
- **All beeswarms** and the **map** use the same derived set for “filter emphasis”; **hover** can still refine a single INE for transient emphasis where useful.
- When the filter set is **non-empty**, **disable map zoom-to-selection** for this page only (no camera jump toward one municipio while exploring a group).
- Deliver via **optional props** on existing components; **no second BeeswarmChart/Map fork** unless a prop API becomes unmanageable.

**Non-Goals:**

- Changing homepage (`index.vue`) behaviour beyond what’s needed for shared component defaults (homepage may keep single-municipio UX).
- Server-side clustering or new analytics tables.
- Replacing `REGIONES` schema.

## Decisions

### 1. New components vs props

- **Choice:** Add **optional props** on `BeeswarmChart`, `MapTarragona`, and `MapWrapper` (forwarding). Keep a single implementation path.
- **Rationale:** Current call sites stay valid; ODS goal page opts in. A wrapper component (e.g. `OdsGoalFilterBar.vue`) is optional **only** for template cleanliness—not a second chart type.
- **Alternatives:** `BeeswarmChartV2` (rejected — duplication); provide/inject (rejected — harder to trace).

### 2. Beeswarm: list emphasis vs `highlights`

- **Choice:** Introduce a dedicated prop, e.g. **`filterEmphasisInes: string[]`** (empty = disabled), for municipalities that receive **strong** styling via **fill, opacity, and stroke** (not radius). Keep **`highlightedIne`** for **hover-only** emphasis (highest precedence), including the **only** case where radius MAY enlarge a dot. Keep **`highlights`** as optional broader dimming; when `filterEmphasisInes` is non-empty, filter rules **take precedence** over `highlights` for fill/opacity so the chart stays readable.
- **Rationale:** Many emphasized dots must stay **data-driven in size** (population / secondary scale); enlarging every filtered dot distorted the visualization.
- **Alternatives:** Overload `highlightedIne` with comma-separated string (rejected — brittle).

### 3. Map: multiple highlighted paths + no zoom when filtered + fade others

- **Choice:** Add **`emphasizedInes`** for persistent multi-path **stroke** styling; **`disableSelectionZoom: boolean`** when true skips the “zoom to selected municipio” branch in `MapTarragona`. Add **`fadeUnselected: boolean`**: when true and `emphasizedInes` is non-empty, reduce **fill opacity** for paths outside the set (combined with existing `zoomRegion` dimming via minimum opacity). `MapWrapper` forwards all. When filter set empty, behaviour matches today (`selectedIne` / zoom unchanged; fade off).
- **Rationale:** Stroke-only emphasis was hard to read with many municipalities; fading non-matching regions matches the beeswarm “subdue others” model.
- **Alternatives:** Reuse `zoomRegion` to mean “no zoom” (rejected — conflates Camp de Tarragona toggle with filter).

### 4. Filter controls: Nuxt UI

- **Choice:** **`USelect`** for map layer, `id_especial`, and `id_poblacion`; **`USelectMenu`** for municipio search. Use a sentinel (e.g. `__all__`) for “no filter” on `USelect` because empty string item values are invalid for the component.
- **Rationale:** Visual consistency with the rest of the app ([Nuxt UI Select](https://ui.nuxt.com/docs/components/select)).

### 5. Filter combination logic

- **Choice:** Start from full `municipiosList`; apply `id_poblacion` equality if selected; apply `id_especial` equality if selected; apply municipio if a single INE/name is chosen. Resulting set = intersection. **Clear** controls reset axes independently.
- **Rationale:** Matches SQL mental model; easy to test.
- **Data loading:** Use existing `useFetch('/api/municipios/list')` on the page; build distinct option lists client-side. If payload or SSR cost is too high later, add optional `GET /api/municipios/list?id_especial=…&NMUN=…` (AND).

### 6. API extension (optional)

- **Choice:** Prefer **client-side filter** first. If needed, extend `list.get.ts` with optional `id_especial` query validated against distinct REGIONES values, combinable with `NMUN`.
- **Rationale:** Parity with existing `NMUN` validation pattern.

## Risks / Trade-offs

- **Large REGIONES payload on client** → Mitigation: optional API filter; or lazy fetch after mount.
- **Ambiguous `id_especial` / `id_poblacion` labels** → Mitigation: show raw codes plus i18n labels in a follow-up if product provides a dictionary.
- **Hover + filter precedence** → Mitigation: document in spec—hover INE wins for stroke; filter set still visible as base emphasis.

## Migration Plan

1. Ship props as optional; verify `index.vue` and municipio pages unchanged.
2. Enable new UI only on `/ods/[objetivo]`.
3. Rollback: remove props usage and revert page filter row.

## Open Questions

- Exact labels for `id_especial` / `id_poblacion` in ca/es (raw DB vs translated buckets).
- Whether municipio selector should **restrict** to currently filtered rows only (recommended) or search globally.
