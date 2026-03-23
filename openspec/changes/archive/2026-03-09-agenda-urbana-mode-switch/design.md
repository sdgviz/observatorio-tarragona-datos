## Context

The application has two visualization modes: ODS and Agenda Urbana (AU). The mode toggle already exists in `AppHeader.vue`, wired to `useVisualizationStore` which exposes `isODS`/`isAU` and `setMode`. However, mode-switching has no effect on routing — there is only one municipio detail page (`/municipios/ods/[ine]`) and the AU mode has no corresponding page or components.

Current routing structure:
```
pages/municipios/ods/[ine].vue  → ODS detail page (tabs: Indicadores, Presupuestos)
```

Target routing structure:
```
pages/municipios/ods/[ine].vue  → ODS detail page (unchanged)
pages/municipios/au/[ine].vue   → AU detail page (tabs: Seguimiento, Descriptivo)
```

The header toggle lives outside the page tree, so mode-aware navigation must be triggered from `AppHeader.vue` using `useRoute` + `useRouter`.

## Goals / Non-Goals

**Goals:**
- Create the Agenda Urbana municipio page `/municipios/au/[ine]` with the same structural pattern as the ODS page
- Add two empty stub components for AU content: `Seguimiento` and `Descriptivo`
- When the toggle switches mode and the current route is a mode-specific municipio page, automatically navigate to the equivalent page in the new mode (preserving the `ine` param)
- When the toggle switches while NOT on a municipio page, simply update the store (existing behaviour)

**Non-Goals:**
- Implementing actual Agenda Urbana data fetching or content inside the stub components
- Changing the ODS page or its components
- Adding AU-specific navigation items to the header's nav links
- Making the home page map react to the mode (separate change)

## Decisions

### 1. Route namespace: `/municipios/au/[ine]` vs `/municipios/[ine]?mode=au`

**Decision**: Separate route directories (`/ods/` and `/au/`).

**Rationale**: The two modes have different component trees, different tabs, and will eventually load different data. Keeping them as separate pages (rather than one page with a conditional) avoids complex conditional logic in a single file and makes each page independently navigable and cacheable. It mirrors the existing ODS page structure.

**Alternative considered**: A single `/municipios/[ine].vue` page with `v-if` on mode. Rejected because it tightly couples two very different data/component domains into one file.

### 2. Navigation trigger location: AppHeader vs page watcher

**Decision**: Handle mode-switch navigation inside `AppHeader.vue` in the `isOdsActive` setter.

**Rationale**: The toggle lives in the header. The header already has access to `useRoute` and `useRouter`. Adding a watcher on the route inside each page would require duplicating logic in every mode-specific page. Centralising in the header means one place to maintain.

**Alternative considered**: A global route middleware or a watcher in a layout. Rejected as over-engineering for a two-mode, two-page scenario.

### 3. Detecting mode-specific routes

**Decision**: Check if the current route path starts with `/municipios/ods/` or `/municipios/au/` and extract the trailing `ine` segment.

**Rationale**: Simple string-based check on `route.path`. Using `route.params.ine` would require knowing the param name, which is fine, but checking the path prefix also guards against accidental navigation when on an unrelated page.

### 4. AU placeholder components location

**Decision**: Place AU components in `app/components/municipio/au/` subdirectory (`Seguimiento.vue`, `Descriptivo.vue`).

**Rationale**: Mirrors the ODS component pattern. The `municipio/` directory already groups municipio-level components. An `au/` subdirectory cleanly separates AU from ODS components and allows future growth.

## Risks / Trade-offs

- **Navigation on every toggle change**: If the user is on `/municipios/ods/123` and toggles twice quickly, they'll navigate ODS → AU → ODS. This is intentional and correct behaviour, but could feel jumpy. Mitigation: The toggle is a deliberate user action; no additional debouncing needed.
- **Store mode vs route mode out of sync**: If a user navigates directly to `/municipios/au/123` without using the toggle, the Pinia store mode would still be ODS. Mitigation: Each AU/ODS page can call `setMode` on mount to keep the store in sync with the route. Add this as a task.
- **Empty components**: Seguimiento and Descriptivo are stubs. Rendering them is safe (they're empty), but the AU page will appear content-less until future work fills them in. This is intentional and documented.

## Migration Plan

No data migrations or deployment steps required. This is a purely additive frontend change with no breaking changes. The existing ODS pages and routes are untouched. Deploy as normal.
