# Changelog

## [0.4.0] - 2026-03-04

### Added
- Responsive 2-column card grid on wider viewports (≥720px)
- World map card spans full width in 2-col mode
- Week-of-year date slider on world map to explore seasonal changes
- "Today" reset button when slider is off current week

### Changed
- Sun gauge shows horizontal chord lines for 45° vit D threshold and today's peak elevation

## [0.3.0] - 2026-03-04

### Added
- World vitamin D heatmap showing synthesis zones by latitude band
- Simplified continent outlines on equirectangular SVG projection
- Green/amber/red latitude band coloring for vitd/marginal/low zones
- 45° threshold dashed lines and latitude range callout
- User location marker on world map

## [0.2.0] - 2026-03-04

### Added
- Animated SVG sun elevation gauge in Today's Window card
- Live sun angle updates every 60s via `get_current_elevation`
- 45° vitamin D threshold visualization with green zone
- Sun rays appear when elevation exceeds 45°
