## Transform pipeline and CSV integrity checks

This repository contains the data transformation pipeline that converts the Diputación de Tarragona CSV dataset into a normalized SQLite database, plus a lightweight CSV integrity check CLI.

### CSV integrity checks (local)

- **Command**: `cd transform && pnpm run check:csv`
- **Dataset directory (default)**: `../dataset/`
- **Report output directory (default)**: `../githubpage/csv-integrity/`

The command will:

- Run a set of basic **format checks**:
  - Each required CSV file exists (`regiones.csv`, `indicadores_agendas.csv`, `metadatos_agendas.csv`, …).
  - Each file is non-empty and has a header line that can be parsed.
  - Each file contains a minimal set of required columns (for example `codigo_ine`, `indicador`, `periodo`).
- Run basic **data consistency checks**:
  - Each region defined in `regiones.csv` has at least one indicator in `indicadores_agendas.csv`.
  - Every indicator used in `indicadores_agendas.csv` appears in `metadatos_agendas.csv`.
- Exit with:
  - Code `0` when all tests pass.
  - Non-zero code if any test fails or errors.

### Reports for GitHub Pages

When you run `pnpm run check:csv` from the `transform` directory, the CLI generates:

- `githubpage/csv-integrity/results.json` – machine-readable summary with:
  - Global totals (tests, passed, failed, errored).
  - A list of individual tests with `id`, `description`, `status` and optional `details`.
- `githubpage/csv-integrity/index.html` – a static HTML report that:
  - Shows global totals (passed/failed/errored) in a compact summary.
  - Lists each test with its status and any relevant details (missing files, columns, regions without indicators, indicators without metadata, etc.).

The `githubpage/csv-integrity/` folder is structured so it can be served directly by **GitHub Pages** without any additional build step. A future CI workflow can simply publish this folder so the latest CSV integrity report is always visible on the web.

