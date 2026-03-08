## ADDED Requirements

### Requirement: Modal se abre al hacer click en el botón Municipios
El sistema SHALL abrir el modal de selección de municipios únicamente cuando el usuario hace click en el botón "Municipios" del header. El modal NO SHALL abrirse al pasar el ratón por encima ni al recibir foco por teclado sin activación explícita.

#### Scenario: Apertura por click
- **WHEN** el usuario hace click en el botón "Municipios" del header
- **THEN** el modal de selección se muestra en pantalla

#### Scenario: No se abre por hover
- **WHEN** el usuario mueve el ratón sobre el botón "Municipios" sin hacer click
- **THEN** el modal permanece cerrado

### Requirement: Modal muestra lista completa de municipios agrupada por letra
El sistema SHALL mostrar todos los municipios de Tarragona organizados en grupos por la letra inicial de su nombre, ordenados alfabéticamente dentro de cada grupo.

#### Scenario: Visualización inicial
- **WHEN** el modal se abre sin texto de búsqueda
- **THEN** se muestran todos los municipios agrupados bajo su letra inicial (A, B, C…)
- **THEN** las letras se muestran ordenadas alfabéticamente

#### Scenario: Cada municipio es un enlace navegable
- **WHEN** el usuario hace click en el nombre de un municipio
- **THEN** el sistema navega a `/municipios/ods/[codigo_ine]` del municipio seleccionado
- **THEN** el modal se cierra

### Requirement: Buscador filtra la lista en tiempo real
El sistema SHALL filtrar la lista de municipios mientras el usuario escribe en el campo de búsqueda, sin requerir confirmación. El filtrado SHALL ser case-insensitive y tolerante a acentos.

#### Scenario: Filtrado por nombre parcial
- **WHEN** el usuario escribe texto en el campo de búsqueda
- **THEN** solo se muestran los municipios cuyo nombre contiene el texto introducido (ignorando mayúsculas/minúsculas y acentos)
- **THEN** la agrupación por letras se actualiza para reflejar solo los resultados filtrados

#### Scenario: Sin resultados
- **WHEN** el texto de búsqueda no coincide con ningún municipio
- **THEN** el sistema muestra un mensaje indicando que no hay resultados

#### Scenario: Limpiar búsqueda
- **WHEN** el usuario borra el texto del campo de búsqueda
- **THEN** la lista vuelve a mostrar todos los municipios

### Requirement: Modal se cierra con X o Escape
El sistema SHALL permitir cerrar el modal mediante el botón X visible en el modal o pulsando la tecla Escape.

#### Scenario: Cierre con botón X
- **WHEN** el usuario hace click en el botón X del modal
- **THEN** el modal se cierra y el foco vuelve al botón "Municipios" del header

#### Scenario: Cierre con Escape
- **WHEN** el modal está abierto y el usuario pulsa la tecla Escape
- **THEN** el modal se cierra
