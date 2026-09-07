# Version 9 — Validation record

This records functional validation of the delivered prototype. It is not a claim of production deployment, complete anti-cheat, or competitive balance.

## Automated Node checks — passed

- Client inline JavaScript, shared `public/rules.js`, and server syntax.
- Exactly 56 valid spirits across eight elements, seven in each, with Healer and Buffer coverage.
- Earth/Wind absent from the accepted roster.
- Every element has a directed strength and weakness; same-type/untyped hits are neutral.
- 1,000 seeded arena chapters: connected walkable areas, mirrored terrain, six mirrored nodes, no overlapping terrain features, three-round stability, no consecutive theme repeats.
- Seeded two-unit random bans and full-roster eligibility after removing those bans.
- Real WebSocket public Standard and Hardcore queues, cancellation, private Hardcore room creation/join/ready/start.
- Server-authoritative bans, 40-heart Hardcore starts, submissions without Faction Deck data, Shield relay, permanent-death processing, Grave Idol, and roster-wipe elimination.
- Six consecutive server rounds with Freeze and AOE spending. Expected remaining charges: (4,2), (3,1), (2,0), (1,0), (0,0), (0,0).
- Per-round duplicate rejection, cooldowns, invalid targets, idempotent repeated network messages, server-locked AOE choice, independent player budgets, and rejection of forged charge refills.
- Socket replacement / session reclaim with spent room budgets and immutable initial battle snapshots plus an action log.

Run these again with `npm test` (Node.js 22+). Output is retained in `docs/automated-tests.txt`.

## Browser validation — passed

The test loaded the actual client and shared-rule source into Chromium documents, with an isolated in-memory storage adapter for each simulated device. This environment restricts navigation, so this was not a public HTTP deployment test. The online browser clients connected by real WebSockets to the included Node server. The optional Python/Playwright harness is included under `tests/browser-validation.py`; it expects Chromium and a local test server on port 8099. It is separate from `npm test`.

- Area-attack selection followed by the three-pick free starter draft.
- Hardcore automatic bans without manual ban or deck-builder controls.
- Arena chapter announcement appears centrally and then dismisses into the arena chip.
- Same terrain on rounds 1–3 and a changed theme at round 4.
- Six local combat setups: lifetime and round limits, Freeze and AOE in the same fight, Shield, Focus retargeting, and zero-charge persistence through save normalization.
- All eight new unit ability cases execute and consume mana.
- A Fire hit against a zero-armour Nature target deals 125 damage from a 100 base hit; a neutral hit deals 100.
- Two independent browser clients automatically match into a Hardcore online duel, choose different area attacks, draft privately, receive equal map/seed/ban data, and lock their teams.
- Freeze travels through the actual server relay to both browsers. The casting player has four remaining while the opponent still has five.
- Each browser casts its own selected AOE; both remaining counts become two. Canonical side A/B is handled correctly.
- No uncaught browser JavaScript errors in the completed run.

`docs/browser-validation.json` contains the observed browser assertions and geometry.

## Layout checks — passed

- Desktop 1366×768, 1440×900, and 1920×1080: no page-height overflow, no horizontal overflow, and no overlap between right-hand panels.
- Mobile 390×844: no horizontal page overflow and no overlapping right-hand panels. The mobile page intentionally scrolls vertically.
- Screenshots of the loadout, terrain announcement, desktop board, mobile board, and synchronized online battle are in `docs/screenshots/`.

## Package checks

The ZIP was extracted into a clean directory and `npm test` passed there. Its central-directory integrity check passed, and the shared rules file was served with HTTP 200 and the JavaScript content type. HTML and shared rules use `Cache-Control: no-store` to avoid mismatched cached game versions.

## Boundaries

No external players, internet latency/stress tests, third-party deployment, or long-term balance study was performed. These tests verify implemented behavior, not the strength of every possible team composition. Hosting and active rooms still depend on your running server; server restarts clear in-memory multiplayer state.
