# Changelog

## [1.6.0] - 2026-05-03

### Added
- Auto-located users get periodic GPS refresh (on mount + every 30 min)
- Subtle location label above the reset button — "Prague" or coords if unknown
- Offline reverse geocoding via static city lookup (no external APIs, ~150 km radius)
- `auto_location` settings flag distinguishes browser geolocation from manual pick

### Changed
- LOCATIONS catalogue extracted to `src/modules/locations.js` for reuse

### Removed
- Unused `onboarding.my_location` translation key across all locales

## [1.5.0] - 2026-05-03

### Added
- i18n with 11 languages — auto-detects browser locale, persists choice (943e743)
- Floating language selector globe in top-right corner (943e743)
- Now / solar noon pills under the heading to switch the selected time
- Time defaults to the current local clock on load (was solar noon)

### Changed
- Time input replaced with plain text field + HH:MM validation (41d5903)
- Time input width tightened to 5ch (a1fe7a8)

## [1.4.0] - 2026-03-09

### Added
- Editable time input in solar noon heading — explore vitamin D/burn at any time of day
- Yellow dashed reference line on chart tracks selected time
- `--solar` CSS color variable for time indicator

### Changed
- Solar noon heading underline removed in favor of inline time input styling
- Solar computation split into separate memos for data, noon time, and selected data

## [1.3.0] - 2026-03-09

### Added
- Burn-to-vitamin-D ratio in solar noon subtitle

### Fixed
- IU input field snapping to 100 on every keystroke, preventing retyping

### Changed
- Solar noon heading shows minutes + time instead of just time
- Subtitle styling matches settings text (color, line-height)
- Chart moved below settings text in layout order
- Heading font weight lightened to 500
- "Assuming" → "This assumes" in settings sentence

## [1.2.0] - 2026-03-06

### Added
- Clickable skin type label in dashboard opens selection modal
- Skin type modal with Fitzpatrick descriptions and selectable types

### Changed
- Remove skin type selection from onboarding (defaults to type 2)

### Removed
- SkinTypeDropdown atom (replaced by clickable label + modal)

## [1.1.0] - 2026-03-06

### Added
- Skin type dropdown with labels in dashboard settings sentence
- Info tooltip icons on onboarding skin type cards with Fitzpatrick descriptions

### Fixed
- Dashboard inline settings lost on navigation/refresh before 3s debounce fired

## [1.0.0] - 2026-03-06

### Added
- Onboarding flow with browser geolocation and manual city/coordinate picker
- Dashboard with Recharts line chart: vitamin D minutes + sunburn threshold
- Inline editable settings sentence with 3s debounce persistence
- Fitzpatrick skin type I–VI selector with color swatches
- localStorage persistence — skip onboarding on return visits
- PWA support with auto-update service worker
- Vitamin D and erythema calculations from McKenzie/NIWA model

### Changed
- Complete rewrite from scratch per SPECIFICATION.md
- Replaced old multi-card layout with single chart-focused dashboard
- Switched to styled-components, lucide-react, recharts, mentie
