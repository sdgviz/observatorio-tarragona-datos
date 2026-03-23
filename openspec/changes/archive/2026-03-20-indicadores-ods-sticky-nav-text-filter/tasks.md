## 1. Toolbar y navegación

- [x] 1.1 Refactor `IndicadoresView.vue`: envolver ODS strip + `UInput` búsqueda + `UTabs` en contenedor `sticky` con fondo y `z-index` acordes al layout (ajustar `top` vs header global).
- [x] 1.2 Sustituir o adaptar `OdsMultiSelect.vue` (o componente nuevo) para que el clic en un ODS emita `scroll-to-ods` o llame `document.getElementById` + `scrollIntoView` hacia `municipio-indicadores-ods-{n}`.
- [x] 1.3 Mantener estado opcional “último ODS activado” para resaltar en la tira y pasar a `DoubleSpiderMinMax` como `selected-ods` coherente con el diseño.
- [x] 1.4 Scroll spy: `useIndicadoresOdsScrollSpy` con VueUse `useWindowScroll` + `watchThrottled` sobre `y`; `lockScrollSync` tras scroll programático desde la tira.

## 2. Filtro texto y datos

- [x] 2.1 Añadir `ref` de consulta y `computed` que aplique filtro solo si `trim.length >= 3` (case-insensitive en `nombre`, opcional `descripcion`).
- [x] 2.2 Componer lista plana filtrada antes de agrupar por ODS; eliminar `USelect` de ordenación y funciones `applySort` / `sortKey`.

## 3. Lista y Dashboard con anclas

- [x] 3.1 `IndicadoresListView.vue`: agrupar filas por `objetivoNum`, una sección con `id="municipio-indicadores-ods-{n}"` y encabezado; tabla(s) por sección o bloques equivalentes; `scroll-margin-top` en anclas.
- [x] 3.2 `IndicadoresDashboardView.vue`: reagrupar tarjetas por ODS con el mismo `id` por sección; spider sigue arriba.
- [x] 3.3 Vacíos: mensaje cuando el filtro de texto no devuelve ningún indicador.

## 4. QA

- [x] 4.1 Probar Lista y Dashboard: clic en ODS 1/9/17, filtro 2 vs 3 letras, scroll en móvil, solapamiento con header.
- [x] 4.2 Revisar accesibilidad: foco/teclado en botones ODS y etiquetas del campo de búsqueda.
