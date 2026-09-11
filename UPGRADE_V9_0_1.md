# Installing the 9.0.1 patch without restarting the project

## Baseline

This release is based on the `aetherboard_auto_chess_v9_arena.zip` attached to the conversation, package version 9.0.0. The audit did not access your computer, GitHub account, current server process, or Cloudflare tunnel. Additional local edits or assets are not included automatically.

## Preserve your working copy

Back up your existing game folder first. Keep any custom files under `public/assets/`, changes to `CUSTOM_ASSETS`, and your existing `ONLINE_CONFIG` setting. Do not blindly replace these with the placeholder configuration in a downloaded baseline.

Use the same browser and game address when continuing an existing V9 save. Do not clear browser storage. Recreating a public tunnel can change the address; this patch does not transfer saved browser data between addresses.

## Two installation paths

### Complete repository

Extract the release ZIP into a separate folder. Its root contains `server.js`, `package.json`, `public/`, and `tests/` directly. Compare your custom changes before replacing the deployed repository. The complete ZIP includes the client fixes, tests, fixture, and audit evidence.

Run from the extracted repository:

```sh
npm test
```

Use the existing launch command when starting a stopped server:

```sh
npm start
```

Default port 8080 and `/health` are unchanged. Do not start a second server on a port already used by your running game.

### Client-only change for a customized V9 copy

`CLIENT_FIXES_V9_0_1.patch` contains only the four small edits to `public/index.html`, relative to the original 9.0.0 file. Review it before applying. From a Git working tree based on that version:

```sh
git apply --check CLIENT_FIXES_V9_0_1.patch
git apply CLIENT_FIXES_V9_0_1.patch
```

The client-only patch does not add the new test files or update package metadata. Use the full repository for those. If the check reports conflicting edits, do not force it; compare the affected functions with your current source.

## Existing hosting

`server.js`, `public/rules.js`, `/socket`, port handling, launchers, Dockerfile, and `render.yaml` are identical to 9.0.0. No new Render service, Blueprint, domain, tunnel, database, or account is needed. Your manual Web Service setup remains valid.

Because the backend itself is unchanged, replacing the client file does not inherently require restarting the Node process. The server reads it from disk and returns it with `Cache-Control: no-store`. Refresh clients between matches to load the patch. A host that redeploys automatically may still restart the process, which clears its in-memory rooms; schedule that between matches.

## Save behavior

- Offline schema: version 9, key `aetherboard-auto-chess-v9-arena`.
- Profile: `aetherboard-arena-profile-v1`.
- Online session: `aetherboard-online-session-v9`.
- Online private game state: `aetherboard-online-game-state-v9`, unchanged envelope version 2.
- No new game or save reset is required for V9 players.
- Old V7/V8 entries remain untouched, not migrated.
- Already-lost draft selections or reward decisions cannot be reconstructed by this patch.

## Small acceptance check

Start a new test draft, choose one spirit, then refresh and Continue; the pick should remain. A completely purchased shop should still be empty after a refresh. During a private or public duel, briefly reconnect while a reward is open; the same seat and the outstanding choice should return. Use a disposable test match rather than risking a valuable Hardcore run.

## Rollback

Restore your backed-up `public/index.html`, or restore the full backed-up repository if you deployed everything. No downgrade migration is needed because the V9 schema has not changed. The original recovery defects return with the original client; rollback does not restore older browser data or server rooms that have already disappeared.
