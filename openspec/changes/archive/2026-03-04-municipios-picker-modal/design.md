## Context

El header usa actualmente un `UDropdownMenu` de Nuxt UI para el ítem "Municipios". Este componente se abre al hover/focus, lo que no es adecuado para un selector de 184 municipios. El proyecto ya dispone del CSV de municipios importable estáticamente vía `@rollup/plugin-dsv` y de la ruta `/municipios/ods/[ine]` ya implementada.

## Goals / Non-Goals

**Goals:**
- Modal de pantalla completa (o muy grande) activado solo por click
- Buscador que filtra municipios en tiempo real por nombre
- Lista agrupada por letra inicial, ordenada alfabéticamente
- Navegación a `/municipios/ods/[ine]` al seleccionar un municipio
- Cierre con botón X o tecla Escape
- Datos obtenidos del CSV estático (sin llamadas a API)

**Non-Goals:**
- Filtro por comarca (fuera de scope, el wireframe muestra solo filtro por nombre)
- Paginación
- Favoritos o historial de municipios visitados

## Decisions

### 1. Componente de modal: `UModal` de Nuxt UI
Se usa `UModal` con `fullscreen` o tamaño `xl`/`2xl` en lugar de construir un modal custom. Nuxt UI gestiona el trap de foco, el cierre con Escape y la accesibilidad automáticamente.

**Alternativa descartada:** `UDrawer` (deslizante lateral) — no encaja con el wireframe que muestra un panel frontal.

### 2. Apertura por click, no hover
El botón "Municipios" del header pasa de `UDropdownMenu` (que puede abrirse al hover) a un `UButton` plain con un `v-model` que controla la visibilidad del `UModal`. El modal nunca se abre por hover/focus solo.

### 3. Datos: import estático del CSV
```ts
import municipiosData from '~/assets/data/municipios_tarragona.csv'
```
El CSV se bundlea en build time. El filtrado y agrupación por letra es puramente reactivo en el cliente con `computed`.

### 4. Agrupación alfabética
`computed` que agrupa los municipios filtrados en un objeto `Record<string, Municipio[]>` donde la clave es la letra inicial (mayúscula). Las letras se muestran ordenadas con `Object.keys().sort()`.

### 5. Campo de búsqueda: `UInput` con `v-model`
Filtrado case-insensitive, normalizado (sin acentos) para que "Reus" encuentre "Reus" y "almoster" encuentre "Almoster".

## Risks / Trade-offs

- **Bundle size**: los 184 municipios en JSON (tras parseo del CSV) son <10 KB, sin impacto apreciable.
- **Rendimiento del filtrado**: con 184 items, un `computed` es más que suficiente. Sin virtualización.
- **Compatibilidad i18n**: el modal muestra nombres de municipios directamente del CSV (sin traducción), lo cual es correcto porque los topónimos son en catalán/castellano por convención.
