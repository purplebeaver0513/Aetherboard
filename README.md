# Aetherboard Arena — Version 6: Hardcore & Dynamic Arenas

Aetherboard is a self-contained browser auto-chess prototype with solo modes, same-device Local Duel, and cross-device private lobbies. Version 6 adds a complete Hardcore ruleset, permanent unit death, active combat intervention, changing arena maps, weather, positional nodes, a faction-deck setup phase, and a health-priced Black Market.

The current spirit art and soundtrack are placeholders. The project keeps centralized custom-asset hooks so original character images, VFX, UI art, and music can be added later without rebuilding the game systems.

## Screenshots

### Hardcore title selection

![Hardcore title selection](docs/screenshots/title-hardcore.png)

### Dynamic arena planning

![Hardcore planning board](docs/screenshots/hardcore-planning.png)

### Active combat commands

![Commander spells and Focus Banner](docs/screenshots/active-commands.png)

### Health-priced Black Market

![Black Market](docs/screenshots/black-market.png)

### Frozen Pass arena

![Frozen Pass map](docs/screenshots/frozen-pass.png)

## Quick start

### Play solo or Local Duel

Open `public/index.html` directly in a modern browser.

### Run cross-device multiplayer

Cross-device rooms require the included Node server.

Requirements:

- Node.js 22 or newer
- A modern desktop or mobile browser

From the project folder, run:

```bash
npm start
```

Then open:

```text
http://localhost:8080
```

For another device on the same Wi-Fi, open the host computer's local IPv4 address with port 8080, for example:

```text
http://192.168.1.25:8080
```

On Windows, `START_AETHERBOARD.bat` performs the same launch step.

## Game modes

### 25-Round Expedition

A standard finite run. Draft from nothing, improve the roster, defeat bosses every five rounds, and survive through round 25.

### Endless Ascension

Enemy strength continues increasing after round 25. The run ends only when the commander's heart reaches zero.

### Hardcore Expedition

A 25-round high-stakes ruleset with:

- Permanent spirit death after combat
- 40 starting heart rather than 60
- A pre-run role ban and two individual spirit bans
- A custom 15-spirit Faction Deck
- A five-spirit Global Pool mixed into shop rolls
- Dynamic arenas and weather
- Active commander spells and Focus Banners
- A Black Market every fifth completed round
- A roster-wipe loss condition even when commander heart remains

### Local Duel

Two players draft and plan privately on one device, passing it between turns. Active commander interventions are disabled here so the person holding the screen does not receive an unfair control advantage.

### Online Duel

Two players join a private lobby from separate devices. Both draft, plan, and lock formations privately.

### Online Party

Two to four players join a private lobby. Matchups rotate until one commander remains.

## Hardcore setup

### 1. Ban phase

Before drafting, choose:

- One entire role to remove from the available roster
- Two individual spirits to remove

The setup screen also includes a randomize option.

The current prototype treats these as the Hardcore player's own bans. A future competitive lobby version could replace this with simultaneous player voting or alternating bans.

### 2. Faction Deck

Build a deck of exactly 15 spirits. It must contain at least four spirits costing one or two gold so the opening draft remains playable.

Hardcore shops and starter choices draw only from:

- The chosen 15-spirit Faction Deck
- A generated five-spirit Global Pool

This creates asymmetric runs instead of allowing every player to roll every unit.

## Permanent death

At the end of every Hardcore battle, each deployed player spirit that was knocked out is removed permanently from:

- The battlefield
- The bench
- The owned-unit collection
- Its equipped items

The loss is recorded in the Hardcore graveyard history and casualty counter.

### Grave Idol

`Grave Idol` is a corrupted item that prevents one permanent death. When triggered, the protected spirit survives and the Idol shatters.

### Roster wipe

If no owned spirits remain after permanent deaths are resolved, the run ends immediately—even if commander heart is still above zero.

## Active combat intervention

In every supported battle, the player may use:

- One commander spell
- One Focus Banner

All commander actions share a 3.5-second global cooldown.

### Commander spells

| Spell | Target | Effect |
|---|---|---|
| Localized Freeze | Board tile | Stuns enemies in a two-cell radius for 1.4 seconds and slows them for 3 seconds |
| Rally Pulse | Board tile | Heals allied spirits in a two-cell radius for 18% of maximum health |
| Terrain Wall | Board tile | Creates two temporary blocked cells for 6 seconds; pathfinding routes around them |

### Focus Banner

Select an enemy to force nearby allied units to prioritize that target for 5 seconds. This gives the player a way to pressure a protected carry without directly controlling individual spirits.

### Keyboard controls

| Key | Action |
|---|---|
| `1` | Select Localized Freeze |
| `2` | Select Rally Pulse |
| `3` | Select Terrain Wall |
| `F` | Select Focus Banner |
| `Esc` | Cancel targeting or clear selection |
| `R` | Reroll shop |
| `E` | Buy XP |
| `Space` | Begin battle or lock formation |

## Dynamic arenas

The arena rotates every round. Blocked cells are respected by placement and combat pathfinding. If a new map blocks an occupied planning tile, the game relocates that spirit to a legal tile or the bench.

| Arena | Core feature |
|---|---|
| Ember Foundry | Lava tiles damage non-Fire spirits |
| Verdant Chasm | Brush, blocked paths, and narrow choke points |
| Frozen Pass | Ice and central obstacles slow and redirect combat |
| Storm Coast | Mana currents accelerate ability casting |
| Moonlit Ruins | Pillars, brush, and stronger Shadow/Assassin pressure |
| Sky Bastion | Missing floor cells and additional positional buff nodes |

### Environmental tiles

- Lava: deals 3% maximum health every 2 seconds; Fire spirits are immune
- Brush: grants 15% dodge; Nature and Wind spirits receive 25%
- Ice: slows movement and attacks for non-Ice spirits
- Mana Current: restores 4 mana per second
- Blocked/Missing floor: cannot be entered or crossed

## Weather cycle

Weather changes every five rounds and applies a global rules modifier. The current cycle includes Clear, Night, Rain, Solar Flare, Blizzard, and Arcane Storm conditions.

Examples:

- Night improves Shadow and Assassin critical pressure
- Rain increases mana generation
- Solar conditions strengthen Fire effects
- Blizzard favours Ice spirits and slows others

The active map and weather are visible in the arena header. Press the `Run` button for a detailed explanation.

## Positional buff nodes

Mirrored nodes appear on legal board cells:

- Speed Node: +20% attack speed
- Ward Node: +20 armour
- Mana Node: +25 starting mana

Nodes follow the game's non-stacking rule. A spirit receives only the strongest applicable bonus to a given stat.

## Black Market

Every fifth completed Hardcore round opens the Black Market before the normal Team Blessing choice.

Black Market purchases cost commander heart rather than gold. A purchase cannot reduce the commander below one heart.

Possible offers include:

- Corrupted equipment
- A corrupted unit from the current allowed pool
- Soul Stitch resurrection
- Forbidden Promotion
- Blood Contract gold and XP

### Corrupted items

- Void Crown
- Blood Engine
- Chaos Lens
- Grave Idol
- Forbidden Hourglass

Corrupted items cannot appear in ordinary item rewards.

### Soul Stitch

Returns the most recent eligible casualty as a one-star spirit without equipment.

### Forbidden Promotion

Raises the strongest eligible owned spirit by one star without consuming copies.

### Blood Contract

Immediately grants 12 gold and 4 XP.

The player may leave the Black Market without buying anything.

## Items and Team Blessings

The game retains the expanded item pool, including lifesteal, damage reduction, mana generation, attack range, on-hit slow, burn, revival, health, attack, armour, speed, regeneration, and ability-power effects.

Every fifth completed round grants a permanent Team Blessing. Hardcore receives the Black Market first, then the Blessing.

Examples include:

- Battle Training
- Arcane Tutelage
- Swift Formation
- Fortified Lines
- Vitality Rite
- Starting Spark
- Healing Winds
- Sharp Instinct
- Elemental Mastery
- War Chest

## Non-stacking stat rule

To keep the interface readable and prevent defensive builds from becoming overwhelming, bonuses to the same stat do not add together. The game applies only the strongest applicable source for each stat.

For example, if a Vanguard receives:

- +18 armour from its role bonus
- +24 armour from Iron Plate
- +12 armour from Adaptive Guard
- +20 armour from a Ward Node

the spirit receives +24 armour, not +74.

This strongest-source rule applies to health, attack, armour, attack speed, ability power, starting mana, regeneration, item critical chance, and similar same-stat effects.

Type Bond damage remains a separate team-building reward, but only the highest unlocked Type Bond tier applies.

## Vanguard balance

The reduced Vanguard role values remain in Version 6:

- 2 Vanguards: +8 armour
- 4 Vanguards: +18 armour
- 6 Vanguards: +30 armour

The old +20/+42/+70 values are no longer used.

## Cross-device online actions

Online battles synchronize active commander actions through the lobby server:

- The server validates the battle participant and action type
- The server enforces one spell and one Focus Banner per player
- The server enforces a 3.3-second minimum action interval
- Board targets and target IDs are sanitized
- The action log is retained for reconnecting players
- Every participant receives the same arena seed and action sequence

The browser still calculates the deterministic battle and reports the result. This is suitable for a casual prototype, but not a fully cheat-proof competitive service.

## Online-server limitations

Current online rooms are held in server memory. Therefore:

- Restarting or redeploying the server closes active rooms
- There are no permanent accounts, matchmaking queues, friends lists, chat, or cloud rankings
- One participant remains the designated deterministic battle authority
- Server validation reduces malformed input but does not provide commercial-grade anti-cheat
- Horizontal multi-server scaling would require shared room state, such as Redis or a database

A production version should move complete combat simulation to the server and add authentication, persistent storage, rate limiting, moderation, telemetry, and server-authoritative anti-cheat.

Hardcore is currently a solo ruleset. Online Duel and Party use the standard economy and elimination rules, while still supporting the new active combat actions and synchronized arena seed.

## Public deployment

The included `render.yaml` can deploy the complete frontend and WebSocket server as one Render web service:

1. Upload the complete project to a GitHub repository.
2. In Render, create a new Blueprint.
3. Select the repository.
4. Render reads `render.yaml`.
5. Deploy the service.
6. Open the generated HTTPS address on every device.

The client automatically uses secure `wss://` when served over HTTPS.

A standalone GitHub Pages site cannot run the Node lobby server by itself.

## Custom artwork and music

The client includes this centralized section near the top of `public/index.html`:

```js
const CUSTOM_ASSETS = {
  unitImages: {
    // cinderCub: "assets/cinder-cub.png",
    // ripplefin: "assets/ripplefin.png"
  },
  musicUrl: ""
};
```

Place future assets under `public/assets/` and add their relative paths. A custom unit image replaces that spirit's emoji placeholder in the board, bench, shop, draft, selected-spirit panel, and enemy preview.

Set `musicUrl` to replace the current procedural placeholder soundtrack.

## Project structure

```text
aetherboard_auto_chess_v6_hardcore/
├── public/
│   ├── assets/
│   └── index.html
├── docs/
│   └── screenshots/
├── tests/
│   └── server-smoke-test.mjs
├── server.js
├── package.json
├── package-lock.json
├── render.yaml
├── Dockerfile
├── START_AETHERBOARD.bat
├── CHANGELOG_V6.md
└── README.md
```

## Validation completed

The included build has been checked for:

- Client JavaScript syntax
- Server JavaScript syntax
- Creating and joining online Duel lobbies
- Ready/start/draft/planning flow
- Formation submission and round completion
- Reconnection and battle-authority reassignment
- Three-player party pairings and ghost battles
- Server-relayed combat actions
- Shared environment seeds and reconnect action logs
- Complete Hardcore ban and 15-unit deck setup
- Starter draft from the restricted Hardcore pool
- Active Freeze, Rally/targeting infrastructure, Terrain Wall, and Focus Banner flow
- Permanent death and roster removal
- Grave Idol death prevention
- Black Market purchase and health deduction
- Arena rotation, blocked tiles, weather, and buff nodes
- Desktop and mobile title-screen layouts

Run the online protocol smoke test with:

```bash
npm run test:server
```

A health endpoint is available at:

```text
/health
```
