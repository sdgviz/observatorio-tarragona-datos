# Header ODS menu

## ADDED Requirements

### Requirement: Header exposes a styled ODS goal menu
The application header SHALL include a control labeled for ODS navigation that opens a popover or dropdown listing all 17 Sustainable Development Goals. Each list row SHALL use the official background color for that goal and SHALL display the goal number and localized title. The trigger button SHALL show a chevron or equivalent affordance indicating a menu.

#### Scenario: User opens the ODS menu
- **WHEN** the user activates the ODS navigation control in the header
- **THEN** a layered menu SHALL open showing 17 selectable rows
- **AND** each row SHALL use the official ODS color for that goal as its background
- **AND** each row SHALL show the goal number and the goal title in the active locale

#### Scenario: User selects a goal navigates to its page
- **WHEN** the user selects goal 8 from the menu
- **THEN** the application SHALL navigate to `/ods/8`
- **AND** the menu SHALL close

### Requirement: Trigger reflects the active ODS goal page
When the current route matches an ODS goal detail page (`/ods/{n}` where n is 1–17), the ODS navigation trigger SHALL use that goal’s official color as its background (or an equivalent prominent treatment per design) and SHALL display the goal number and title consistent with the design reference.

#### Scenario: On ODS 3 page
- **WHEN** the user is viewing `/ods/3`
- **THEN** the ODS navigation trigger SHALL reflect ODS 3 branding (official color and label for goal 3)
- **AND** the rest of the header MAY remain neutral per existing layout

### Requirement: ODS menu data source and accessibility
Goal numbers, titles, and colors SHALL come from the same configuration source used elsewhere for ODS (e.g. shared `ods_list` / theme tokens), not hardcoded one-off hex values in the header only. The control SHALL be keyboard operable (open, navigate list, activate, close) and SHALL expose an appropriate name for assistive technologies.

#### Scenario: Keyboard user selects a goal
- **WHEN** the ODS menu is open and the user moves focus through the list with arrow keys and confirms with Enter
- **THEN** the focused goal SHALL be activated and navigation SHALL occur
- **AND** focus SHALL be managed in a predictable way after the menu closes
