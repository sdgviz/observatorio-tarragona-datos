# indicadores-view-filter (change delta)

## MODIFIED Requirements

### Requirement: Filtro por ODS con apariencia OdsSelector

SHALL exist a control strip of **17 ODS** targets with the **same visual appearance** as today (grid or row of buttons/icons, logos `/svg_ods/sdgs_<N>_0.svg`, colors from `ods_list`). The **primary behaviour** SHALL be **in-page navigation**: when the user activates an ODS in the strip, the view SHALL **scroll** so the content **section** for that ODS (Lista or Dashboard) is aligned to the viewport according to the anchor specification. The strip SHALL reside in the sticky toolbar (`municipio-indicadores-sticky-toolbar`). Optional visual emphasis of the last activated ODS is permitted for wayfinding and MAY drive overview chart highlight props.

#### Scenario: Apariencia del filtro

- **WHEN** el usuario está en el tab Indicadores
- **THEN** se muestra un bloque de botones/iconos de ODS con el mismo estilo visual que OdsSelector (tamaño, logos, colores)

#### Scenario: Clic desplaza a la sección del ODS

- **WHEN** el usuario activa un ODS en la tira (p. ej. ODS 7)
- **THEN** la página o contenedor hace scroll hasta el ancla del bloque de indicadores de ese ODS en el modo activo (Lista o Dashboard)

## REMOVED Requirements

### Requirement: Lógica multi-selección del filtro ODS

**Reason**: Sustituida por navegación por anclas y filtro por texto; ya no se ocultan objetivos por toggles de selección múltiple.

**Migration**: Todos los ODS con datos se muestran por secciones; para acotar indicadores usar el filtro de texto (≥ 3 caracteres).

### Requirement: Deseleccionar todos vuelve a todos seleccionados

**Reason**: El modelo de selección múltiple que podía dejar cero ODS activos deja de aplicarse.

**Migration**: No aplica.

## ADDED Requirements

### Requirement: Filtro de texto libre con umbral de tres caracteres

SHALL exist a **free-text** field in the Indicadores toolbar. When the trimmed query length is **strictly less than 3**, the UI SHALL **not** apply text filtering (all indicators that pass any other rules remain eligible). When the trimmed length is **greater than or equal to 3**, the UI SHALL show only indicators whose **nombre** matches the query **case-insensitively** (substring). Implementations MAY also match `descripcion` when present.

#### Scenario: Menos de tres caracteres sin filtrar

- **WHEN** the user has typed 0, 1, or 2 non-space characters
- **THEN** no text-based filter is applied to the indicator list or cards

#### Scenario: Tres o más caracteres filtran

- **WHEN** the user has typed at least 3 characters
- **THEN** only indicators matching the query are shown; ODS sections with no matching indicators SHALL be hidden or collapsed

#### Scenario: Sin resultados

- **WHEN** the query length is ≥ 3 and no indicator matches
- **THEN** the UI SHALL show an explicit empty state (message or placeholder)

### Requirement: ODS strip highlight tracks scroll position

The UI SHALL keep the **focused** ODS in the strip **aligned** with the in-page section the user has scrolled to: the focused ODS SHALL correspond to the last ODS section (in document order) whose **start** has crossed an **activation line** below the sticky toolbar (offset tuned vs global header height). **WHEN** the user scrolls the primary scroll container, the focused ODS SHALL update without requiring a strip click. **WHEN** the strip triggers a programmatic scroll to an anchor (e.g. `scrollIntoView`), the implementation SHALL **suppress** spurious focus changes for a short interval so the strip does not fight the scroll animation.

#### Scenario: Scroll updates focused ODS

- **WHEN** the user scrolls vertically so that a different ODS section crosses the activation line
- **THEN** the strip emphasis updates to that ODS

#### Scenario: Strip click then stable focus

- **WHEN** the user activates ODS *k* in the strip and the view scrolls to the section for *k*
- **THEN** the strip shows *k* as focused when scrolling settles

#### Scenario: Implementation note (window scroll root)

- **WHEN** the document uses the **window** as the scroll root
- **THEN** the implementation MAY use VueUse [`useWindowScroll`](https://vueuse.org/core/useWindowScroll/) together with a **throttled** reactive watcher (e.g. [`watchThrottled`](https://vueuse.org/shared/watchThrottled/) on scroll `y`) to drive updates; equivalent behaviour is required if the scroll root is a nested element
