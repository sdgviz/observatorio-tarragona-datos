## 1. Schema

- [x] 1.1 In `transform/src/schema/tables.ts`: remove `CREATE_INDICADORES_ODS` and `CREATE_INDICADORES_AGENDAS`. Add `CREATE_INDICADORES` with the same column schema (id_indicador, codigo_ine, periodo, valor, indice, categoria, no_agregar, texto) and FKs to METADATA and REGIONES. Update `ALL_DDL` array.

## 2. Transform pipeline

- [x] 2.1 In `transform/src/transform/indicadores.ts`: simplify `routeIndicadores` — remove the split by `clase`. Return `{ indicadores: IndicadorRow[], skipped: number }` instead of `{ agendas, ods, skipped }`. All indicators with known metadata (clase 'agendas' or 'ods') go into the single `indicadores` array.
- [x] 2.2 In `transform/src/transform/index.ts`: update the `TransformResult` type and `transformAll` function to use the new single `indicadores` field instead of `indicadoresAgendas` + `indicadoresOds`. Update the console log output accordingly.

## 3. Loader

- [x] 3.1 In `transform/src/load/loader.ts`: replace the two `insertMany` calls for `INDICADORES_AGENDAS` and `INDICADORES_ODS` with a single `insertMany` call for `INDICADORES`. Update the `LoadData` type if it exists.

## 4. Static viewer

- [x] 4.1 In `transform/src/build-static-viewer.ts`: replace the two separate queries against `INDICADORES_ODS` and `INDICADORES_AGENDAS` with a single query against `INDICADORES`. Join with `METADATA` (on `id_indicador`) to filter by `tipo` when distinguishing ODS vs agenda indicators for `odsByMun` and `auByMun` maps.

## 5. Rebuild and verify

- [x] 5.1 Run `pnpm run transform` and verify the database is created successfully with the `INDICADORES` table containing all rows (sum of previous INDICADORES_ODS + INDICADORES_AGENDAS).
- [x] 5.2 Verify `INDICADORES_DESCRIPTIVOS` is unaffected.
- [x] 5.3 Verify the static viewer build script runs without errors if applicable.
