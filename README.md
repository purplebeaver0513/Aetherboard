# Aetherboard Arena — Cross-Device Online Multiplayer

This package upgrades Aetherboard from same-device multiplayer to real-time online play. Players can create a private lobby, share a six-character code or invite link, and play from separate computers, tablets, or phones.

The existing solo modes, Local Duel, Vanguard balance changes, placeholder music, expanded items, Team Blessings, and custom-asset hooks remain included.

## Online modes

### Online Duel

- Exactly two players on separate devices
- Private room code and shareable invite link
- Both players draft and plan privately
- Formations are revealed only after both players lock in
- The duel continues until one commander reaches zero heart

### Online Party

- Two to four players on separate devices
- Private room code and shareable invite link
- Rotating matchups each round
- Four-player rooms rotate through all pairings over a three-round cycle
- In a three-player room, one player receives a ghost matchup so everyone still battles each round
- Eliminated players may remain in the room to see the winner
- The last surviving commander wins

## What the online server does

The browser clients maintain a live WebSocket connection to `server.js`. The server manages:

- Room creation and six-character lobby codes
- Joining, ready states, host controls, and starting matches
- Two-player and two-to-four-player party rosters
- Reconnection tokens and a two-minute reconnect grace period
- Private formation submission
- Matchup assignment and deterministic battle seeds
- Heart damage, elimination, round advancement, and final winners
- Static hosting for the game itself

Rooms are currently stored in server memory. Restarting or redeploying the server closes active rooms.

## Fast local setup

### Requirements

- Node.js 22 or newer
- Devices connected to the same local network for local cross-device testing

### Start the server

Open a terminal in this folder and run:

```bash
npm start
```

Then open:

```text
http://localhost:8080
```

### Connect another device on the same Wi-Fi

1. On the computer running the server, find its local IPv4 address.
   - Windows: run `ipconfig` and look for **IPv4 Address**.
   - macOS/Linux: run `ifconfig` or `ip addr`.
2. On the second device, open the same address with port 8080. For example:

```text
http://192.168.1.25:8080
```

3. Allow Node.js through the host computer's firewall when prompted.
4. One player creates an Online Duel or Online Party. The others join with the displayed code or copied invite link.

The second device must use the host computer's local address, not `localhost`.

## Put it on the public internet

A standalone HTML file or GitHub Pages cannot run the multiplayer server by itself. The included Node web service needs to be deployed to a host that supports persistent WebSocket connections.

### Render deployment using the included Blueprint

1. Put this complete folder in a GitHub repository.
2. In Render, create a new **Blueprint** and select that repository.
3. Render reads the included `render.yaml` file.
4. Deploy the `aetherboard-online` web service.
5. Open the generated HTTPS address on every device.

The page automatically connects to the same host using secure `wss://` WebSockets, so no URL editing is needed when the frontend and server are deployed together.

Relevant Render documentation:

- [WebSockets on Render](https://render.com/docs/websocket)
- [Blueprint YAML reference](https://render.com/docs/blueprint-spec)
- [Free web-service limitations](https://render.com/docs/free)

Render's Free web services may spin down when idle, so the first connection after inactivity can take longer. Active rooms are memory-only and disappear whenever the service restarts or spins down.

### Manual Render settings

The included settings are:

```text
Runtime: Node
Build command: npm install
Start command: npm start
Health check: /health
```

### Host the frontend separately

By default, `public/index.html` connects to `/socket` on the same host. To use a separate server, change this section:

```js
const ONLINE_CONFIG = {
  serverUrl: "wss://your-server.example/socket"
};
```

Always use `wss://` for an internet deployment served over HTTPS.

## Lobby flow

1. Enter a commander name on the title screen.
2. Choose **Online Duel** or **Online Party**.
3. Select **Play Now**.
4. Create a private lobby or enter an existing lobby code.
5. Share the code or invite link.
6. Every player marks **Ready**.
7. The host starts the match.
8. Everyone drafts three starter spirits independently.
9. Everyone plans and locks a private formation.
10. Battles begin automatically when all surviving players are locked in.

## Reconnection behavior

- The server holds a disconnected player's slot for two minutes.
- The browser stores the private draft, shop, bench, inventory, and formation locally for that lobby.
- A temporary connection interruption on the same device attempts to reconnect automatically.
- Opening the same reconnect token on a replacement tab or browser session replaces the older socket.
- If private local planning data is deleted before it was submitted, the server cannot reconstruct the hidden shop and bench safely; the player must leave that match.

## Current prototype limitations

This is a functional casual multiplayer prototype, not yet a production competitive service.

- No accounts, passwords, friends list, public matchmaking, chat, or permanent database
- Rooms live only in the memory of one server process
- One participant is designated to calculate and report each deterministic battle result
- The server validates and limits messages and damage, but it is not fully cheat-proof
- Horizontal multi-server scaling would require shared room state, such as Redis or a database

For a commercial competitive version, move the complete battle simulation to the server, add authenticated accounts, persistent storage, rate limiting, moderation tools, telemetry, and server-side anti-cheat validation.

## Custom artwork and music

The project still includes centralized placeholder hooks in `public/index.html`:

```js
const CUSTOM_ASSETS = {
  unitImages: {
    // cinderCub: "assets/cinder-cub.png",
    // ripplefin: "assets/ripplefin.png"
  },
  musicUrl: ""
};
```

Place future files inside `public/assets/` and add their relative paths. Custom spirit images replace emoji placeholders throughout the board, bench, shop, starter draft, selected-spirit panel, and enemy preview. Setting `musicUrl` replaces the procedural placeholder soundtrack.

## Project structure

```text
aetherboard_auto_chess_v5_online/
├── public/
│   └── index.html          Game client and all current game content
├── tests/
│   └── server-smoke-test.mjs
├── server.js               HTTP and WebSocket lobby server
├── package.json
├── package-lock.json
├── render.yaml             One-service Render deployment
├── Dockerfile              Optional container deployment
└── README.md
```

## Testing

Run the server protocol smoke tests with:

```bash
npm run test:server
```

The test covers:

- Creating and joining a duel lobby
- Ready/start/draft/planning flow
- Formation submission and round completion
- Battle-authority reassignment after a disconnect
- Three-player party pairings and ghost battles
- Replacing an old socket with a resumed session

A health endpoint is available at:

```text
/health
```
