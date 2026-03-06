# Changelog

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
