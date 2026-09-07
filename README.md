# Aetherboard Arena — Version 9: Shifting Arenas

A complete browser auto-chess prototype with solo Expedition / Endless / Hardcore, same-device Local Duel, public online 1v1 matchmaking, and private cross-device Duel / Party rooms. Original characters and procedural audio are placeholders for your future custom assets.

**Start a fresh run when updating from V7 or V8.** Version 9 has a different roster and new run-wide spell charges. It uses a new save namespace; older local saves are left untouched rather than partially migrated. Everyone in a multiplayer match must load the V9 client from the same V9 server.

## Start on your computer

Requirements: Node.js 22 or newer. No third-party runtime dependencies are required.

Extract the entire repository. In the folder containing `server.js` and `package.json`, run:

```sh
npm start
```

Open `http://localhost:8080`. The server health check is `http://localhost:8080/health`. The Windows launcher `START_AETHERBOARD.bat` and shell launcher `start-aetherboard.sh` are included.

**Keep `public/rules.js` alongside `public/index.html`.** The browser and server share this new file for the roster, arena generation, random bans, elemental weaknesses, and area-attack definitions. Copying only the HTML file will not install the update.

## Using your existing Cloudflare tunnel

The forwarding destination is unchanged: `http://localhost:8080`.

1. Stop the old game server with Ctrl+C. Do not run two copies on port 8080.
2. Extract this version into a new project folder and start `npm start` there.
3. Keep your existing `cloudflared` process running, or restart it from wherever you keep its executable:

```powershell
.\cloudflared.exe tunnel --url http://localhost:8080
```

4. Open the public address currently printed by the tunnel on both devices. Refresh the page before starting a new room. A restarted Quick Tunnel may produce a different address.

The executable is not included in this repository. Do not upload your `cloudflared.exe`, personal tunnel configuration, account token, or credentials to GitHub. Keep the game server, tunnel, and host computer running during a match. A tunnel is not an independently hosted, always-on game server.

## Online modes retained

**Main Server Queue:** automatic public 1v1 matchmaking, with separate Standard and Hardcore queues. The first compatible pair starts automatically. There is no separate global Aetherboard master server: everyone must use the same running server.

**Private Lobby:** invite-code two-player Duel, optionally Hardcore, or Standard Party for two to four devices. Parties retain rotating pairings and ghost battles when needed. Ready up, start, privately draft, then lock formations.

Hardcore is available in solo and two-player duels; Party remains Standard. Same-device Local Duel retains private pass-and-play, but active combat commands remain disabled because one person physically holds both players' controls. Use an Online Duel on separate devices for active spells.

## Random arenas: three-round chapters

Arena layouts are procedurally generated from a run or server match seed, not selected from six fixed tile arrangements. The six themes remain Ember Foundry, Verdant Chasm, Frozen Pass, Storm Coast, Moonlit Ruins, and Sky Bastion.

- Rounds **1–3** share the first map, weather, hazards, obstacles, and buff nodes.
- Rounds **4–6** share a new one, then 7–9, 10–12, and so on.
- Consecutive chapters use different themes. Future layouts may naturally recur; randomness is not a promise of infinite unique layouts.
- Both halves are mirrored for fairness. The generator verifies that walkable cells remain connected and leaves useful deployment space.
- All players in an online match receive the same server-seeded arena chapter.
- Newly blocked deployment cells automatically move affected spirits to legal cells, or to the bench when necessary.
- At the start of a new chapter, a central arena card appears, then shrinks/fades into the persistent arena-information chip. The chip shows the round range, rounds remaining, and weather. Reduced-motion users receive a simpler transition.

The central announcement appears after required draft/reward dialogs close, rather than interrupting a player's choice. It is informational and does not consume turns.

### Readable tile effects

| Tile | Effect |
|---|---|
| Speed node | +20% attack speed for a spirit deployed there |
| Ward node | +20 armour for a spirit deployed there |
| Mana node | +25 starting mana for a spirit deployed there |
| Lava | Non-Fire spirits lose 3% maximum health every two seconds while standing there |
| Ice | Non-Ice spirits attack 15% slower and take 25% longer to move while standing there |
| Brush | 15% dodge while standing there; 25% for Nature |
| Mana current | +4 mana per second while standing there |
| Blocked terrain | Cannot deploy or path through this tile |

Deployment nodes apply for the battle; they do not require the spirit to remain on that tile. Hazards/brush/currents use the spirit's current position. Strongest same-stat bonuses still win. Tile effects use outlines, patterns, icons, short labels, and hover explanations rather than relying only on colour.

## Cleaner interface

The larger **Armory / Items** panel is now on the left, immediately below Types & Roles. Click a spirit and then an item to equip it. The **Battle Log** is on the right, below the selected-spirit card, in a compact independently scrolling panel. The display keeps the latest 12 log entries; the run retains up to 40 internally. Notifications are capped at three simultaneously.

The arena remains central, the shop and bench stay below it, and side-panel cards no longer compress over one another. Mobile uses a stacked, scrollable layout rather than squeezing a desktop interface onto one screen.

## Hardcore without manual deck setup

Each new Hardcore run/match automatically bans **two individual spirits**, selected from the available roster. Both online duel players receive the same server-selected bans. The selection is shown at the beginning and in Run Info.

No role ban, manual ban-selection step, Faction Deck, or 15-unit deck builder remains. Shops and starter drafts use the full remaining roster with existing cost/level odds. Random bans stay fixed for the whole match, rather than changing every round. There are 54 eligible spirits after the two bans.

Permanent death, lost equipment, separate graveyards, Grave Idol protection, roster-wipe elimination, and health-priced Black Markets remain. Every fifth eligible Hardcore round opens a market. **Pass This Market / Pass · spend 0 heart** remains available; passing advances normally and spends nothing.

## Roster: 56 spirits across eight elements

Earth and Wind are removed from the roster, normal shop, draft pools, enemy roster, server's accepted unit catalogue, and type UI. The remaining elements are **Fire, Water, Nature, Electric, Ice, Shadow, Light, Arcane**. Each has seven spirits, including a Healer and a Buffer with different costs and effectiveness.

The request to add one more to each type was implemented as **one additional spirit for each remaining element**, not dual-element creatures.

| New spirit | Element | Role | Cost | Ability |
|---|---|---|---:|---|
| Coalback | Fire | Vanguard | 3 | Furnace Guard: shield itself and burn nearby enemies with a burst |
| Mist Otter | Water | Assassin | 2 | Undertow: blink to a weak target and heal from the hit |
| Brambletoad | Nature | Vanguard | 2 | Bramble Shelter: self-shield and heal an injured ally |
| Tesla Lynx | Electric | Striker | 3 | Capacitor Burst: strike and slow several nearby enemies |
| Icecarapace | Ice | Striker | 3 | Cold Snap: clustered damage and slowing |
| Veilhound | Shadow | Ranger | 2 | Veil Bolt: bonus pressure against an already wounded enemy |
| Lumenkit | Light | Striker | 1 | Dawn Pounce: strike its target and gain a small shield |
| Glyph Mantis | Arcane | Assassin | 4 | Rift Cut: teleporting attack with a partial mana refund |

Existing non-stacking stats, the reduced Vanguard armour bonuses (8 / 18 / 30 at 2 / 4 / 6), support-role effects, items, awakenings, and Type Bond tiers remain.

## Elemental weaknesses

Typed direct damage is **1.25×** against a weakness and **0.8×** in the reverse matchup. Other pairs, including same-type fights, are neutral. This multiplier is separate from Type Bond damage. Healing, shields, untyped terrain damage, and damage-over-time without an attacker do not gain these multipliers.

| Strong element → vulnerable element | Game reasoning |
|---|---|
| Water → Fire | Water extinguishes flame |
| Fire → Nature | Fire burns vegetation |
| Fire → Ice | Heat melts ice |
| Ice → Nature | Frost damages growth |
| Nature → Electric | Roots and dry bark resist electricity; a game abstraction |
| Electric → Water | Water conducts the shock |
| Light → Shadow | Light dispels darkness |
| Shadow → Arcane | Corruption disrupts ordered runes |
| Arcane → Light | Magic bends and refracts light |

The last three form a fantasy counter-triangle, not a real-world scientific claim. No element is immune to another element's attacks. Open **Weaknesses** above the trait list for the chart; a selected spirit shows its strong and weak matchups.

## Commander spells: limited resources

Rally Pulse is removed as a commander action. Before the free starter draft, each commander chooses one area attack for the whole run:

| Choice | Element | Shape / role | Base hit before armour and type multipliers |
|---|---|---|---|
| Meteor Crash | Fire | Radius 1, concentrated burst | 125 + 8 × round + 8% of target maximum health |
| Thunder Bloom | Electric | Radius 2, wider coverage | 80 + 5 × round + 4% of target maximum health |
| Void Rupture | Shadow | Radius 1, anti-shield | Remove up to 25% of target maximum health from its shield, then 90 + 6 × round + 6% of target maximum health damage |

Radius uses grid Manhattan distance (diamond-shaped on this square board). These are **initial tuning values**, not balance proven through competitive playtesting.

| Action | Key | Per-round limit | Whole-run/match limit |
|---|---|---:|---:|
| Freeze | 1 | Once | 5 uses |
| Chosen area attack | 2 | Once | 3 uses |
| Aegis Shield | 3 | Once | No additional match cap |
| Focus Banner | F | Once | No additional match cap |

**Freeze and the area attack are separate allowances.** You may use both in the same battle, waiting for the shared 3.5-second commander cooldown. Shield and Focus remain additional actions with the same cooldown. Charges do not reset each round, on rewards, or when reconnecting. Only starting a new run/match resets them. Each online player has a separate budget.

Click an action, then a tile or target. Escape cancels targeting. A local invalid target does not spend a charge. Online casts wait for server confirmation; a target can move or die before an accepted cast resolves. The server rejects malformed targets, repeat casts, exhausted budgets, and attempts to refill charges through a formation snapshot. Repeated network delivery of the same action does not charge twice. Loadout selection is locked server-side after drafting.

Online simulation stays at **Live ×1**, independent of solo speed controls. Reconnect replay uses the immutable battle-start budgets plus the server action log, then catches up to the active battle.

## Repository / manual deployment

Upload the extracted project contents, not the ZIP itself. Keep `server.js`, `package.json`, and `public/` directly in the repository root. The newly added `public/rules.js` is essential.

For a manually configured Node Web Service (no Blueprint needed):

```text
Root Directory: blank when package.json is at the repository root
Build Command: npm install --omit=dev
Start Command: npm start
Health Check Path: /health
```

The server reads `PORT` from the environment and defaults to 8080. It binds to `HOST` or `0.0.0.0`. The optional `render.yaml` and Dockerfile remain included, but manual deployment does not require a Blueprint.

## Custom artwork and soundtrack

Place images/audio in `public/assets/`. Edit `CUSTOM_ASSETS` in `public/index.html`:

```js
const CUSTOM_ASSETS = {
  unitImages: {
    cinderCub: "assets/cinder-cub.png",
    coalback: "assets/coalback.png"
  },
  musicUrl: "assets/aetherboard-theme.mp3"
};
```

Units without an image keep their emoji placeholder. An empty music URL uses the procedural placeholder soundtrack. Music and effects have separate controls. No external assets or downloaded music are bundled.

## Validation

```sh
npm test
```

This runs seeded rules/layout tests, real-WebSocket public/private lobby and Hardcore smoke tests, and six-round commander-charge/reconnection tests. Node.js 22+ supplies the WebSocket client used by tests. Test servers use local ports 18117 and 18118 and terminate after testing.

See `TESTING_V9.md` for the actual validation record. Functional checks establish that rules execute; they do not establish final competitive balance.

## Prototype limitations

- Rooms, queues, and authoritative spell budgets are held in process memory. Restarting the server removes active matches. Use one server instance.
- A designated participant still calculates combat and reports results. Server validation of rosters, bans, and spell budgets is **not complete anti-cheat**; account authentication, persistent storage, and server-side combat remain future production work.
- There are no permanent online rankings, skill-based matching, bots filling public queues, or guaranteed hosting included.
- Brief WebSocket disconnects can resume a seat within the existing two-minute grace period. Private planning data still depends on that browser's saved snapshot; clearing storage or changing browsers is not a guaranteed recovery path.
- Save namespaces separate V9 from older versions. Do not mix old clients with this server.

## Screenshots

![V9 area-attack choice and automatic bans](docs/screenshots/v9-loadout.png)
![V9 terrain announcement](docs/screenshots/v9-arena-arrival.png)
![V9 battlefield and inventory layout](docs/screenshots/v9-board-desktop.png)
