## Context

- La página `municipios/ods/[ine].vue` ya tiene tres tabs (ODS, Indicadores, Presupuestos) y enlaza `MunicipioOdsView`, `MunicipioOdsIndicadoresView` y `MunicipioOdsPresupuestosView`.
- `MunicipioOdsView` (odsView.vue) está vacío. La vista actual de “indicadores” usa `IndicadoresView` + `IndicadoresChart`, que muestra jerarquía ODS → indicadores y valor **índice** (−100 a +100).
- El endpoint `GET /api/ods/indicadores?codigo_ine=<ine>` devuelve `OdsHierarchyResponse` con `objetivos[].metas[].promedio_indice` y `objetivos[].promedio_indice` (tabla PROMEDIOS_ODS).
- `OdsSelector.vue` es un selector **único** (radiogroup) de ODS 1–17 con botones y logos; el filtro de Indicadores debe tener la **misma apariencia** pero comportamiento **multi-selección** (unión de ODS, por defecto todos, deseleccionar todos → volver a todos).

## Goals / Non-Goals

**Goals:**

- Tab ODS: vista ODS → metas con barras divergentes usando `promedio_indice` por meta (y opcionalmente por objetivo).
- Tab Indicadores: lista plana de indicadores mostrando **valor** (no índice), con filtro por ODS (multi-select, misma pinta que OdsSelector).
- Mantener reutilización de tipos, API y estilos actuales (barras −100 a +100, logos, config).

**Non-Goals:**

- No cambiar el tab Presupuestos ni la API.
- No modificar la estructura de la página (tres tabs ya definidos).
- No añadir nuevo endpoint; se usa solo el existente.

## Decisions

- **D1 — odsView: reutilizar patrón de IndicadoresChart.** La vista ODS→metas tendrá la misma estructura visual que la actual ODS→indicadores (logo ODS, nombre, barra divergente, valor numérico), pero los datos serán objetivos y metas con `promedio_indice`. Se puede extraer un componente de “barra por fila” reutilizable o clonar la lógica en un componente dedicado (p. ej. `MetasChart.vue` o integrado en odsView) para no acoplar el tab Indicadores.
- **D2 — IndicadoresView: valor en lugar de índice.** En la lista plana se mostrará el campo `valor` del indicador (formateado según unidad si existe). La barra puede seguir siendo opcional (p. ej. proporcional a valor o oculta); el requisito prioritario es que el valor mostrado sea el real, no el índice.
- **D3 — Filtro ODS: componente nuevo o variante de OdsSelector.** Apariencia como OdsSelector (grid de botones 1–17, mismos logos/colores desde `ods_list` y `svg_ods`), pero estado: array de ODS seleccionados (Set o array de números). Clic en un ODS: (1) todos seleccionados → clic en uno deja solo ese; (2) varios seleccionados → clic en no seleccionado lo añade, clic en seleccionado lo quita; (3) un solo seleccionado → clic en ese vuelve a todos. ODS no seleccionados en gris. Toggle vacío → todos. Si la selección queda vacía tras un toggle, se fuerza de nuevo “todos seleccionados”. Se puede implementar como `OdsMultiSelect.vue` que recibe `modelValue: number[]` y emite `update:modelValue`, reutilizando estilos y markup de OdsSelector.
- **D4 — Origen de datos del filtro.** IndicadoresView ya obtiene `OdsHierarchyResponse`; la lista plana se filtra en cliente por `objetivoNum` (derivado de `objetivo.id`) según el Set de ODS seleccionados. No hace falta parámetro `objetivo` en la API para este tab.
- **D7 — Ordenación en Indicadores.** Ordenación principal por defecto: por ODS (objetivo 1..17); dentro de cada ODS por nombre de indicador. No se ofrece ordenación por valor (valores heterogéneos en unidades y escalas). Opciones: Por ODS, Nombre A→Z, Nombre Z→A; el campo "nombre" es siempre `indicador.nombre`.
- **D5 — “Deseleccionar todos” → todos de nuevo.** En el handler del toggle, si el nuevo estado sería “ningún ODS seleccionado”, en lugar de aplicarlo se asigna el conjunto completo {1..17}. Así se evita un estado vacío en la UI.
- **D6 — Mismo endpoint y cacheo por key.** Tanto odsView como IndicadoresView obtienen datos del mismo endpoint `GET /api/ods/indicadores?codigo_ine=<ine>`. Se usará la misma **key** en el composable de Nuxt (p. ej. `useFetch(..., { key: ['api/ods/indicadores', ine] })`) en ambos componentes para que Nuxt comparta la respuesta en caché: al cambiar de tab no se lanza una segunda petición y ambos tabs leen los mismos datos cacheados.

## Risks / Trade-offs

- **Riesgo:** Duplicar lógica de barras entre odsView (metas) e IndicadoresChart (indicadores). **Mitigación:** Extraer un subcomponente de fila con barra + valor o reutilizar estilos/helpers; si el tiempo es limitado, duplicar solo en odsView y refactorizar después.
- **Riesgo:** OdsMultiSelect y OdsSelector divergen en estilo. **Mitigación:** Misma estructura de botones y clases (o un componente base con slot/prop para single vs multi) para que la apariencia sea la misma.
- **Trade-off:** Mostrar “valor” sin barra puede hacer la lista menos comparable visualmente. Aceptable si el requisito es priorizar valor numérico; la barra puede añadirse después como mejora (p. ej. escalada por máximo del conjunto).
