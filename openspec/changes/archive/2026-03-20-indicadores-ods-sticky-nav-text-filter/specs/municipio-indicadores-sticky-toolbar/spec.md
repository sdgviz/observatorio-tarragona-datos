# municipio-indicadores-sticky-toolbar (change delta)

## ADDED Requirements

### Requirement: Sticky toolbar on municipio Indicadores tab

On the municipio **Indicadores** tab, the row that contains ODS navigation, the text filter, and the Lista/Dashboard mode tabs SHALL use **sticky** positioning at the top of the scroll container so it remains visible while the user scrolls the indicator content. The toolbar SHALL use a solid or translucent background and sufficient **z-index** so list/dashboard content does not show through unreadably while scrolling.

#### Scenario: Scroll mantiene controles visibles

- **WHEN** the user scrolls down within the Indicadores tab content
- **THEN** the ODS strip, text filter, and Lista/Dashboard tabs remain pinned at the top of the viewport area (subject to global layout offset)

#### Scenario: Toolbar no oculta interacción esencial

- **WHEN** the sticky toolbar is visible
- **THEN** the first ODS section or table below it remains reachable by scroll without being permanently hidden under opaque chrome (e.g. use scroll-margin on anchors or equivalent)

### Requirement: ODS strip coexists with filter and view tabs

The sticky toolbar SHALL lay out ODS controls, the free-text filter input, and view-mode tabs in a single responsive row or wrapped rows without breaking anchor scroll behaviour on narrow viewports.

#### Scenario: Vista estrecha

- **WHEN** the viewport is narrow
- **THEN** controls MAY wrap but remain usable and the ODS targets for scrolling remain functional
