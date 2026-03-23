## Why

La vista de Indicadores ODS del municipio (`MunicipioIndicadores.vue`) es actualmente un placeholder vacío. Los datos ya están disponibles a través del endpoint `/api/ods/indicadores`, pero no existe ningún componente visual que los muestre. Los usuarios necesitan una forma de explorar cómo se posiciona su municipio en cada indicador ODS, con valores normalizados entre -100 y +100 (donde 0 es la media provincial).

## What Changes

- Implementar el componente `MunicipioIndicadoresChart.vue` con un gráfico de barras divergentes (−100 a +100) para visualizar los índices ODS de un municipio.
- Añadir la lógica de datos a `MunicipioIndicadores.vue`: llamada al endpoint, gestión de estados de carga y error.
- **Modo ODS**: cada objetivo ODS muestra una barra resumen (promedio de índices de sus indicadores) y se puede expandir para ver los indicadores individuales.
- **Modo Indicadores**: lista plana de todos los indicadores, cada uno con su barra y el logo del ODS al que pertenece.
- Switch para alternar entre ambos modos.
- Ordenación por nombre o por valor en cada columna/modo.
- Panel lateral (`USlideover`) con detalles completos del indicador al hacer click.
- Los indicadores con `indice: null` se omiten de la visualización.

## Capabilities

### New Capabilities

- `municipio-ods-bar-chart`: Componente de gráfico de barras divergentes para visualizar índices ODS de un municipio, con dos modos (por ODS / por indicador), ordenación y panel de detalle.

### Modified Capabilities

(ninguna)

## Impact

- **Ficheros nuevos**: `app/components/municipio/IndicadoresChart.vue`, `app/components/municipio/IndicadoresDetailPanel.vue`
- **Ficheros modificados**: `app/components/municipio/Indicadores.vue` (añadir llamada al endpoint y pasar datos al chart)
- **Endpoint consumido**: `GET /api/ods/indicadores?codigo_ine=<ine>` (ya existe, sin cambios)
- **Assets referenciados**: `public/svg_ods/sdgs_<N>_0.svg`, `app/assets/config/config.js`
- Sin cambios en servidor, base de datos ni tipos existentes
