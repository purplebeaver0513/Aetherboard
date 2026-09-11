# Testing — 1.0.1 / Version 10

## Baseline

The attached v9.0.1 compatibility archive was extracted into a separate working directory. Its five existing Node suites passed before editing; output is retained in `docs/v10/evidence/baseline-tests.txt`. Baseline files were not regenerated from chat descriptions.

## Automated Node checks

`npm test` now runs six suites:

- Shared rules: 56 spirits, 8 types, 1,000 seeded connected/mirrored three-round arenas, bans, affinities and zero-safe commander charges.
- Server: public Standard/Hardcore matchmaking and private lobby protocol scenarios.
- Commander server: six rounds, per-round/per-match caps, duplicate action protection, independent players, loadout lock, reconnect replay.
- Client compatibility: **27 named tests**, retaining the original draft/shop/reward/seat-recovery and save-fixture cases.
- HTTP contract: **13 named tests**, including the original endpoints and WebSocket greeting, new CSS/JS, and byte-for-byte HTTP delivery for all **141 PNGs**.
- Pixel art: **11 named tests** covering all IDs, unique sprite content, dimensions, icons, six theme sets, protected file hashes, V9 storage schema, custom-override priority, escaping, no-art fallback, error fallback and static references.

Outputs are in `docs/v10/evidence/`. Existing server/shared-rules/deployment/launcher hashes are checked against the v9.0.1 fixture. They are unchanged.

## Browser checks

`tests/browser-pixel-test.py` loads the actual shipped client, styles and image bytes. It passed:

- Title and battlefield boundaries at **1920×1080, 1440×900, 1366×768, 1280×720, 1024×768, 768×1024, 390×844, 360×740 and 844×390**.
- No document horizontal overflow; board inside arena; battle and all four commander controls within bounds; nonoverlapping inspector cards.
- Correct hiding of Continue/Cancel when not available.
- Six existing map keys selecting their art skins.
- Three-pick draft with bundled images, 56 images decoded at 32px native size, an actual item equip, Focus and Freeze via a clicked sprite image, and reduced-motion styling.
- No uncaught browser JavaScript errors in these scenarios.

The retained gameplay browser suite also passed with the new artwork actually loaded: automatic Hardcore bans, six-round charge limits, eight V9 abilities, elemental damage, independent browser clients with matching arena/bans, Freeze relay and both clients' area attacks.

The prior recovery browser suite passed **11/11** scenarios. Three additional actual two-client WebSocket reconnects preserved the same seat, peer-connected status, and pending Black Market/Blessing/item decisions. Reward entitlements in that reconnect test are deliberately seeded fixtures, not claimed as earned in a full match.

For optional browser testing, install Python Playwright/Chromium in a development environment. `browser-validation.py` expects a local test server on port 8099; the online-recovery harness starts its own isolated server.

## What was found and corrected during visual integration

Initial inspection reproduced the known mobile intrinsic-width issue. Width constraints were added without changing board dimensions or controls. A mobile flex-wrap interaction that put commander controls in a second offscreen column was caught by direct bounding-box checks and corrected. Legacy `!important` terrain shorthand initially caused repeated pillar textures; final selectors explicitly retain one stretched tile per cell. The bitmap logo's initial canvas clipped the last letter; the asset canvas was widened. Semantic `hidden` elements are explicitly hidden even when button styles define flex display.

These intermediate renders were diagnostic, not declared as successful results. Final evidence is from the corrected build.

## Important boundaries

Managed Chromium in this environment rejects local HTTP page navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. That policy was not changed. Browser tests therefore embed the shipped source/resources into a document and use an explicit in-memory localStorage model. Node HTTP tests independently verify actual file delivery; browser WebSocket tests use real local server connections. The inlining helper does not replace the gameplay engine.

These results are **not** a certification of native browser disk durability, live Cloudflare/Render availability, mobile hardware performance, large-scale load, or commercial balance. No user's live server, repository credentials, private save or unuploaded custom art was accessed. Existing client-authoritative combat and in-memory-room limitations remain.

Final archive rehearsal: see `docs/v10/evidence/clean-zip-tests.txt`, `clean-startup-health.json`, and `release-file-comparison.json`.

## Archive rehearsal retry

The first combined final-packaging command hit its execution timeout while the clean-copy run was in the existing commander suite; its partial output is retained as `clean-zip-first-attempt-timeout.txt`. No cause was established and no game or test source was altered to make a pass. A separate complete `npm test` run from the same extracted archive then passed in 20 seconds. The independent `npm start` rehearsal returned successful health, HTML, stylesheet, asset script and PNG responses. This does not establish production uptime.
