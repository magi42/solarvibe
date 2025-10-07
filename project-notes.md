# Project Notes

## Current State
- Three.js-based Solar System simulation with textured planets, major moons, and an orbit-aware HUD.
- Multilingual UI (FI default, EN/SV/DE/EL) with language picker aligned to the main title.
- Time controls include ±H/D/W/M/Y buttons, NOW reset, play/pause toggles, and an exponential speed ladder from 1× to 10^11×.
- Planet textures and key moon textures are cached under `data/textures`; Jupiter and Saturn moon textures were recreated locally when remote sources failed.
- Saturn’s rings render as a semi-transparent band (35% opacity, darker tone) scaled to remain visible even without a texture file.
- Camera interactions: left-drag rotate, scroll zoom, right-drag pan, double-click lock; empty click clears selection but preserves follow state.

## Recent Fixes & Adjustments
- Replaced the HUD instructions with author credit (“Marko Grönroos, 2025”) and updated locale strings to describe right-button panning.
- Regenerated Jupiter’s moon textures procedurally and enforced realistic relative radii while scaling orbital spacing to requested multiples.
- Sourced Galilean orbital elements directly from JPL Horizons vectors to correct along-track positioning.
- Updated Saturnian moon elements from Horizons and introduced an orientation correction so their orbital planes align with Saturn’s ring tilt.
- Readme created with screenshot reference and hosted demo link at http://turunursa.fi/magi/solarsystem/.

## Known Considerations
- Orbit corrections map Saturn’s moons onto the ring plane; verify that texture alignment continues to match future ring adjustments.
- Localization covers major HUD strings; ensure any new controls are added to `LOCALES`.
- Speed slider uses discrete exponential steps defined in `SPEED_STEPS`; modifying extremes requires updating related labels/tooling.
- Textures are expected to be available offline; any new assets should be stored in `data/textures` and referenced in `TEXTURE_MAP`.

## Useful References
- Main logic: `main.js` (locale data, body definitions, rendering loop, orbit math).
- Localized strings: `strings.js` (LOCALES, DESCRIPTIONS, and language metadata).
- Styles: `styles.css` (HUD layout, button sizing, typography).
- Static assets: `docs/img/` for documentation imagery, `data/textures/` for rendering.
