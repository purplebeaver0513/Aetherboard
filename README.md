# Aetherboard Arena — Version 7: Hardcore Duels & Support Classes

Aetherboard Arena is an original browser auto-chess prototype with solo play, same-device Local Duel, and cross-device private multiplayer lobbies. Version 7 adds Hardcore rules to both Local Duel and two-device Online Duel, expands the roster from 40 to 60 spirits, adds Healer and Buffer roles to every elemental type, replaces Terrain Wall with Aegis Shield, and repairs Focus Banner targeting.

The current emoji creatures, generated sound effects, and procedural music are placeholders. The code contains centralized asset hooks so custom character artwork and music can be added later.

## Version 7 highlights

- Hardcore Local Duel and Hardcore Online Duel
- 40 starting heart in Hardcore Duel
- Permanent death and graveyards for both duel players
- Private two-spirit bans for each player
- No role bans: every class remains available
- Private 15-spirit Faction Decks plus five-spirit Global Pools
- Black Market rewards every five rounds, including a clear Pass option for zero heart
- 60 total spirits
- One Healer and one Buffer in every type
- New Healer and Buffer class synergies
- Aegis Shield commander spell in place of Terrain Wall
- Fixed Focus Banner selection and forced targeting
- Existing dynamic maps, weather, items, Team Blessings, music, and non-stacking stat rules retained

## Screenshots

### Hardcore Online Duel selection

![Hardcore Online Duel title screen](docs/screenshots/v7-hardcore-online-title.png)

### Black Market pass option

![Black Market with pass option](docs/screenshots/v7-black-market-pass.png)

### Support units and repaired Focus Banner

![Support-unit combat and Focus Banner](docs/screenshots/v7-support-combat-focus.png)

## Repository structure

```text
public/
  assets/
  index.html

tests/
  server-smoke-test.mjs

server.js
package.json
package-lock.json
render.yaml
Dockerfile
START_AETHERBOARD.bat
start-aetherboard.sh
README.md
CHANGELOG_V7.md
GITHUB_UPLOAD_CHECKLIST.md
.gitignore
.dockerignore
```

## Quick local start

### Requirements

- Node.js 22 or newer
- A modern browser such as Chrome, Edge, Firefox, or Safari

### Windows

Double-click:

```text
START_AETHERBOARD.bat
```

Or open Command Prompt in the repository folder and run:

```bat
npm start
```

### macOS or Linux

Run:

```bash
./start-aetherboard.sh
```

Or:

```bash
npm start
```

Then open:

```text
http://localhost:8080
```

Check the multiplayer server with:

```text
http://localhost:8080/health
```

A successful response contains `"ok": true`.

## Playing across devices on the same Wi-Fi

1. Start the server on one computer with `npm start`.
2. Keep the terminal window open.
3. Find that computer's local IPv4 address using `ipconfig` on Windows or `ifconfig`/`ip addr` on macOS or Linux.
4. On another device connected to the same network, open `http://HOST-IP:8080`.
5. Select Online Duel or Online Party, create a lobby, and share the six-character room code.

Do not use `localhost` on the second device. On that device, `localhost` refers to the second device itself.

## Game modes

### 25-Round Expedition

A finite solo run with bosses every five rounds and a final victory at round 25.

### Endless Ascension

A solo survival run that keeps scaling until the commander is defeated.

### Hardcore Expedition

A solo 25-round run with permanent spirit death, two individual spirit bans, a 15-spirit Faction Deck, a five-spirit Global Pool, graveyard records, and health-priced Black Markets.

### Local Duel

Two players privately draft and plan on one device. Select Local Duel on the title screen, then enable **Hardcore Duel** to use permanent-death rules.

Active commander spells are disabled during same-device Local Duel so the person physically holding the device does not receive an unfair intervention advantage.

### Online Duel

Two players join a private lobby from separate devices. Select Online Duel and enable **Hardcore Duel** before creating the room to start a Hardcore lobby.

In Hardcore Online Duel:

- Both players begin with 40 heart.
- Each player privately bans two individual spirits.
- Each player builds a private 15-spirit Faction Deck.
- Every role remains available because role bans were removed.
- Knocked-out deployed spirits die permanently.
- Grave Idol can prevent one permanent death and then shatters.
- A player is eliminated when commander heart reaches zero or the entire owned roster is wiped out.
- Black Market and Team Blessing choices occur every five completed rounds.
- Players may pass on the Black Market and lose no heart.

### Online Party

Two to four players join a private lobby and rotate through matchups. Party currently uses the standard multiplayer rules; Hardcore applies to Duel only.

## Hardcore setup

### Private spirit bans

Each Hardcore player bans exactly two individual spirits. There is no role-ban step. Healers, Buffers, Vanguards, Rangers, Mystics, Strikers, and Assassins remain available if the player includes them in the Faction Deck.

### Faction Deck

Each player selects exactly 15 allowed spirits. The deck must include enough low-cost units to support the starter draft and early shop.

The personal shop draws from:

- The player's 15-spirit Faction Deck
- A smaller five-spirit Global Pool

The two duel players can therefore use different available rosters.

## Permanent death

At the end of a Hardcore battle, each deployed spirit that was knocked out is removed from the player's board, bench, and owned collection. Its equipped items are lost with it. Casualties are added to the graveyard history.

### Grave Idol

Grave Idol prevents one permanent death. The protected spirit returns to the roster and the Idol is consumed.

### Roster wipe

If a Hardcore player owns no surviving spirits after casualties are processed, that player is eliminated even if commander heart would otherwise remain.

## Black Market

A Hardcore Black Market opens every five completed rounds before the ordinary Team Blessing reward.

Offers can include:

- Corrupted equipment
- Corrupted spirits
- Soul Stitch resurrection
- Forbidden Promotion
- Blood Contract gold and XP

Purchases cost commander heart rather than gold and cannot reduce the player below one heart.

The player can always select **Pass This Market** or **Pass · spend 0 heart**. Passing records the visit, takes no item, and costs no heart.

## Healer and Buffer classes

Version 7 adds 20 support spirits: one Healer and one Buffer for each of the ten elemental types. Costs and strength vary, so some are cheap early-game specialists while others are expensive team-wide carries.

| Type | Healer | Cost | Main effect | Buffer | Cost | Main effect |
|---|---|---:|---|---|---:|---|
| Fire | Ember Medic | 2 | Heals two allies and grants small shields | Warflare | 1 | Raises two carries' attack |
| Water | Tide Nurse | 1 | Strong single-target healing and mana | Current Caller | 3 | Speeds three allies and grants mana |
| Nature | Bloom Doe | 3 | Heals three allies and adds regeneration | Grove Herald | 2 | Grants armour and regeneration |
| Electric | Pulse Hare | 2 | Heals two allies and jump-starts mana | Volt Conductor | 4 | Greatly speeds four allies and grants mana |
| Ice | Frost Fawn | 1 | Heals two allies and grants ice shields | Rime Bell | 3 | Grants armour and damage reduction |
| Shadow | Dusk Leech | 4 | Damages an enemy and heals two allies | Night Drummer | 2 | Adds attack and critical chance |
| Light | Halo Dove | 5 | Powerful full-team healing and shields | Dawn Standard | 4 | Adds ability power and shields |
| Earth | Clay Cleric | 3 | Heals two allies and grants sturdy shields | Bastion Totem | 5 | Fortifies the entire team |
| Wind | Zephyr Sprite | 2 | Heals three allies and briefly speeds them | Gale Piper | 3 | Adds speed and critical chance |
| Arcane | Rune Oracle | 4 | Heals three allies and floods them with mana | Aether Maestro | 5 | Full-team attack and ability empowerment |

### Healer synergy

- 2 Healers: Healers restore 12% more
- 4 Healers: Healers restore 25% more
- 6 Healers: Healers restore 42% more

### Buffer synergy

- 2 Buffers: buffs are 10% stronger and 15% longer
- 4 Buffers: buffs are 22% stronger and 30% longer
- 6 Buffers: buffs are 38% stronger and 50% longer

Support buffs follow the existing clean-stat rule. Different sources affecting the same stat do not pile up uncontrollably; the strongest current source applies. Equal-strength temporary buffs may refresh their duration.

## Active commander controls

Supported solo and online battles allow one commander spell and one Focus Banner per player per battle. They share a global cooldown.

| Key | Command | Effect |
|---|---|---|
| `1` | Localized Freeze | Stuns and slows enemies near the selected tile |
| `2` | Rally Pulse | Heals allies near the selected tile |
| `3` | Aegis Shield | Shields allies near the selected tile |
| `F` | Focus Banner | Selects an enemy and forces living allies to prioritize it for five seconds |
| `Esc` | Cancel targeting | Exits commander targeting mode |

### Focus Banner repair

Enemy combat units become selectable while Focus targeting is active. The marked enemy receives a visible target icon, the command stores the correct opposing-side target, and allied units repeatedly refresh their forced target while the five-second mark remains active.

### Aegis Shield

Terrain Wall has been removed. Aegis Shield targets a board area and gives nearby allied spirits a shield worth 24% of their maximum health. The spell must be aimed near at least one living ally.

## Non-stacking stat system

For each stat, only the strongest applicable source is used. For example, armour from a class synergy, item, Awakening, positional node, weather effect, Team Blessing, and Buffer spell does not all add together.

Type Bond damage remains a separate composition reward and uses only the highest unlocked type tier.

## Custom assets

Place future files inside:

```text
public/assets/
```

Then edit this section near the beginning of the script in `public/index.html`:

```js
const CUSTOM_ASSETS = {
  unitImages: {
    emberMedic: "assets/ember-medic.png",
    warflare: "assets/warflare.png"
  },
  musicUrl: "assets/aetherboard-theme.mp3"
};
```

A mapped unit image replaces that spirit's emoji in the shop, draft, bench, board, previews, and profile. Units without an image continue using placeholders.

When the client and server are hosted together, leave this blank:

```js
const ONLINE_CONFIG = {
  serverUrl: ""
};
```

## Uploading to GitHub

Upload the extracted contents of this repository to the root of a GitHub repository. The GitHub repository's first page should directly show `public`, `tests`, `server.js`, `package.json`, and the other root files.

Do not upload only the ZIP. Do not upload `node_modules`.

See `GITHUB_UPLOAD_CHECKLIST.md` for the exact checklist.

## Manual Render deployment

This project can be deployed as a normal **Web Service** without using Blueprint.

Use these settings:

```text
Service type: Web Service
Language: Node
Branch: main
Root Directory: leave blank when server.js is at the repository root
Build Command: npm install --omit=dev
Start Command: npm start
Health Check Path: /health
```

Select the available compute plan for your account. The included `render.yaml` is optional and can remain in the repository even when you configure the Web Service manually.

After deployment, open the service URL and then test:

```text
https://YOUR-SERVICE.onrender.com/health
```

## Tests

Run:

```bash
npm test
```

The included server smoke test launches a temporary server and verifies:

- Hardcore Online Duel room creation
- 40-heart starting values
- Two-device room joining
- Formation validation with new Healer and Buffer units
- Aegis Shield action relay
- Grave Idol permanent-death protection
- Hardcore roster-wipe elimination

The browser game has also been tested for the 60-unit catalog, Healer/Buffer coverage across all ten types, Hardcore Local Duel setup without role bans, Aegis Shield application, Focus Banner targeting, and support spell casting.

## Prototype limitations

This remains a casual prototype rather than a production competitive service.

- Active rooms are stored in server memory and disappear if the server restarts.
- There are no accounts, database-backed rankings, public matchmaking, or moderation tools yet.
- A designated participant currently runs the deterministic battle simulation and reports the result. A commercial competitive release should move full battle authority to the server and add stronger validation and anti-cheat.
- Hardcore is available in solo Expedition, Local Duel, and Online Duel. Online Party remains standard mode.
