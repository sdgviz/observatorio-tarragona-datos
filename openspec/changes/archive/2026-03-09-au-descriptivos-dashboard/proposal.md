# AU Descriptivos Dashboard

## Why

La página de Agenda Urbana del municipio necesita una vista de indicadores descriptivos que permita filtrar por objetivos, buscar por nombre, comparar con otro municipio y ver cada indicador con su código, nombre, valor de año base, valor actualizado y un rango visual. Actualmente el componente `Descriptivo.vue` está vacío y la referencia (`references/descriptivos.vue`) usa datos CSV, Options API y estructuras antiguas; el backend ya expone `/api/agenda/descriptivos` y `/api/municipios/list`, por lo que hay que implementar la nueva vista consumiendo esos endpoints con TypeScript, Composition API, Tailwind y Nuxt UI.

## What Changes

- **Implementar** la vista de descriptivos dentro de `app/components/municipio/au/Descriptivo.vue` usando el endpoint existente `GET /api/agenda/descriptivos?codigo_ine=...`.
- **Por cada indicador** mostrar: código, nombre, valor año base (tooltip con el año), valor actualizado (tooltip con el año), y un rango visual similar a `references/rangoPlot.vue` (según `thr` del API).
- **Filtro por objetivo**: componente tipo `references/listaObjetivos.vue` (objetivos encendidos/apagados), usando iconos en `public/svg_agenda/` y configuración en `app/assets/config/objetivos_agenda.json`.
- **Búsqueda** por nombre de indicador (campo de texto que filtra la lista).
- **Selector de municipio a comparar**: dropdown con municipios de `GET /api/municipios/list`; al seleccionar, pedir sus datos con el mismo endpoint y mostrar una fila debajo de cada indicador del municipio actual con los valores del municipio comparado.
- **Stack tecnológico**: TypeScript, Composition API, Tailwind, componentes Nuxt UI (las referencias son válidas funcionalmente pero JS/Options API; no se reutilizan tal cual).

## Capabilities

### New Capabilities

- `au-descriptivos-dashboard`: Vista de indicadores descriptivos de Agenda Urbana con filtro por objetivos, búsqueda por nombre, comparación con otro municipio, tabla de indicadores (código, nombre, año base, actualizado, rango) y componentes reutilizables (selector de objetivos, rango visual).

### Modified Capabilities

- Ninguno. Se consumen los endpoints existentes `/api/agenda/descriptivos` y `/api/municipios/list` sin cambios de contrato.

## Impact

- **Código**: `diputacion_tarragona/app/components/municipio/au/Descriptivo.vue` (implementación principal), posiblemente nuevos subcomponentes o composables en el mismo proyecto (selector de objetivos AU, celda de rango, etc.).
- **APIs**: Solo uso de `GET /api/agenda/descriptivos?codigo_ine=...` y `GET /api/municipios/list` (ya existentes).
- **Assets**: Uso de `public/svg_agenda/` (agenda_*.svg, agenda_line_*.svg, agenda_off_*.svg) y `app/assets/config/objetivos_agenda.json`.
- **Tipos**: Uso de `app/types/agenda.ts` (DescriptivoIndicador, DescriptivosResponse) y `app/types/municipios.ts` (Municipio, MunicipioListResponse).
