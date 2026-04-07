## Why

El panel lateral de detalle de indicador (`IndicadoresPanel.vue`) solo muestra el valor más reciente. Los usuarios necesitan ver la evolución temporal de cada indicador para detectar tendencias, y ya existe un endpoint (`/api/indicadores/valores`) que devuelve la serie temporal completa. Añadir una gráfica de área reutilizable cierra esta brecha.

## What Changes

- Se crea un componente D3 de gráfica de área (`EvolutionChart.vue`) genérico y reutilizable, inspirado en el `references/AreaChart.vue` existente.
- El componente recibe datapoints como props (desacoplado de cualquier tipo de indicador concreto), color de fondo personalizable y tamaño configurable (por defecto 480×320).
- El eje X maneja años con saltos: se genera un dominio lineal continuo entre el año mínimo y máximo, dejando huecos visibles donde no hay dato.
- Incluye animación de entrada al montarse y tooltip al hacer hover mostrando año y valor.
- Se integra en `IndicadoresPanel.vue`: al abrir el panel, se realiza un fetch al endpoint `/api/indicadores/valores?indicator_id=...&ine=...` para obtener la serie temporal y se pasa al nuevo componente.

## Capabilities

### New Capabilities
- `evolution-chart-component`: Componente D3 de gráfica de área reutilizable con animación, hover tooltip, color personalizable, tamaño configurable y soporte para huecos en el eje X.

### Modified Capabilities

_(sin cambios en capabilities existentes)_

## Impact

- **Nuevo fichero**: `app/components/EvolutionChart.vue`
- **Modificado**: `app/components/municipio/ods/IndicadoresPanel.vue` — añade fetch de datos temporales y renderizado de la gráfica.
- **Dependencia existente**: D3 (ya instalado en el proyecto), `@vueuse/core` (`useElementSize`, ya instalado).
- **Endpoint utilizado**: `GET /api/indicadores/valores` (ya implementado, sin cambios).
