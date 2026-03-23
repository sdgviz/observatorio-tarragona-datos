## ADDED Requirements

### Requirement: Lista plana de indicadores con valor (no índice)
El tab Indicadores SHALL mostrar una lista plana de todos los indicadores disponibles para el municipio. Cada fila SHALL mostrar el **valor** (`valor`) del indicador, no el índice (`indice`). El valor SHALL formatearse según la unidad en metadata cuando exista.

#### Scenario: Valores mostrados
- **WHEN** el usuario está en el tab Indicadores con datos cargados
- **THEN** cada indicador muestra su campo valor (número real), no el indice normalizado −100 a +100

#### Scenario: Sin valor
- **WHEN** un indicador tiene `valor === null`
- **THEN** se muestra un guion o texto equivalente (p. ej. "—") en lugar del número

### Requirement: Filtro por ODS con apariencia OdsSelector
SHALL existir un filtro por ODS con la **misma apariencia** que `OdsSelector.vue`: grid de 17 botones (ODS 1 a 17), mismos logos (`/svg_ods/sdgs_<N>_0.svg`) y colores (p. ej. desde `ods_list` en config). El comportamiento SHALL ser **multi-selección** (no un único ODS seleccionado).

#### Scenario: Apariencia del filtro
- **WHEN** el usuario está en el tab Indicadores
- **THEN** se muestra un bloque de botones/iconos de ODS con el mismo estilo visual que OdsSelector (tamaño, logos, colores)

#### Scenario: Por defecto todos los ODS seleccionados
- **WHEN** el tab Indicadores se carga por primera vez
- **THEN** todos los ODS están seleccionados y se muestran todos los indicadores de todos los objetivos

### Requirement: Lógica multi-selección del filtro ODS
El filtro SHALL seguir esta lógica de clic:
- **Con todos los ODS seleccionados:** clic en un ODS → se deseleccionan todos y queda activo solo ese ODS (se muestra solo la lista de indicadores de ese objetivo).
- **Con uno o más ODS seleccionados:** clic en un ODS **no** seleccionado → se añade a la selección (unión).
- **Con varios ODS seleccionados:** clic en un ODS ya seleccionado → se quita de la selección.
- **Con un único ODS seleccionado:** clic en ese mismo ODS → se vuelven a seleccionar todos los ODS (vuelta al estado inicial).

Los ODS no seleccionados SHALL mostrarse en gris (p. ej. `grayscale` o fondo gris) para distinguirlos visualmente de los seleccionados (color pleno).

#### Scenario: Clic con todos seleccionados
- **WHEN** todos los ODS están seleccionados y el usuario hace clic en un ODS (p. ej. ODS 5)
- **THEN** solo ese ODS queda seleccionado y se muestran únicamente los indicadores de ese objetivo

#### Scenario: Añadir ODS a la selección
- **WHEN** hay uno o más ODS seleccionados y el usuario hace clic en un ODS no seleccionado
- **THEN** ese ODS se añade a la selección y la lista muestra la unión de indicadores de todos los ODS seleccionados

#### Scenario: Quitar ODS de la selección
- **WHEN** hay varios ODS seleccionados y el usuario hace clic en uno de los seleccionados
- **THEN** ese ODS se deselecciona y la lista se actualiza (excluyendo los indicadores de ese objetivo salvo que pertenezcan a otro ODS aún seleccionado)

#### Scenario: Volver a todos
- **WHEN** solo hay un ODS seleccionado y el usuario hace clic en ese mismo ODS
- **THEN** se vuelven a seleccionar todos los ODS y se muestran todos los indicadores

#### Scenario: ODS no seleccionados en gris
- **WHEN** hay al menos un ODS no seleccionado
- **THEN** los botones de los ODS no seleccionados se muestran en gris (o con estilo desaturado) para distinguirlos de los seleccionados

### Requirement: Deseleccionar todos vuelve a todos seleccionados
Si como resultado de una acción del usuario ningún ODS quedara seleccionado, el sistema SHALL tratar ese estado como inválido y SHALL volver a tener todos los ODS seleccionados (mostrando de nuevo todos los indicadores).

#### Scenario: Último ODS deseleccionado
- **WHEN** el usuario deselecciona el último ODS que quedaba seleccionado
- **THEN** en lugar de mostrar una lista vacía, se vuelven a marcar todos los ODS como seleccionados y se muestran todos los indicadores

#### Scenario: Ningún ODS seleccionado por cualquier medio
- **WHEN** el estado de selección pasa a ser el conjunto vacío (p. ej. por un bug o interacción futura)
- **THEN** el sistema reasigna la selección al conjunto completo {1..17} y la lista muestra todos los indicadores

### Requirement: Ordenación de la lista de indicadores
La lista de indicadores SHALL ser ordenable. No se SHALL ofrecer ordenación por valor numérico, ya que los valores son heterogéneos (distintas unidades y escalas). Las opciones SHALL ser: **Por ODS** (por defecto), **Nombre A→Z**, **Nombre Z→A**.

- **Por ODS:** orden principal por número de objetivo (1 a 17); dentro de cada ODS, orden secundario por nombre del indicador.
- **Nombre A→Z / Z→A:** orden por el campo **nombre del indicador** (`indicador.nombre`), ascendente o descendente alfabéticamente.

#### Scenario: Ordenación por defecto
- **WHEN** el usuario entra en el tab Indicadores
- **THEN** la lista está ordenada por ODS (objetivo 1, 2, … 17) y dentro de cada ODS por nombre de indicador

#### Scenario: Ordenación por nombre del indicador
- **WHEN** el usuario elige "Nombre A→Z" o "Nombre Z→A" en el selector de ordenación
- **THEN** la lista se ordena por el nombre del indicador (`indicador.nombre`), no por nombre de objetivo ni por valor
