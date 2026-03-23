## 1. Extracción de datos de la base de datos

- [x] 1.1 Añadir un script npm en el proyecto de datos (por ejemplo en `transform/package.json`) para generar los artefactos del visor estático (p.ej. `"build:static-viewer": "tsx src/build-static-viewer.ts"`).
- [x] 1.2 Crear el entry point TypeScript `src/build-static-viewer.ts` que abra la base de datos SQLite generada por el pipeline (ruta por defecto en `../output/diputacion_tarragona.db`) y lea la ruta de configuración de muestra y de salida.
- [x] 1.3 Implementar en `build-static-viewer.ts` la lectura de la estructura de agendas e indicadores (ODS, AU, descriptiva) desde las tablas correspondientes, construyendo un árbol jerárquico para cada agenda.
- [x] 1.4 Implementar en `build-static-viewer.ts` la extracción de los municipios y sus indicadores disponibles, generando para cada municipio de la muestra el conjunto de indicadores por agenda.

## 2. Configuración de muestra de municipios

- [x] 2.1 Crear un archivo de configuración de muestra de municipios (por ejemplo `config/static-viewer-sample.json`) que contenga una lista de `codigo_ine` a incluir en la generación estática.
- [x] 2.2 Implementar en `build-static-viewer.ts` la lectura de dicho archivo de configuración y el filtrado de los municipios para que solo se incluyan los definidos en la muestra.
- [x] 2.3 Definir un comportamiento por defecto claro cuando el archivo de muestra no exista (por ejemplo incluir todos los municipios presentes en la base de datos) y documentarlo en el README.

## 3. Generación de artefactos JSON para el visor

- [x] 3.1 Generar un fichero `agendas.json` en `docs/static-db-viewer/data/` que contenga la jerarquía de agendas e indicadores con información mínima pero legible (ids y nombres).
- [x] 3.2 Generar un fichero `municipios.json` en `docs/static-db-viewer/data/` que contenga la lista de municipios de la muestra con su identificador, nombre y los indicadores disponibles por agenda y el valor de cada indicador.
- [x] 3.3 Generar un fichero `objetivos_metas_municipios.json` en `docs/static-db-viewer/data/` que contenga la jerarquía de objetivos y metas de cada agenda para los municipios de la muestra.
- [x] 3.4 Asegurar que los JSON generados son razonablemente pequeños para la muestra esperada y que su estructura coincide con lo que espera el frontend estático.

## 4. Implementación de la web estática

- [x] 4.1 Crear la carpeta `docs/static-db-viewer/` con un `index.html` básico que incluya estructura de página y contenedores para menús y resultados.
- [x] 4.2 Añadir una hoja de estilos ligera (inline o `assets/styles.css`) para que la jerarquía de agendas e indicadores y las listas de municipios sean legibles.
- [x] 4.3 Implementar un script JS estático (por ejemplo `assets/app.js`) que cargue `data/agendas.json` y `data/municipios.json`, construya los selectores de agenda y municipio y renderice la jerarquía de indicadores.
- [x] 4.4 Asegurar que la web funciona correctamente al abrir directamente `docs/static-db-viewer/index.html` en un navegador sin servidor adicional (solo archivos estáticos).

## 5. Verificación y documentación

- [x] 5.1 Ejecutar el script de generación (`npm run build:static-viewer` o equivalente) usando la base de datos actual y comprobar que se crean `agendas.json`, `municipios.json` y la estructura `docs/static-db-viewer/`.
- [x] 5.2 Probar manualmente la web estática en un navegador (cargando el HTML generado) verificando que se pueden seleccionar agenda y municipio y que la jerarquía de indicadores se muestra de forma comprensible.
- [x] 5.3 Actualizar la documentación del repositorio de datos para explicar cómo generar el visor estático, cómo configurar la muestra de municipios y cómo integrar la carpeta `docs/static-db-viewer/` en GitHub Pages.

