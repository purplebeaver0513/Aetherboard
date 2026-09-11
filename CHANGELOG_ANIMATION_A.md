# Version 10 / 1.0.1 — animation revision A

11 September 2026. Approved task: extend original 16-bit fantasy art and animation across Aetherboard Arena.

## Added and integrated

- 56 transparent sprite sheets, with six rows (idle, walk, attack, cast, hit, defeat), six frames per row and a 40×40 frame grid: 2,016 character frames. Pose changes extend the original editable character geometry: wings, feet, breathing, blinking, staffs and elemental motes. Some held poses intentionally repeat frames.
- 83 animated icons, including every existing item, element, role and commander ability, plus menu, reward, weather and multiplayer symbols. Each has a static fallback. Existing emoji-based decorative UI is converted at the presentation layer; game data and ordinary text remain unchanged.
- 16 combat effect sheets: eight elemental families plus slash, impact, heal, shield, freeze, stun, defeat and reward. The runtime uses the relevant shared effects for attacks, casts, hits, statuses and commander areas. Defeat and reward sheets are also available in the gallery; character knockouts use their own dissolve poses and rewards use animated icons.
- Seven animated overlays for lava, currents, ice, brush and speed/ward/mana nodes. All six original arena palettes and map layouts are preserved.
- A new original title panorama with animated existing spirits, square fireflies, crest glints and button highlights. The old panorama remains bundled.
- Pixel-art treatments for menus, modals, drafts, shops, the Black Market, selected spirits, equipment, blessings, resource icons, battle status and results. No external fonts.
- An interactive art gallery at `/art-gallery.html`, an animated roster GIF, source authoring tools, manifest and validation evidence.

## Integration and compatibility

Combat frames are selected from the existing elapsed battle clock. A separate presentation cache interpolates movement and tracks defeat poses without modifying unit snapshots. The unit's click target, team ring and bars move together. This does not change collision, damage, action timing or round timing. A final knockout can be cut short by the existing round transition.

Static art remains visible until its animation sheet loads. Failed sheets retain the original still. Custom character images retain priority and the original fallback chain. Reduced-motion mode freezes sprite frames and disables added ambient effects and movement interpolation.

All 141 original PNG assets are preserved byte for byte. Server, shared rules, save keys/schema, networking, reconnect behavior, launchers, dependencies and hosting configuration remain unchanged. A preservation test checks 261 unchanged client functions. Package version remains **1.0.1**, edition **10**; revision A identifies this visual increment.

## Checks performed

- All seven `npm test` suites passed, including shared rules, real WebSocket server scenarios, commander handling, client save/flow compatibility, HTTP contracts, original art preservation and animation regressions.
- Every original and new runtime PNG was delivered by the unchanged server with byte comparisons.
- New atlas dimensions, IDs, fallbacks, clock progression, reduced motion, input markup and simulation immutability passed.
- Every character/state has at least two distinct frames; normal poses stay inside their padded frame. Representative sheets and the full roster contact sheet were visually inspected.
- Both HTML files' inline scripts passed Node syntax checking; duplicate IDs were checked.

The browser denied localhost and local-file navigation. No alternative browser route was used. Desktop/mobile visual layout, live in-browser controls, animation playback and performance remain unverified in this session. Older browser reports in `docs/v10/` are historical, and the legacy browser scripts were not run for this revision.

## Rebuild art

Players use the checked-in assets. For artists: install Pillow, then run `python tools/build_animated_art.py` from the project folder. Node is used to read the real catalog. The script rebuilds the original V10 geometry and animation sheets; it leaves the separate generated panorama intact. Its authoring process does not consume gameplay RNG. See `docs/art-animation/title-art-provenance.json` for the built-in image generation prompt.

## Manual acceptance pass still needed

1. At desktop and phone widths, check title/menu scrolling, frame edges, button labels, board fit, and gallery controls.
2. Complete the three-pick draft; inspect, buy, equip, move, sell, reroll and awaken spirits.
3. Watch movement, attacks, casts, damage and knockouts. Cast Freeze, area attack, Shield and Focus; verify sprites and target buttons stay aligned.
4. Check each arena, terrain labels, rewards, Black Market and game-over screens.
5. Test reduced motion, a missing animation URL, and a custom character image.
6. Complete a local duel and a two-device online match including reconnects.
