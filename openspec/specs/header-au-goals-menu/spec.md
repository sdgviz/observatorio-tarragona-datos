# Header AU goals menu

## Purpose

Header dropdown menu that lists the Agenda Urbana / Agenda Metropolitana de Tarragona strategic objectives as navigation entries when the app is in AU mode, mirroring the ODS goals menu used in ODS mode.
## Requirements
### Requirement: Header exposes an Agenda Urbana objective menu in AU mode
When the visualization store is in Agenda Metropolitana de Tarragona mode, the application header SHALL include a control that opens a dropdown listing the **6** Tarragona líneas estratégicas. Each list row SHALL use the configured brand color for that línea and SHALL display the línea number and localized title. The control SHALL occupy the same navigation region as the ODS goals menu (mutually exclusive visibility: ODS menu when mode is ODS, Tarragona menu when mode is Tarragona). Menu copy SHALL read "Agenda Metropolitana de Tarragona" (or its short form), not "Agenda Urbana".

#### Scenario: User opens the Tarragona goals menu
- **WHEN** the user is in Agenda Metropolitana de Tarragona mode and activates the navigation control in the header
- **THEN** a layered menu SHALL open showing exactly 6 selectable rows
- **AND** each row SHALL use the configured Tarragona color for that línea as its background
- **AND** each row SHALL show the línea number and the título in the active locale
- **AND** the menu title / label SHALL contain "Agenda Metropolitana de Tarragona" (or short form)

#### Scenario: User selects an objective navigates to its page
- **WHEN** the user selects línea 4 from the menu
- **THEN** the application SHALL navigate to `/au/4` (including locale prefix when i18n strategy prefixes routes)
- **AND** the menu SHALL close

#### Scenario: Former AUE ids 7..10 are not listed
- **WHEN** the menu is opened in Tarragona mode
- **THEN** no menu row SHALL correspond to objective id in `7..10`

### Requirement: AU menu trigger reflects the active AU goal page
When the current route matches a Tarragona goal detail page (`/au/{n}` where `n` is `1..6`), the navigation trigger SHALL use that línea's configured color as its background (or an equivalent prominent treatment) and SHALL display the línea number and localized title.

#### Scenario: On línea 2 page
- **WHEN** the user is viewing `/au/2`
- **THEN** the navigation trigger SHALL reflect línea 2 branding (color and label for línea 2)
- **AND** the visualization mode SHALL be Agenda Metropolitana de Tarragona (consistent with the toggle)

### Requirement: AU menu data source and accessibility
Línea numbers, titles, and colors SHALL come from the same configuration source used elsewhere for the Agenda Metropolitana de Tarragona taxonomy (the generated `objetivos_agenda` re-export of `tarragona-metropolitan-taxonomy`), not hardcoded only in the header. The control SHALL be keyboard operable and SHALL expose an appropriate accessible name.

#### Scenario: Keyboard user selects an objective
- **WHEN** the menu is open and the user moves focus through the list and activates an item
- **THEN** navigation to the corresponding `/au/{n}` route SHALL occur
- **AND** focus SHALL be managed predictably after the menu closes

