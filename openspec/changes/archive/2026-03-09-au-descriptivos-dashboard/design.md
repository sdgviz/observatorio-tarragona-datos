# Design: AU Descriptivos Dashboard

## Context

- El backend ya expone `GET /api/agenda/descriptivos?codigo_ine=...` (tipos en `agenda.ts`: `DescriptivoIndicador`, `DescriptivosResponse`) y `GET /api/municipios/list`. El componente destino es `app/components/municipio/au/Descriptivo.vue`, actualmente vacío.
- Referencias: `references/descriptivos.vue` (layout, filtros, tabla, comparación), `references/listaObjetivos.vue` (toggle objetivos), `references/rangoPlot.vue` (rango visual). Esas referencias son JS/Options API y estructuras de datos distintas; se toman como guía funcional y de UX, no como código a copiar.
- Restricciones del proyecto: TypeScript, Composition API, Tailwind, Nuxt UI, uso de `useFetch`/`useAsyncData` para datos, i18n con `useI18n()`, componentes bajo `app/components/`.

## Goals / Non-Goals

**Goals:**

- Una sola vista en `Descriptivo.vue` que cargue descriptivos del municipio actual vía `/api/agenda/descriptivos?codigo_ine=...`.
- Mostrar por indicador: código, nombre, valor año base (tooltip con año), valor actualizado (tooltip con año), rango visual (según `thr`: 1Q–4Q).
- Filtro por objetivos estratégicos (1–10) con mismo comportamiento que la referencia: lista de objetivos que se pueden encender/apagar, iconos desde `public/svg_agenda/` y config desde `objetivos_agenda.json`.
- Búsqueda por nombre de indicador (input que filtra la lista en cliente).
- Selector de municipio a comparar (lista desde `/api/municipios/list`); al elegir uno, pedir sus descriptivos y mostrar una fila comparativa debajo de cada fila del municipio actual.
- Código en TypeScript, Composition API, estilos con Tailwind y componentes Nuxt UI donde aplique.

**Non-Goals:**

- Cambiar contratos de los endpoints existentes.
- Implementar nuevos endpoints.
- Soportar más de un municipio de comparación a la vez (solo uno).

## Decisions

1. **Datos del municipio actual**  
   El `codigo_ine` del municipio se obtendrá de la página/ruta que use el componente (por ejemplo `useRoute().params` o una prop). El componente recibirá `codigo_ine` como prop o se leerá de un composable/store ya usado en el flujo municipio/au.

2. **Selector de objetivos (AU)**  
   Crear un componente nuevo (p. ej. `AgendaObjetivosFilter.vue` o similar) que cargue `objetivos_agenda.json`, muestre los 10 objetivos con iconos de `public/svg_agenda/` (agenda_*.svg activo, agenda_off_*.svg inactivo, opcionalmente agenda_line_* para estado “solo borde”) y emita la lista de objetivos con estado activo/inactivo. Comportamiento de toggle: igual que la referencia (si todos están activos y se desactiva uno, solo queda ese desactivado; si solo uno está activo y se hace click en él, se activan todos). Esto permite filtrar indicadores por `aue1` (cada indicador trae `aue1: number[]`).

3. **Filtrado por objetivo**  
   En cliente: partiendo de la lista de indicadores devueltos por el API, filtrar por los objetivos actualmente activos en el selector. Un indicador se muestra si la intersección entre sus `aue1` y los IDs de objetivos activos es no vacía (o si todos los objetivos están activos, no filtrar).

4. **Búsqueda por nombre**  
   Un `UInput` (o equivalente Nuxt UI) que filtre en cliente la lista ya filtrada por objetivos: el texto se normaliza (minúsculas, sin acentos) y se hace `nombre.toLowerCase().includes(searchNormalized)`.

5. **Rango visual (thr)**  
   El API devuelve `thr: '1Q' | '2Q' | '3Q' | '4Q'`. Crear un subcomponente (p. ej. `DescriptivoRango.vue`) que dibuje una barra horizontal con una marca (círculo o similar) en la posición correspondiente al cuartil (p. ej. 1Q≈25%, 2Q≈50%, 3Q≈75%, 4Q≈100%), sin depender de D3 si no es necesario; puede ser CSS + una escala fija o un SVG simple. Si en el futuro el API devuelve min/max por indicador, el mismo componente podría aceptar un valor numérico y un rango [min, max].

6. **Comparación con otro municipio**  
   Selector: `USelect` (o similar) con opciones obtenidas de `useFetch('/api/municipios/list')`, mostrando `nombre` y valor `codigo_ine`. Al seleccionar un municipio, ejecutar `useFetch` o `$fetch` de `/api/agenda/descriptivos?codigo_ine={codigo_ine_seleccionado}` y guardar la respuesta en un ref. En la tabla, por cada fila de indicador del municipio actual, añadir una fila secundaria (estilo diferenciado, p. ej. fondo gris y texto “Municipio: {nombre}”) con código vacío, nombre del municipio comparado, y los mismos campos (valor ref, valor actual, opcionalmente rango) del indicador con el mismo `id_indicador` en la respuesta del municipio comparado. Si el municipio comparado no tiene ese indicador, mostrar “-” o vacío.

7. **Tooltips de años**  
   Para “valor año base” y “valor actualizado” usar `UTooltip` de Nuxt UI (o el patrón del proyecto): el contenido visible es el valor formateado (y unidad si existe); el tooltip muestra el año (`periodo_referencia` / `periodo_actual`).

8. **Formato de valores**  
   Usar la utilidad de formato numérico del proyecto (p. ej. `$format.numberFormat` o equivalente i18n) para valores numéricos; si el valor es `null`, mostrar “-” o texto equivalente.

9. **Estructura de componentes**  
   - `Descriptivo.vue`: orquestador (props o contexto con `codigo_ine`), fetch de descriptivos y de lista de municipios, estado de objetivos activos y búsqueda, tabla principal.  
   - Componente de filtro de objetivos AU (nombre TBD).  
   - Componente de rango (nombre TBD).  
   - La tabla puede ser un `UTable` con columnas: Código, Nombre (incluye input de búsqueda en cabecera), Año base, Actualizado, Rango; filas duplicadas para comparación según decisión 6.

10. **i18n**  
    Usar claves existentes si existen (p. ej. `descriptivos.*`, `global.filtrar`, `global.visualizar`, `global.code`, `global.range`); si no, añadir en los archivos de locale las necesarias para “Filtrar”, “Visualizar”, “Elige municipio”, “filtra por nombre del indicador”, “Año base”, “Actualizado”, “Rango (último dato)”, “indicadores seleccionados”, etc.

## Risks / Trade-offs

- **Riesgo**: Carga de dos municipios (actual + comparación) puede duplicar peticiones si el usuario cambia mucho el selector.  
  **Mitigación**: Mantener un único fetch de comparación keyed por `codigo_ine` (p. ej. con `useAsyncData` o ref que se actualiza al cambiar selección); opcionalmente no pre-cargar todos los municipios hasta que se abra el dropdown.

- **Riesgo**: Objetivos en `objetivos_agenda.json` usan `id` numérico y el API devuelve `aue1: number[]`; hay que asegurar que los IDs del JSON coinciden con los números en `aue1`.  
  **Mitigación**: En el diseño se asume que `aue1` contiene 1–10 y el JSON tiene `id` 1–10; documentar en tasks la verificación y el mapeo.

- **Trade-off**: El rango visual solo usa cuartiles (1Q–4Q) porque es lo que devuelve el API; no se dibuja un rango min–max real por indicador hasta que el backend lo exponga.

## Migration Plan

- No hay migración de datos ni de API. Despliegue: sustituir el contenido de `Descriptivo.vue` (y añadir componentes/composables nuevos) en la rama correspondiente; no hay rollback especial más allá de revertir el commit.

## Open Questions

- Ninguno crítico. Confirmar con producto si el texto “Rango (último dato)” y la leyenda de columnas (Año base / Actualizado) deben ser exactamente como en la referencia o hay copy definitivo en i18n.
