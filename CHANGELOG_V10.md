# Version 10 — release 1.0.1

## Baseline and scope

Based on the supplied `aetherboard_v9_0_1_compatibility.zip`, not reconstructed from chat descriptions. Its tests were run before editing. Only presentation and related layout/asset integration changed; this is not a rebuild. The requested human-facing release is 1.0.1 / Version 10. Save/protocol/rules schema remains V9.

## Stages completed

1. Freeze baseline and rerun the five baseline npm suites (shared rules, server, commander, client compatibility, HTTP).
2. Add original raster assets and deterministic development-only authoring script.
3. Integrate art through the existing `unitVisualHtml` path, preserving `CUSTOM_ASSETS` priority and symbol fallback. Add isolated icon helpers and map-key-to-art binding.
4. Apply an external visual skin; preserve existing IDs, inputs, modes and hotkeys. Fix the already-reproduced narrow viewport overflow and check command buttons inside the arena.
5. Add asset, fallback, protected-file, static-delivery and actual DOM checks. Rerun existing gameplay and real WebSocket scenarios with the new art loaded.
6. Package and re-test from a fresh extracted archive.

## Added

- 56 unique RGBA 32×32 sprites for all existing spirits.
- 49 20×20 icons including all 22 items; 27 32×32 terrain textures; 6 scenery strips; title panorama, title bitmap and crest. 141 runtime PNGs in total.
- `public/pixel-art.js`, `public/pixel-theme.css`, `public/assets/pixel/manifest.json`.
- `tools/build_pixel_art.py`: optional rebuild source. No font files, ROM sprites or external game assets are included.
- Art and viewport regression tests plus HTTP coverage for every PNG.

## Adjusted presentation

The existing client now displays bundled images instead of default spirit emoji. Item icons and primary role/element/commander icons use the same style. Some secondary UI symbols and text remain native glyphs intentionally; no claim is made that every character is a sprite.

The board retains visible ally/enemy rings, YOU/ENEMY markers, health/mana/shield bars, target markers, hazardous tiles and written terrain-effect labels. The six map keys select six palettes without consuming gameplay RNG or generating a different map. Scenery outside the frame has no collision or gameplay meaning.

Narrow-screen layout constrains the board and command row to the actual viewport. Phone panels flow vertically; desktop panels retain their existing order. Semantic `hidden` controls are not accidentally exposed by button display styles.

A verified stale Hardcore checkbox description referring to old deck setup was corrected to reflect the already-implemented automatic bans and no-deck rules. The rules themselves did not change.

## Intentionally untouched

`server.js`, `public/rules.js`, `render.yaml`, `Dockerfile`, the Windows/shell launchers, `.gitignore` and `.dockerignore` are byte-identical to the baseline. Existing data IDs, prices, ability logic, damage rules, deterministic terrain, multiplayer messages, charge accounting, online tokens and storage keys remain unchanged. No database, accounts, rating system, new game modes, soundtrack changes or save migration was introduced.

## Remaining work

Existing client-authority and in-memory-server limitations remain. The next development stage should still be a separately scoped bug fix or approved feature, with these preservation tests retained. Custom local edits not supplied with the baseline must be merged rather than overwritten.
