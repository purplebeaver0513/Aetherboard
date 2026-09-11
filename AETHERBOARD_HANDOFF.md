# Aetherboard Arena — current development handoff

Updated 11 September 2026. Creative lead: the user.

## Current deliverable

**Version 10 / 1.0.1, animation revision A** is the current source in `aetherboard_v10_1_0_1_animated.zip`. The approved full-game 16-bit art/animation task is implemented. Use `START_HERE_ANIMATED.md` for launch instructions and `CHANGELOG_ANIMATION_A.md` for the exact scope.

This increment was made from the recovered complete `Sono/aetherboard_v10_1_0_1_work_baseline.zip`. That original archive is preserved. The current search found no later source archive before this update. No personal local edits, live deployment or user save was supplied.

- 56 animated spirits, 83 animated icons (including all 22 items), 16 effect sheets, seven terrain overlays, title panorama and animated menus/UI. The original 141 PNGs are retained unchanged.
- Gameplay and shared rules, V9 saves, multiplayer/reconnect protocol, custom asset priority, dependencies and hosting/launch configuration are preserved. 261 original client functions have explicit preservation checks.
- `npm start` uses Node 22+ and serves `http://localhost:8080`. `http://localhost:8080/art-gallery.html` is the included review gallery. No build/install step is required for runtime assets.
- All seven Node test suites pass. HTTP tests compare the bytes of every new asset. Atlas, state immutability, timing, reduced motion, fallback and markup tests pass. Evidence: `docs/art-animation/tests-final.txt`, `frame-validation.json`, `source-comparison.json` and `syntax-and-markup.json`.
- **Browser acceptance remains pending:** the browser security policy denied this session's localhost/local-file navigation. No browser screenshots or live visual QA are claimed. Existing browser evidence below predates this increment. Legacy optional browser scripts have not been validated with the animation layer.

## Next step and boundaries

The next concrete step is the manual visual/playability matrix in `CHANGELOG_ANIMATION_A.md`, especially mobile fit, moving target hit areas, and two-device play/reconnect. Fix only reproduced problems. The prior proposed Local Duel recovery milestone remains unapproved; do not infer new game design work from that proposal.

Keep this project separate from Season Shift and Veyrune. Retain the user's original SNES-inspired fantasy direction. Assets are original Aetherboard geometry plus one built-in generated title panorama; no Nintendo sprites, logos or characters are bundled. Animation effects reuse elemental/role families, and ordinary text remains readable system typography.

The following is the preserved **8 September baseline inspection**, retained as history. Its implementation statements should be read with the update above.

---

# Aetherboard Arena — development handoff

Inspection date: 8 September 2026. Creative lead: the user. Current game release: **1.0.1 / Version 10**. This handoff establishes the Work baseline; it does not introduce a gameplay release.

## Baseline and provenance

Use the complete `Sono/aetherboard_v10_1_0_1.zip` as the recoverable baseline. It has **269 files**, passes ZIP CRC validation, and contains the client, server, shared rules, launchers, hosting files, tests, artwork and historical evidence. SHA-256:

`8a5fb84960d597718db1472fab0dc36bd3185853ec0382883d02903db5d8b33d`

The full Sono inventory and a title search across the available files found no newer Aetherboard archive. The separate `UPGRADE_1_0_1.md` and `TESTING_1_0_1.md` exactly match the copies inside this ZIP. No Git repository history, remote URL, newer unuploaded PC changes, live deployment configuration, or personal save was available for inspection. Additional changes on the user's computer or host remain unverified.

| Candidate | Classification and decision |
|---|---|
| `aetherboard_v10_1_0_1.zip` | Selected complete project; package and lockfile both 1.0.1; Version 10 art already integrated. |
| `aetherboard_v9_0_1_compatibility.zip` | Complete 72-file predecessor, inspected for comparison. SHA-256 `95304aa48fe2b91a13ac05f2d0859c3b96097a76dc13a7877f20a603f66081e3`. |
| `aetherboard_auto_chess_v9_arena.zip` | Complete 29-file original V9 project, package 9.0.0. SHA-256 `4e008b2fca046638c2ea1e7b3cf2d44750a9789f842f902efafb21eda78962ac`. |
| `CLIENT_FIXES_V9_0_1.patch` | Client-only patch for V9; not a runnable project. Its fixes are already included. |
| `V10_CLIENT_ART.patch` inside the selected ZIP | Client integration diff; also requires the bundled art files. Already applied in the full Version 10 source. |
| Loose Sono README, server and package files | Mixed older exports; do not assemble a baseline from them. The loose README still describes V9, and the loose server predates the selected archive. |

Version labels are intentionally non-monotonic: **9.0.1 → 1.0.1** implements the user's requested release numbering. Do not choose an older archive merely because its semantic version sorts higher.

Comparison with v9.0.1: **63 files unchanged, 9 changed, 197 added, none removed**. The changed files are the client entrypoint, package metadata, README/upload guide, and four test scripts. Server, shared rules, launchers, Docker/Render configuration and ignore files are byte-identical. See `docs/work-2026-09-08/source-comparison.json` and `baseline-sha256.json`.

## Architecture, dependencies and launch

| Component | Actual implementation |
|---|---|
| Client | Plain HTML/CSS/JavaScript in `public/index.html`; a large inline script owns drafts, shop/economy, formations, battle simulation, UI, audio, saves and online handling. No Godot or framework build. |
| Shared rules | `public/rules.js` exposes `AetherRules` in the browser and is imported by the server. Owns roster, weaknesses, seeded arenas/bans and commander normalization. |
| Art | `public/pixel-art.js`, `public/pixel-theme.css`, `public/assets/pixel/manifest.json`, and 141 ready-to-use PNGs. Optional authoring source: `tools/build_pixel_art.py`. |
| Server | `server.js`, Node ES modules, built-in HTTP and a custom WebSocket transport. In-memory rooms/queues, matchmaking, seats, formations, commands and battle-result handling. |
| Combat authority | A designated participating client calculates combat. Server ownership/formation/command checks do not constitute full server-authoritative combat or economy. |
| Dependencies | Node **>=22**; zero third-party npm runtime dependencies. No asset compilation needed to play. Optional art rebuild needs Python, Pillow and Node. Optional browser harnesses need Python Playwright and Chromium. |
| Repository state | Archive source, without a supplied `.git` history, AGENTS.md, or `.openai/hosting.json`. No host migration is required for this handoff. |

Extract the **entire** source ZIP into a separate folder. From the folder containing `package.json` and `server.js`:

```sh
npm test
npm start
```

Open `http://localhost:8080`; keep the terminal running. `npm run dev` starts `node --watch server.js`. Windows: `START_AETHERBOARD.bat`. Shell: `sh start-aetherboard.sh`. There is no separate compile/build command: `public/` plus the Node server is the runnable project.

| Existing deployment contract | Value retained |
|---|---|
| Binding | `HOST` defaults to `0.0.0.0`; `PORT` defaults to `8080`. |
| Routes | `/health` JSON, `/socket` WebSocket, static files under `public/`. |
| Manual Node host | Build `npm install --omit=dev`; start `npm start`; health `/health`. |
| Dockerfile | `node:22-alpine`, port 8080, `npm start`. Container build not rerun here. |
| render.yaml | Existing service `aetherboard-v9-online`, Node runtime, Ohio/free setting, auto-deploy enabled. This is the checked-in configuration, not a verification of current provider availability. |
| Existing Cloudflare tunnel | Forward to `http://localhost:8080`; original command `.\cloudflared.exe tunnel --url http://localhost:8080`. Executable/credentials remain external. No tunnel was accessed or changed. |

## System inventory

“Implemented” describes source presence and the stated checks, not exhaustive playtesting.

| Status | Systems and evidence |
|---|---|
| Implemented | Solo 25-round Expedition, Endless, Hardcore; same-device Standard/Hardcore Local Duel; separate Standard/Hardcore public queues; private Duel and Standard 2–4 player Party. Node protocol tests pass; all modes have not been manually played through here. |
| Implemented | 56 spirits; Fire, Water, Nature, Electric, Ice, Shadow, Light, Arcane. Seven roles: Vanguard, Ranger, Mystic, Striker, Assassin, Healer, Buffer. Three-pick refreshed starter draft, shops/rerolls/lock, gold/XP, eight deployed units and twelve bench slots. |
| Implemented | 8-column × 6-row board; six seeded, mirrored arena themes in three-round chapters; obstacles, hazards, nodes and weather. Shared-rule tests cover 1,000 generated arenas. |
| Implemented | Type bonds/weaknesses, mana abilities, merging, two awakening choices (`force`, `guard`), 22 items, 10 Blessings, strongest-bonus rules, Hardcore casualties/two automatic bans/Grave Idol/Black Market pass. These are the current rules; a separate concept's nine classes or three-choice talent design is not approved for import. |
| Implemented | Freeze: five uses per match; selected area attack: three. One of each per round, shared 3.5-second command cooldown; existing Shield/Focus behavior. Six-round real-socket tests verify limits, duplicates, independent budgets and reconnect replay. |
| Implemented | V9 save/profile/session handling; v9.0.1 draft, sold-out shop, pending reward and replacement-socket fixes. Current client suite passes 27 cases. |
| Implemented | Original SNES-era fantasy art: 56 unit sprites, 49 icons, 27 textures, nine UI/scenery assets. Bundled art/custom override/fallback/HTTP tests pass. Prior Version 10 mobile width/wrap fixes are present. |
| Partial / prototype-limited | Competitive online trust: client-calculated battles; in-memory rooms; reconnect requires a live retained room/seat plus browser credentials/private state. Server defines a two-minute disconnect grace, 30-minute room idle timeout and 90-second battle-report timeout. |
| Partial / prototype-limited | V9 save compatibility is supported; V7/V8 entries are left untouched and not migrated. Custom art/music hooks exist; unuploaded user overrides are unknown. Procedural music remains the existing soundtrack. |
| Planned / not approved to implement | Earlier documents propose further recovery coverage, accounts, ratings, durable rooms and server-authoritative simulation. No clearly approved post-Version-10 creative milestone was located. |
| Intentionally unavailable | Hardcore Party and active commander spells in same-device Local Duel; these are not classified as bugs. |
| Broken / known issues | No game failure reproduced in completed checks. The Windows launcher's console banner still says Version 9, although package and game title identify 1.0.1 / Version 10; retained with the existing launcher. |
| Unverified | Current visual/mobile behavior, native browser storage durability, complete Local Duel handoff/reward/awakening reload flows, long/backgrounded connections, Party edge cases, live Cloudflare/Render access, load/anti-cheat and competitive balance. |

## Checks actually performed in this Work inspection

Environment: Node **v24.19.0**, npm **11.9.0**, Python **3.12.13**. The existing suite ran unchanged and exited **0**.

| Command/check | Observed result |
|---|---|
| `npm run test:rules` | PASS: roster, elements, 1,000 mirrored/connected three-round arenas, seeded bans, affinities and zero charges. |
| `npm run test:server` | PASS: existing public matchmaking/private lobby scenarios. |
| `npm run test:commands` | PASS: six rounds, independent budgets, idempotence, loadout lock and reconnect replay. |
| `npm run test:client` | **27 passed**, zero failed. VM harness uses modeled DOM/storage; not native browser persistence. |
| `npm run test:http` | **13 passed**, zero failed, including `/socket`, CSS/JS and every bundled PNG. |
| `npm run test:art` | **11 passed**, zero failed, including protected hashes, V9 schema and override/fallback paths. |
| `node --check` | PASS for server, rules, art script and extracted inline client script. |
| Fresh `npm start` rehearsal | PASS: `/health`, `/`, `/rules.js`, `/pixel-theme.css`, `/pixel-art.js` and a unit PNG all returned HTTP 200. Test process then stopped cleanly. |
| Browser interaction | **INCOMPLETE**: browser setup succeeded but navigation stalled and the tool call was interrupted. No current browser playtest or visual pass is claimed. |

The Python Playwright package was absent from the checked Python interpreter. The four existing Python browser harnesses were inspected but not rerun. Their bundled earlier reports/screenshots remain historical evidence. They use source-loaded documents and modeled localStorage; the earlier reported browser-navigation restriction is not a newly established cause of this session's stall.

After the interruption, a request to the no-longer-reachable initial server failed; `startup-http.json` retains that result. A separately controlled fresh startup succeeded, recorded in `startup-http-rehearsal.json`. Do not misclassify the stopped process as a reproduced game defect. npm's environment/update notices were nonfatal and no dependency update was performed.

New raw evidence is isolated under `docs/work-2026-09-08/`; historical evidence was not overwritten. All 269 original baseline files remain byte-identical.

For optional browser checks on a development machine that supports them, use a **disposable extracted copy**, because some harnesses write into historical evidence paths:

```sh
python tests/browser-pixel-test.py
python tests/browser-recovery-test.py --output docs/recovery-new.json
python tests/browser-online-recovery.py --output docs/online-recovery-new.json
```

`tests/browser-validation.py` additionally expects a running game server on port **8099**. POSIX example in a separate terminal: `PORT=8099 npm start`; then `python tests/browser-validation.py`. These commands are documented, not claimed as executed here.

## Preservation contract

Preserve the user's creative leadership and existing original 16-bit fantasy artwork. Never rebuild missing source from summaries. Version 10's art milestone is already implemented.

| Contract | Keep |
|---|---|
| Offline save | `aetherboard-auto-chess-v9-arena`, serialized version **9**. |
| Profile | `aetherboard-arena-profile-v1`. |
| Online session | `aetherboard-online-session-v9`. |
| Private planning state | `aetherboard-online-game-state-v9`, envelope version **2**. |
| Gameplay | Stable IDs, costs, balance, map seed/PRNG behavior, mirroring, chapter timing, commands and casualty rules. |
| Network | Existing endpoints, message types/fields, side mapping, tokens, reconnect/replay and authority rules. |
| Customization | Existing `CUSTOM_ASSETS.unitImages`, `CUSTOM_ASSETS.musicUrl`, `ONLINE_CONFIG.serverUrl`, user files and fallback priority. |
| Hosting | Existing launch commands, ports, Docker/Render files and tunnel destination. |

Use the same browser profile and exact origin to continue a V9 save. A changed temporary tunnel address uses separate browser storage. Do not clear site data. Compare any user's deployed/local edits before replacing files. Restarting the server clears rooms, so release between matches. Broad client extraction, protocol changes, new save namespaces and gameplay RNG changes have a large regression surface.

## Next increment — proposal for the creative lead

**Local Duel interruption recovery**, covering Standard and Hardcore:

1. Extend the existing client harness to reload at the first-player lock/handoff, second-player draft completion, next-round handoff and an unclaimed awakening/reward choice.
2. Assert the correct active player, separate formations/economies, ready flags, privacy handoff, pending decisions, map seed and spent charges. Settle each choice once and verify no duplication.
3. If a failure is reproduced, apply a localized client fix and a regression case. Preserve the existing V9 serialization and multiplayer/backend contracts; no new mode, artwork or balance change.
4. Run the six existing suites and focused new tests. Perform real browser acceptance when available, with any remaining limitation explicitly recorded. Package source, changelog and handoff together.

This proposal follows a documented testing gap, not a confirmed bug. Await the user's choice before treating it as the next milestone. Server-authoritative combat, accounts/ranking and new gameplay concepts remain separate decisions.

## Change record and recovery

This increment adds the handoff, a concise Work changelog and fresh inspection/test evidence only. Release metadata stays **1.0.1**; all original source, artwork, tests and launch/deployment files are unchanged. The new Work source ZIP is a complete runnable copy with these additions, not a patch and not a new feature release.

Recover the exact source baseline from the preserved original `aetherboard_v10_1_0_1.zip`, verifying its SHA-256 above. The per-file manifest allows comparisons before future edits. Restoring source does not restore a lost server room or undo later saved gameplay.
