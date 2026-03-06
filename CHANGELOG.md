# Changelog

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
