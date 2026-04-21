## Context

The ODS indicator view (`IndicadoresView.vue`, ~470 lines) is a mature feature with list/dashboard modes, comparison, scroll spy, and a rich UI. The Agenda Urbana (AU) "Seguimiento" tab needs an equivalent experience but organized by 10 AU strategic objectives instead of 17 SDG goals. The database already has `DICCIONARIO` entries with `agenda = 'AUE'` at two levels (strategic objectives and specific objectives) plus `ARQUITECTURA_L2` mappings to indicators.

Only a subset of municipios participate in AU (`REGIONES.id_especial3 = 'aue'`), which constrains the comparison feature.

The existing ODS inner components (`IndicadoresListView`, `IndicadoresDashboardView`, `IndicadoresPanel`) are structurally taxonomy-agnostic — the only ODS-specific bits are icon paths, colors, and section label formatting.

## Goals / Non-Goals

**Goals:**
- Deliver a working Seguimiento view with list and dashboard modes for AU indicators.
- Reuse the existing inner components (ListView, DashboardView, Panel) to avoid duplicating complex UI.
- Keep the existing ODS view completely unchanged (backward-compatible additions only).
- Support municipio comparison filtered to AU-participating municipios.

**Non-Goals:**
- Spider chart generalization (separate follow-up change).
- Indicator picker modal (show all indicators for now; follow-up).
- Extracting a shared composable from IndicadoresView (pure refactoring; follow-up).
- Presupuestos/budgets view for AU.

## Decisions

### D1: Separate API endpoint instead of parameterized ODS endpoint
**Decision**: Create `GET /api/au/indicadores` as a separate route.
**Alternatives**: Add `agenda` query param to existing `/api/ods/indicadores`.
**Rationale**: The routes have different validation rules (AU requires `id_especial3 = 'aue'`), different `objetivo` range (1-10 vs 1-17), and different id prefix logic (`AUE-` vs `2030-`). Sharing the endpoint would require branching on every step. Separate routes are explicit and independently testable. The SQL query structure is identical — the code will be a close adaptation, not a copy.

### D2: TaxonomyConfig interface as the abstraction boundary
**Decision**: Define a `TaxonomyConfig` interface that encapsulates taxonomy-specific resolution (icons, colors, labels, id parsing). Shared components receive it as an optional prop with ODS defaults.
**Alternatives**: (a) Provide/inject pattern. (b) Slot-based composition. (c) Hardcode AU branches.
**Rationale**: Props are the simplest and most explicit mechanism in Vue. The config is small (~7 fields), purely data-driven, and stateless. Provide/inject adds implicit coupling. Slots would require restructuring templates. Hardcoded branches pollute components with taxonomy awareness.

The config shape:
```typescript
interface TaxonomyConfig {
  key: 'ods' | 'au'
  objectiveCount: number
  idPrefix: string
  iconPath: (num: number) => string
  colorByNum: (num: number) => string
  sectionLabel: (num: number, name: string) => string
  scrollAnchorPrefix: string
}
```

### D3: Duplicate orchestrator logic instead of extracting a composable now
**Decision**: `Seguimiento.vue` will contain its own orchestration logic (flatten hierarchy, build sections, manage comparison, scroll spy wiring) rather than extracting a shared composable first.
**Alternatives**: Extract `useIndicadoresView` composable first, then both views use it.
**Rationale**: Extracting the composable requires refactoring the working IndicadoresView — a risky change with no user-facing value. Building Seguimiento with some duplication delivers the feature without touching ODS code. The composable extraction is explicitly planned as a follow-up refactoring spec. The duplicated logic (~200 lines) is straightforward procedural code (flatMap, computed filters).

### D4: Separate AU Pinia stores
**Decision**: Create `municipioAuIndicadoresPicker.ts` and `municipioAuComparison.ts` as separate stores.
**Alternatives**: Parameterize existing ODS stores with a taxonomy key.
**Rationale**: The AU comparison store has fundamentally different candidate filtering (`id_especial3 = 'aue'`). Separate stores keep state isolated — navigating between ODS and AU tabs won't cause cross-contamination of picker/comparison state. The store logic is simple (~40 lines each); duplication cost is minimal.

### D5: Reuse `OdsHierarchyResponse` type as-is
**Decision**: The AU API returns the exact same `OdsHierarchyResponse` type. No renaming.
**Alternatives**: Create a generic `HierarchyResponse` alias.
**Rationale**: The type name is slightly misleading for AU usage, but renaming would touch every import across the ODS codebase for zero functional benefit. A type alias can be added later during the composable extraction refactoring if desired.

### D6: AU comparison filtered by `id_especial3`
**Decision**: The AU comparison selector only shows municipios where `id_especial3 = 'aue'`. The `/api/municipios/list` endpoint already returns this field; filtering happens client-side.
**Alternatives**: Server-side filtered endpoint.
**Rationale**: The municipio list is small (~180 rows, already fetched). Client-side filtering is simpler and avoids a new API endpoint. The `Municipio` type already includes `id_especial3`.

## Risks / Trade-offs

- **[Duplication in orchestrators]** → Mitigated by the planned composable extraction follow-up. The duplicated code is read-only logic (computed properties, watchers) that rarely changes.
- **[ODS regression from shared component changes]** → Mitigated by making all new props optional with ODS-defaulting behavior. When no `taxonomyConfig` is passed, components behave exactly as before.
- **[AU data quality unknown]** → Some municipios may have sparse AU indicator data. The views already handle empty states gracefully (from ODS). The API validates municipio participation before querying.
- **[Naming: OdsHierarchyResponse for AU]** → Acceptable tech debt. The shape is truly generic; only the name is misleading. Low risk since it's an internal type.
