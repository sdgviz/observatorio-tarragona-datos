# Header AU goals menu

## ADDED Requirements

### Requirement: Header exposes an Agenda Urbana objective menu in AU mode
When the visualization store is in Agenda Urbana mode, the application header SHALL include a control that opens a dropdown listing all **10** Agenda Urbana objectives. Each list row SHALL use the configured brand color for that objective and SHALL display the objective number and localized title. The control SHALL occupy the same navigation region as the ODS goals menu (mutually exclusive visibility: ODS menu when mode is ODS, AU menu when mode is AU).

#### Scenario: User opens the AU goals menu
- **WHEN** the user is in Agenda Urbana mode and activates the AU navigation control in the header
- **THEN** a layered menu SHALL open showing 10 selectable rows
- **AND** each row SHALL use the configured AU color for that objective as its background
- **AND** each row SHALL show the objective number and the objective title in the active locale

#### Scenario: User selects an objective navigates to its page
- **WHEN** the user selects objective 4 from the AU menu
- **THEN** the application SHALL navigate to `/au/4` (including locale prefix when i18n strategy prefixes routes)
- **AND** the menu SHALL close

### Requirement: AU menu trigger reflects the active AU goal page
When the current route matches an AU goal detail page (`/au/{n}` where n is 1–10), the AU navigation trigger SHALL use that objective’s configured color as its background (or an equivalent prominent treatment) and SHALL display the objective number and localized title.

#### Scenario: On AU objective 2 page
- **WHEN** the user is viewing `/au/2`
- **THEN** the AU navigation trigger SHALL reflect objective 2 branding (color and label for objective 2)
- **AND** the visualization mode SHALL be Agenda Urbana (consistent with the toggle)

### Requirement: AU menu data source and accessibility
Objective numbers, titles, and colors SHALL come from the same configuration source used elsewhere for Agenda Urbana objectives (e.g. shared `objetivos_agenda` / theme tokens), not hardcoded only in the header. The control SHALL be keyboard operable and SHALL expose an appropriate accessible name.

#### Scenario: Keyboard user selects an objective
- **WHEN** the AU menu is open and the user moves focus through the list and activates an item
- **THEN** navigation to the corresponding `/au/{n}` route SHALL occur
- **AND** focus SHALL be managed predictably after the menu closes
