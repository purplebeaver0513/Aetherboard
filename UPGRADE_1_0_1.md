# Install 1.0.1 / Version 10

## Keep the working copy

Back up the current project. This complete update is based on the attached v9.0.1 package, not any unuploaded changes on your PC. Preserve your own art/music and the `CUSTOM_ASSETS` / `ONLINE_CONFIG` entries in `public/index.html`.

Do not clear browser site data. Keep the same browser profile and game address for an existing V9 save. Version 10's release number is 1.0.1; serialized save version stays 9. V7/V8 saves are not newly migrated.

## Recommended: separate-folder installation

1. Extract this ZIP into a new folder. Open the folder that directly contains `server.js`, `package.json`, `public/` and `tests/`.
2. In the old **game-server** terminal press Ctrl+C between matches. Do not stop the separate Cloudflare process merely to change game versions.
3. In File Explorer's address bar in the new folder, enter `cmd` and press Enter.
4. Run `npm test`, then `npm start`. Do not run two game servers on port 8080 simultaneously.
5. Open `http://localhost:8080`, then `/health`. Refresh the public Cloudflare page on all players' devices. The title's small version badge should say `v1.0.1 · Version 10` and spirits should be pixel sprites.
6. Create a disposable private duel, draft, equip an item, lock both teams and play a round. Then briefly reconnect one client during planning.

Server restart clears rooms, so create a new lobby. Both existing host launch commands and port handling are unchanged.

## Existing Cloudflare link

Keep the original tunnel open if it is still forwarding to the same local port. Your executable may remain in its old folder; a running process does not need to move alongside the game. When the Node process comes back on port 8080, the tunnel can forward to it again. Recreating a Quick Tunnel gives a new random public address; use the latest address it prints, not an old example from chat.

This is a local code update, not a new Render setup. Manual deployment commands, `/health` and `/socket` are unchanged. You do not need Blueprint.

## A customized V9.0.1 project

Review `V10_CLIENT_ART.patch` before applying it:

```sh
git apply --check V10_CLIENT_ART.patch
```

The patch changes only the client entrypoint. You must also copy `public/pixel-art.js`, `public/pixel-theme.css`, and `public/assets/pixel/`. Keep your custom images and configuration. Do not force a patch with conflicts. New tests, metadata and documentation are in the full ZIP.

The server serves files from disk, so an in-place frontend-only update does not inherently require restarting Node. Nevertheless, refresh all clients between matches and avoid mixing client builds in a live room. Your host may trigger an automatic server restart on commit.

## GitHub upload

Upload extracted contents at the repository root. Include every new presentation file, not only `index.html`. Do not upload `node_modules`, the ZIP, Cloudflare executables/configuration, `.env`, tokens or certificates. The existing ignore file already covers local tunnel binaries and credentials.

## Missing art

Verify these files exist in the deployment:

```text
public/pixel-art.js
public/pixel-theme.css
public/assets/pixel/manifest.json
public/assets/pixel/units/cinderCub.png
```

A missing custom image falls back to the bundled sprite. If the bundled sprite is also unavailable, the old symbol is used. Refresh the browser after uploading all files. Do not clear storage as a troubleshooting shortcut.

## Roll back

Stop the new Node process, restart the backed-up project, and refresh clients using the same address. The V9 save schema is unchanged, so no downgrade migration was introduced. This does not resurrect a room lost during a server restart or undo game progress saved after installation.
