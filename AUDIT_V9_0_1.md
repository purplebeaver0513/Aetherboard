# Aetherboard Arena — Inventory, Risk Review, and Incremental Upgrade Record

Date: 7 September 2026. Baseline: attached Version 9 Shifting Arenas archive, package **9.0.0**. Result: **9.0.1 compatibility patch**, not a new game.

## Source of truth and scope

The actual attached archive was extracted into a separate baseline and working directory. Its SHA-256 is `4e008b2fca046638c2ea1e7b3cf2d44750a9789f842f902efafb21eda78962ac` and it contains 29 files. The original archive and extracted baseline were not edited. Its README, V7/V8/V9 changelogs, V9 testing record, shared rules, client, and server were inspected alongside the approved V9 changes in the conversation. The earlier read-only baseline audit was reviewed, then its tests were rerun rather than treating earlier claims as new evidence.

This is an audit of the attached source. It is not an audit of unuploaded local modifications, a live GitHub repository, a deployed service, a user's browser save, or their Cloudflare account. Synthetic fixtures contain no user credentials. No Season Shift story, geography, Godot scene, or different auto-chess proposal was imported into Aetherboard.

## 1. Current architecture

| Area | Existing architecture and responsibilities | Preservation decision |
|---|---|---|
| Browser client | `public/index.html`: HTML/CSS and a large inline JavaScript module implementing menus, shops, drafts, formations, battle simulation, UI, audio, saves, and online callbacks. | Keep the current entrypoint and module structure. Four localized function edits only. |
| Shared game rules | `public/rules.js`: `AetherRules`, 56 spirits, eight elements, elemental matchups, seeded mirrored terrain, bans, commander normalization. Shared by browser and server. | Byte-for-byte unchanged. Do not reseed maps or alter damage arithmetic. |
| Backend | `server.js`: Node ES modules, built-in HTTP and custom WebSocket transport; lobbies, FIFO matching, ready/lock states, pairings, heart loss, command budgets and recovery. | Byte-for-byte unchanged; no new message types or endpoints. |
| Combat authority | A designated participating client simulates and reports each fight; server checks selected fields, ownership and limits. | Retained. A server-authoritative simulator is a separate design/migration project. |
| Browser persistence | Offline version-9 JSON, a version-1 profile key, V9 online session and private snapshot keys; online snapshot envelope version 2. | Keys, identifiers, fields and versions retained. Repairs concern when existing data is saved or acknowledged. |
| Server persistence | Rooms, queues, participants and action logs live in process memory. Browser snapshots cover private planning recovery while the server remains alive. | Retained limitation; no database introduced. |
| Maps and visuals | An 8×6 grid; six arena themes generated into mirrored three-round chapters; weather, obstacles, buff/hazard labels, announcements, blue/red unit identity and compact panels. | Rule data, CSS and HTML structure unchanged. This web project has no separate engine scene files. |
| Art/audio | Emoji placeholders and centralized `CUSTOM_ASSETS.unitImages` / `musicUrl`; procedural music and sound controls; `public/assets/.gitkeep`. | Existing hooks and paths unchanged. Final custom art/music are not present in this package. |
| Deployment | `npm start` runs `node server.js`; Node >=22; default port 8080 with `PORT`/`HOST`; `/health`, `/socket`, static `public/`; Docker, Render YAML, Windows/shell launchers. | All launch/deployment files unchanged. Package scripts only gain tests; metadata advances to 9.0.1. |
| Tests | Three original Node suites and an optional Python/Playwright browser harness. No npm runtime dependencies. | Retain original suites, add preservation coverage, harden only the browser test's target-event helper. |

## 2. Feature status

“Implemented” means present in source, with coverage identified below. It does not mean every combat interaction is balanced or that all internet conditions were tested.

### Implemented and retained

- Solo 25-round Expedition, Endless, and Hardcore; pass-and-play Local Duel; public Standard/Hardcore 1v1 queues; private Standard/Hardcore Duels and Standard Parties.
- Shop/reroll/lock, gold/interest/XP, eight-spirit team cap, twelve-place bench, three-copy upgrades, awakenings, items and permanent team Blessings.
- Eight elements, 56 spirits, a Healer and Buffer per type, varied costs, escalating Type Bonds, meaningful strengths/resistances, and strongest-source/non-stacking stat bonuses.
- Six randomly generated arena themes with obstacles, hazards and nodes; one shared seeded chapter lasts three rounds; synchronized online environments and arrival announcements.
- Hardcore permanent casualties, random fixed spirit bans, no role ban or Faction Deck setup, graveyard, Grave Idol protection, roster-wipe defeat and optional health-priced Black Markets.
- Chosen area attack, Freeze, Aegis Shield and Focus; five Freeze and three area-attack charges per run, independent per-round usage and shared cooldown. Same-device active spells remain intentionally unavailable.
- Existing title/menu controls, ally/enemy styling, left Armory, smaller right Battle Log, procedural audio and future asset hooks.

### Partially implemented / prototype limitations

- Online networking is functional but not a fully server-authoritative combat/economy implementation. Existing validation is not complete anti-cheat.
- Recovery reclaims a player seat and browser-held planning state; server restarts still destroy active matches. Missed events across entire rounds, long outages and browser-storage loss need additional coverage.
- Save compatibility within V9 is maintained. V7/V8-to-V9 migration is not implemented, by the original V9 design; old entries are not erased.
- Mobile layout has responsive rules but is not fully usable at every narrow viewport. See the reproduced clipping issue below.
- Final artwork/music and competitive balance validation remain incomplete. These placeholders are intentional, not damaged assets.

### Planned or not implemented — not silently authorized here

Accounts, durable server-side match storage, permanent rankings, skill/region-based matching, bots, full server-side battle simulation and production anti-cheat remain future proposals. Hardcore Party and active commands in same-device Local Duel are intentionally unavailable under the current rules, not broken features. No narrative/story rewrite is part of this release.

### Reproduced defects and disposition

| Issue | Evidence against original 9.0.0 | 9.0.1 disposition |
|---|---|---|
| Accepted draft picks vanish after reload | First pick produced one live unit but the saved/reloaded state had zero and three picks remaining. Reproduced in Expedition, Endless, Hardcore and Local Duel. | Fixed in `chooseDraftSpirit`: save each incomplete offline/local draft step. Online snapshots keep their existing path. |
| Sold-out shop refills for free on reload | All five saved entries were null; `init()` generated new offers while keeping the same gold/lock state. | Fixed: initial fill is only for a genuinely new, non-loaded run. |
| Pending reward lost on planning reconnect | Displaying the modal decremented the entitlement; recovery replaced the modal, saved zero and offered nothing. Reproduced separately for items, Blessings and Black Markets. | Fixed in `processPendingRewards`: consume and save after a choice/pass completes; completion callbacks are guarded. |
| Socket reconnects but player does not reclaim seat | Real two-client run: reconnecting browser showed `connected: true`, remained on “Connection interrupted,” and the other player's roster still showed its seat disconnected. | Fixed in the new-socket open handler: send the existing `resume-room` message even with a cached room. No protocol change. |
| Narrow-phone clipping | At 390px width the board measured 468.27px inside a 374px arena, ending at x=485.27; the battle button extended to x=411.09. The header brand also compressed. Identical baseline/patched measurements were reproduced. | **Still open**, deliberately separated from this compatibility patch. Next proposed small stage is a width/overflow correction without changing the design. |
| Legacy browser test intermittently misses animated target | Two initial runs timed out before the synthetic Freeze was submitted. The instrumented run succeeded. Unit elements are rebuilt during combat. | Test-only helper now queries and dispatches in one browser task. The existing scenarios then passed. Production targeting was not altered. |

The earlier audit's passing tests did not establish these recovery guarantees. Adding targeted cases turned the four production issues into reproducible failures before each repair.

## 3. Tests and actual results

Environment used: Node v22.16.0, npm 10.9.2, installed Python/Playwright and Chromium. Full evidence is in `docs/patch-9.0.1/evidence/`; summarized commands and limits are in `TESTING_V9_0_1.md`.

| Layer | Observed result | Scope |
|---|---|---|
| Original three Node suites | PASS before and after patch | Shared rules / 1,000 generated arena chapters; public/private and Hardcore protocol flows; six rounds of spell-budget, duplicate-action and reconnect replay assertions. |
| New client preservation suite | Baseline: 8 pass, 19 fail; patched: 27 pass, 0 fail | Both players' drafts, sold-out/partial shops, pending rewards, V9 fixture/profile, zero charges, online envelope/keys, malformed storage and socket-resume behavior. Actual client functions run in a VM; presentation and storage are modeled. |
| New HTTP contract suite | 11 pass | Real service startup; game/rules delivery and cache headers; invite query; health; missing/private files; malformed/traversal paths; existing WebSocket greeting. |
| Client/server/shared-rule syntax | PASS | Node syntax checks on the server, rules and extracted inline client. |
| Chromium recovery scenarios | 11 pass | Shipped DOM/source, carried-over in-memory storage; visible draft continuation, empty shop, reward re-opening and actual item/Blessing/pass button settlement. |
| Two-client real reconnects | PASS | Three actual socket interruptions in a live Hardcore queue match, same seat/code recovered, peer confirms reconnected, all three seeded reward decisions preserved and settled. |
| Existing full browser scenarios | PASS after test-only atomic input fix | Local gameplay/weakness and commander assertions, desktop/mobile geometry checks, same online arena/bans, Freeze and both players' area-attack relays. |

**Important limits:** Managed Chromium refused local HTTP navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. That runner policy was not changed or bypassed. Browser checks load the actual source into a document and use an explicit storage shim; real HTTP delivery is tested separately and browser WebSockets connect to the actual local server. These results are not proof of native browser disk durability, live HTTPS/Cloudflare access, or real mobile hardware performance. Existing width checks saw a 390px document but missed content clipped inside it; visual inspection and direct element measurements found the remaining phone bug. Raw initial failures are retained, not presented as successful runs.

## 4. Compatibility and regression risks

### Save and recovery boundaries

Keep the existing V9 keys and schema, stable unit/item IDs, run seed, area-attack choice and zero-charge values. The synthetic baseline fixture preserves roster, positions, upgrades, equipment, shop lock, inventory, Blessings, graveyard/bans, economy, profile, audio preferences and arena chapter. This patch does not migrate removed Earth/Wind units from older versions or reconstruct data already lost.

Reward counters now correctly represent unclaimed entitlements until a decision. Their names, serialized representation, order, prices and effects do not change. Exact unselected reward offers are not newly serialized; this patch does not promise identical offers across every interruption. Arbitrarily replaying old result messages or recovering across a missed whole round is outside these focused fixes.

The new socket uses the same saved code/player/token and existing handshake. The server and budget validation are unchanged. A successful reconnection still requires a live server, retained credentials and an unexpired seat. Server restart, a genuinely expired room, or missing private data cannot be repaired by this client patch.

### Determinism, combat and design

`public/rules.js` is unchanged byte-for-byte. There are no changes to terrain PRNG consumption, map mirroring, weather, combat timing, unit costs, role bonuses, support potency, affinities or commander damage/limits. Legacy schema and protocol names are not repurposed. Broad client extraction/refactoring would have a much larger regression surface and is not included.

### Assets and deployment

`CUSTOM_ASSETS` and `ONLINE_CONFIG` are unchanged. Retain any user-added files/configuration when merging this patch into a customized working copy. Existing Docker/Render/manual Web Service settings, paths, port overrides and launchers are untouched. No hosting provider change or new server deployment is necessary to understand or apply this patch; an automatic redeploy can nevertheless restart the live process and clear its rooms.

### Test limitations

Functional tests are not a balance study. They do not cover all roster/item/terrain combinations, many concurrent players, hostile clients, long internet outages, actual phones or persistent-storage failures. The mobile clipping finding demonstrates why passing broad geometry checks alone is insufficient.

## 5. Upgrade sequence and gates

| Stage | Work and acceptance gate | Status |
|---|---|---|
| 0 | Freeze attached baseline; inventory source/history; run existing suites and record checksum. | Complete; originals retained. |
| 1 | Add preservation fixtures and failing cases without changing production behavior. | Complete; 19 baseline failures across the new suite documented. |
| 2 | Persist unfinished drafts; rerun draft cases. | Complete. |
| 3 | Preserve sold-out shops; rerun sold-out/partial/new-shop cases. | Complete. |
| 4 | Keep reward entitlement until choice/pass; rerun recovery/settlement/order cases. | Complete. |
| 5 | Reclaim seat on replacement socket; verify against unchanged server and peer state. | Complete. |
| 6 | Full Node suite, syntax, real HTTP, browser/real-socket checks, source comparison, clean-ZIP rehearsal and rollback notes. | Completed for this release; evidence accompanies the repository. |
| Next small patch | Reproduce phone viewport defects in an automated element-boundary test, then make narrowly scoped mobile width/wrap fixes. Preserve desktop layout, assets and interactions. | Proposed; no CSS redesign bundled here. |
| Following patch | Cover interrupted Local Duel handoffs, recovery across round boundaries, long/backgrounded tabs and retained reward/awakening flows. Repair only reproduced failures. | Proposed; no claims of completion. |
| Separate approval | Server-authoritative combat, databases, accounts, ranking, protocol-version migration or redesigned modes. | Not implemented; requires its own compatibility and rollout plan. |

## Release boundary

Only four runtime client functions changed. The original server, shared rules, visual markup/styles, assets and deployment files are retained. Package metadata/test scripts and test/documentation files account for the other changes. Consult `docs/patch-9.0.1/evidence/change-manifest.json` for hashes and the complete file comparison. `CLIENT_FIXES_V9_0_1.patch` is an optional client-only diff; the ZIP is the complete repository.
