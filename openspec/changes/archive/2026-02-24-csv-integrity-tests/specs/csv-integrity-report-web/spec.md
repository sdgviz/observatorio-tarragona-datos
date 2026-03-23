## ADDED Requirements

### Requirement: Static HTML report for CSV integrity results
The system SHALL generate a static HTML report that presents the outcome of the CSV integrity checks in a human-readable way.

#### Scenario: Generate HTML report after running integrity checks
- **WHEN** the CSV integrity CLI command finishes running and writes the structured results file
- **THEN** the system SHALL generate or update a static HTML file (for example `docs/csv-integrity/index.html`)
- **AND THEN** the HTML file SHALL summarize, at minimum, the total number of tests, how many passed, how many failed, and how many errored

### Requirement: GitHub Pages-friendly folder structure
The static report and its supporting assets SHALL be written into a folder structure that can be served directly by GitHub Pages without additional build steps.

#### Scenario: Report folder is ready for GitHub Pages
- **WHEN** the CSV integrity command completes successfully or with failures
- **THEN** the system SHALL ensure that all report files (HTML, JSON and any static assets) are located under a single top-level folder (for example `docs/csv-integrity/`)
- **AND THEN** a GitHub Pages configuration SHALL be able to expose that folder as static content without additional processing

### Requirement: Per-test breakdown in the HTML report
The static HTML report SHALL display a per-test breakdown based on the structured results file.

#### Scenario: User inspects individual test outcomes
- **WHEN** a user opens the HTML report in a browser
- **THEN** the page SHALL list each test with at least: test identifier, human-readable description, and status
- **AND THEN** if a test has details (for example missing files, missing columns, regions without indicators), the page SHALL show those details or make them easily accessible from the listing

### Requirement: Report generation independent from network connectivity
The CSV integrity HTML report SHALL not depend on external resources to render correctly.

#### Scenario: Viewing the report offline
- **WHEN** a user opens the HTML report locally (for example from a cloned repository) without internet access
- **THEN** the page SHALL render with correct content and styling using only local assets (inline CSS or local static files)

