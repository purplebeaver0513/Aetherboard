# Aetherboard Arena — 1.0.1 (Version 10)

An incremental **16-bit fantasy art release** built on the attached, working **9.0.1 compatibility patch**. This is the existing playable game, not a new engine or an image mockup.

![Actual client rendered with the bundled art](docs/v10/screenshots/v10-board-1440.png)

## Start here

Use Node.js **22 or newer**. Extract the entire project. In the directory containing `server.js` and `package.json`:

```sh
npm test
npm start
```

Open `http://localhost:8080`. Keep the server terminal open. No new runtime dependency or asset compilation is required. The checked-in PNG assets are ready to use; Python is only needed when deliberately rebuilding the artwork.

Online play needs this Node service. Opening only `public/index.html` is not a public multiplayer deployment. Friends outside your network need your running public host or tunnel address.

## What's new

- **56 original 32×32 spirit sprites**, one per existing spirit ID. They appear in the board, shop, bench, drafts, inspector, and enemy scouts.
- **49 original 20×20 icons**, covering all eight elements, seven roles, 22 items, commander actions, and supporting symbols. Decorative/common UI text can still include existing symbols.
- **27 terrain textures**: three floor variants for each of the six existing arenas, four hazards, pillars/void, and three buff nodes.
- Six decorative arena-border strips, an original forest-ruin panorama, a bitmap title, and a crest.
- A dark teal, moss, parchment/gold UI skin with sharp borders, clear team identity, and the same menu choices and control IDs.
- Narrow-phone board and command-row width fixes. Desktop uses the existing one-screen layout; phones scroll vertically and the shop scrolls horizontally where necessary.
- Failed custom-image URLs fall back to the bundled sprite, then to the old placeholder symbol.

## What stays the same

The server, shared gameplay rules, terrain generation, multiplayer messages, save keys, artwork override hook, music hook, and deployment files are unchanged. Existing draft/shop/reward/reconnect fixes from 9.0.1 are retained.

The game still has 56 spirits, eight types, seven roles, eight deployed units, a twelve-slot bench, type bonds, weaknesses, non-stacking bonuses, items, Blessings, permanent deaths in Hardcore, two automatic random bans, no role-ban/Faction Deck screen, and Black Market passing.

Arenas still last three rounds. Freeze still has **5 charges per match**, the chosen area attack **3**, with at most one of each per round and the existing shared cooldown. Shield and Focus keep their existing rules. Costs, effects, strengths, and balance were not changed for this art release.

## Modes

| Mode | Players | Rules |
|---|---:|---|
| 25-Round Expedition | 1 | Solo run with a final round |
| Endless | 1 | Continual solo scaling |
| Hardcore Expedition | 1 | Permanent casualties and random bans |
| Local Duel | 2 on one device | Standard or Hardcore; private handoff |
| Main Server Queue | 2 different devices | Standard/Hardcore queues remain separate |
| Private Duel | 2 different devices | Invite code; Standard or Hardcore |
| Private Party | 2–4 different devices | Existing rotating matchups; Standard only |

Active commander spells remain disabled for same-device pass-and-play. Hardcore Party, accounts, skill-based ranking, and persistent server rooms are not added in this release.

## Existing Cloudflare setup

Your tunnel can continue forwarding to port 8080. After stopping the old game server and starting this one, refresh the same public game address on every device between matches. A running Quick Tunnel does not have to be restarted just to change the client files on the same port.

When creating a new tunnel, use the original command from the folder containing your separately downloaded executable:

```powershell
.\cloudflared.exe tunnel --url http://localhost:8080
```

Use the public address printed by the current tunnel. Keep both processes running. `cloudflared.exe`, tunnel configuration, certificates, and credentials are not bundled or needed in GitHub.

## GitHub and your existing host

Upload the extracted project contents, not the ZIP itself. Keep `public/`, `server.js`, `package.json`, and the deployment files at the repository root. **Include `public/pixel-art.js`, `public/pixel-theme.css`, and all of `public/assets/pixel/`**; replacing only `index.html` will not deliver the new art.

Manual Node web-service commands remain:

```text
Build: npm install --omit=dev
Start: npm start
Health check: /health
```

No Blueprint, replacement domain, database, or new host configuration is introduced. An automatic host redeploy can restart the service and clear rooms. Update between matches.

## Saves and version numbering

**1.0.1 is the requested release label for Version 10.** Storage and shared-rule schema numbers remain **9** deliberately. V9 saves do not need a new run. The original V7/V8-to-V9 compatibility boundary is unchanged: those older entries are left alone but are not migrated.

Use the same browser profile and exact game address to find your existing local save. Different origins, including a new temporary tunnel hostname, have separate browser storage. This update does not move data between origins.

## Custom artwork and music

Keep your own files outside `public/assets/pixel/` and set the existing override:

```js
const CUSTOM_ASSETS = {
  unitImages: {
    cinderCub: "assets/my-cinder-cub.png"
  },
  musicUrl: "assets/my-theme.mp3"
};
```

A configured custom image takes priority over bundled pixel art. Blank entries use the new sprites. The procedural soundtrack is unchanged. Preserve your own `CUSTOM_ASSETS` and `ONLINE_CONFIG` edits when merging this package; local edits not uploaded to the conversation are not automatically in it.

## Documentation

- [Incremental change record](CHANGELOG_V10.md)
- [Installation, preservation and rollback](UPGRADE_1_0_1.md)
- [Asset directory, palettes and rebuild guide](ART_GUIDE.md)
- [Test evidence and limitations](TESTING_1_0_1.md)
- [Original baseline audit](AUDIT_V9_0_1.md)
- [Previous README, archived unchanged](docs/v10/README_PREVIOUS_V9.md)

## Prototype limits

Online combat is still partly calculated by a participating client. The server is not a complete competitive anti-cheat implementation. Rooms are in process memory and disappear on server restart. Browser-only private data cannot survive all storage loss or arbitrary long outages. Final commercial balance, large-scale load, live Cloudflare accessibility, native browser storage durability, and real mobile hardware performance are not certified by the test suite.
