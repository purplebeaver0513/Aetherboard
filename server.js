import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EventEmitter } from "node:events";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || "0.0.0.0";
const MAX_MESSAGE_BYTES = 650_000;
const ROOM_IDLE_MS = 30 * 60 * 1000;
const RECONNECT_GRACE_MS = 2 * 60 * 1000;
const BATTLE_REPORT_TIMEOUT_MS = 90 * 1000;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const VALID_UNIT_KEYS = new Set([
  "cinderCub", "thornling", "ripplefin", "sparkit", "snowpuff", "gloomimp", "glimmerbug", "pebblit", "breezle", "runelet",
  "frosthorn", "duskmoth", "magmole", "shellsprout", "mosskit", "zapfin", "prismtail", "cloudram", "runebear", "ashwing",
  "bloombeak", "tempestral", "tideclaw", "rootfox", "obsidianOx", "arcwhale", "coralSage", "glacielle", "shadeclaw", "solara",
  "ironroot", "voidseer", "starmage", "voltDrake", "emberWyrm", "blizzardOwl", "sunlion", "terraTitan", "skySerpent", "aetherion"
]);
const VALID_ITEM_KEYS = new Set([
  "swiftFeather", "vitalSeed", "arcCrystal", "ironPlate", "razorFang", "echoShell", "titanHeart", "scholarScroll", "manaBattery",
  "guardianBell", "hunterScope", "drainRune", "nullPrism", "stormCoil", "frostSigil", "emberCharm", "phoenixAsh"
]);
const VALID_BLESSING_KEYS = new Set([
  "battleTraining", "arcaneTutelage", "swiftFormation", "fortifiedLines", "vitalityRite",
  "startingSpark", "healingWinds", "sharpInstinct", "elementalMastery", "warChest"
]);
const BOARD_SIZE = 48;
const PLAYER_BOARD_START = 24;
const BENCH_SIZE = 12;
const MAX_DEPLOYED = 8;
const VALID_COMBAT_ACTIONS = new Set(["freeze", "heal", "wall", "focus"]);
const COMMAND_GCD_MS = 3300;

const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

class SimpleWebSocket extends EventEmitter {
  static OPEN = 1;

  constructor(socket, head = Buffer.alloc(0)) {
    super();
    this.socket = socket;
    this.readyState = SimpleWebSocket.OPEN;
    this.isAlive = true;
    this.buffer = Buffer.alloc(0);
    this.fragmentOpcode = null;
    this.fragments = [];
    socket.on("data", chunk => this.consume(chunk));
    socket.on("close", () => this.finishClose());
    socket.on("end", () => this.finishClose());
    socket.on("error", error => this.emit("error", error));
    if (head?.length) this.consume(head);
  }

  send(data) {
    if (this.readyState !== SimpleWebSocket.OPEN) return;
    const payload = Buffer.from(String(data));
    this.socket.write(this.frame(0x1, payload));
  }

  ping(payload = Buffer.alloc(0)) {
    if (this.readyState !== SimpleWebSocket.OPEN) return;
    this.socket.write(this.frame(0x9, Buffer.from(payload)));
  }

  pong(payload = Buffer.alloc(0)) {
    if (this.readyState !== SimpleWebSocket.OPEN) return;
    this.socket.write(this.frame(0xA, Buffer.from(payload)));
  }

  close(code = 1000, reason = "") {
    if (this.readyState !== SimpleWebSocket.OPEN) return;
    this.readyState = 2;
    const reasonBytes = Buffer.from(String(reason).slice(0, 120));
    const payload = Buffer.alloc(2 + reasonBytes.length);
    payload.writeUInt16BE(code, 0);
    reasonBytes.copy(payload, 2);
    try { this.socket.write(this.frame(0x8, payload)); } catch {}
    this.socket.end();
  }

  terminate() {
    this.readyState = 3;
    this.socket.destroy();
  }

  finishClose() {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.emit("close");
  }

  frame(opcode, payload) {
    const length = payload.length;
    let header;
    if (length < 126) {
      header = Buffer.alloc(2);
      header[1] = length;
    } else if (length <= 0xffff) {
      header = Buffer.alloc(4);
      header[1] = 126;
      header.writeUInt16BE(length, 2);
    } else {
      header = Buffer.alloc(10);
      header[1] = 127;
      header.writeBigUInt64BE(BigInt(length), 2);
    }
    header[0] = 0x80 | opcode;
    return Buffer.concat([header, payload]);
  }

  consume(chunk) {
    if (this.readyState === 3) return;
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      const fin = Boolean(first & 0x80);
      const opcode = first & 0x0f;
      const masked = Boolean(second & 0x80);
      let length = second & 0x7f;
      let offset = 2;
      if (length === 126) {
        if (this.buffer.length < 4) return;
        length = this.buffer.readUInt16BE(2);
        offset = 4;
      } else if (length === 127) {
        if (this.buffer.length < 10) return;
        const largeLength = this.buffer.readBigUInt64BE(2);
        if (largeLength > BigInt(MAX_MESSAGE_BYTES)) {
          this.close(1009, "Message too large");
          return;
        }
        length = Number(largeLength);
        offset = 10;
      }
      if (length > MAX_MESSAGE_BYTES) {
        this.close(1009, "Message too large");
        return;
      }
      if (!masked) {
        this.close(1002, "Client frames must be masked");
        return;
      }
      const total = offset + 4 + length;
      if (this.buffer.length < total) return;
      const mask = this.buffer.subarray(offset, offset + 4);
      offset += 4;
      const payload = Buffer.from(this.buffer.subarray(offset, offset + length));
      for (let index = 0; index < payload.length; index += 1) payload[index] ^= mask[index % 4];
      this.buffer = this.buffer.subarray(total);
      this.handleFrame(opcode, fin, payload);
    }
  }

  handleFrame(opcode, fin, payload) {
    if (opcode === 0x8) {
      if (this.readyState === SimpleWebSocket.OPEN) {
        try { this.socket.write(this.frame(0x8, payload)); } catch {}
      }
      this.socket.end();
      return;
    }
    if (opcode === 0x9) {
      this.pong(payload);
      return;
    }
    if (opcode === 0xA) {
      this.emit("pong", payload);
      return;
    }
    if (opcode === 0x1 || opcode === 0x2) {
      if (fin) {
        this.emit("message", payload);
      } else {
        this.fragmentOpcode = opcode;
        this.fragments = [payload];
      }
      return;
    }
    if (opcode === 0x0 && this.fragmentOpcode !== null) {
      const fragmentBytes = this.fragments.reduce((sum, part) => sum + part.length, 0) + payload.length;
      if (fragmentBytes > MAX_MESSAGE_BYTES) {
        this.close(1009, "Message too large");
        return;
      }
      this.fragments.push(payload);
      if (fin) {
        const full = Buffer.concat(this.fragments);
        this.fragmentOpcode = null;
        this.fragments = [];
        this.emit("message", full);
      }
    }
  }
}

const WebSocket = SimpleWebSocket;

const rooms = new Map();
const socketMeta = new WeakMap();

function jsonSend(ws, type, payload = {}) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return false;
  ws.send(JSON.stringify({ type, ...payload }));
  return true;
}

function safeText(value, fallback = "Commander", max = 16) {
  const clean = String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/[^\p{L}\p{N} _\-'.]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
  return clean || fallback;
}

function seedFromString(value = "") {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function safeCode(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z2-9]/g, "").slice(0, 6);
}

function randomCode() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    let code = "";
    for (let i = 0; i < 6; i += 1) {
      code += CODE_ALPHABET[crypto.randomInt(0, CODE_ALPHABET.length)];
    }
    if (!rooms.has(code)) return code;
  }
  return crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
}

function roomCapacity(kind) {
  return kind === "party" ? 4 : 2;
}

function publicPlayer(player, room) {
  return {
    id: player.id,
    name: player.name,
    seat: player.seat,
    host: room.hostId === player.id,
    connected: player.connected,
    ready: player.ready,
    drafted: player.drafted,
    locked: player.locked,
    hp: player.hp,
    alive: player.alive,
    lastResult: player.lastResult || null
  };
}

function publicRoom(room) {
  const players = [...room.players.values()]
    .sort((a, b) => a.seat - b.seat)
    .map(player => publicPlayer(player, room));
  const connectedPlayers = players.filter(player => player.connected);
  return {
    code: room.code,
    kind: room.kind,
    maxPlayers: room.maxPlayers,
    status: room.status,
    round: room.round,
    hostId: room.hostId,
    players,
    canStart:
      room.status === "lobby" &&
      connectedPlayers.length >= 2 &&
      connectedPlayers.length === players.length &&
      connectedPlayers.every(player => player.ready),
    createdAt: room.createdAt
  };
}

function broadcast(room, type, payload = {}, filter = null) {
  for (const player of room.players.values()) {
    if (filter && !filter(player)) continue;
    jsonSend(player.ws, type, payload);
  }
}

function broadcastRoom(room) {
  room.lastActivity = Date.now();
  broadcast(room, "room-state", { room: publicRoom(room) });
}

function nextSeat(room) {
  const used = new Set([...room.players.values()].map(player => player.seat));
  for (let seat = 0; seat < room.maxPlayers; seat += 1) {
    if (!used.has(seat)) return seat;
  }
  return room.players.size;
}

function ensureRoomHost(room) {
  const current = room.players.get(room.hostId);
  if (current?.connected && current.alive) return current;
  const ordered = [...room.players.values()].sort((a, b) => a.seat - b.seat);
  const replacement = ordered.find(player => player.connected && player.alive)
    || ordered.find(player => player.connected)
    || ordered.find(player => player.alive)
    || ordered[0]
    || null;
  room.hostId = replacement?.id || null;
  return replacement;
}

function makePlayer(ws, name, room) {
  return {
    id: crypto.randomUUID(),
    token: crypto.randomBytes(24).toString("base64url"),
    name: safeText(name),
    seat: nextSeat(room),
    ws,
    connected: true,
    ready: false,
    drafted: false,
    locked: false,
    hp: 30,
    alive: true,
    snapshot: null,
    lastResult: null,
    disconnectedAt: null,
    joinedAt: Date.now()
  };
}

function attachSocket(ws, room, player) {
  player.ws = ws;
  player.connected = true;
  player.disconnectedAt = null;
  socketMeta.set(ws, { roomCode: room.code, playerId: player.id });
  room.lastActivity = Date.now();
}

function playerFromSocket(ws) {
  const meta = socketMeta.get(ws);
  if (!meta) return { room: null, player: null };
  const room = rooms.get(meta.roomCode);
  const player = room?.players.get(meta.playerId) || null;
  return { room, player };
}

function sanitizeUnit(raw, fallbackId) {
  if (!raw || typeof raw !== "object") return null;
  const defKey = String(raw.defKey || "").slice(0, 40);
  if (!VALID_UNIT_KEYS.has(defKey)) return null;
  const id = String(raw.id || fallbackId || crypto.randomUUID()).slice(0, 80);
  const items = Array.isArray(raw.items)
    ? [...new Set(raw.items.map(value => String(value).slice(0, 40)).filter(value => VALID_ITEM_KEYS.has(value)))].slice(0, 2)
    : [];
  return {
    id,
    defKey,
    star: Math.max(1, Math.min(3, Number(raw.star) || 1)),
    awakening: ["force", "guard"].includes(raw.awakening) ? raw.awakening : null,
    items
  };
}

function sanitizeSnapshot(raw) {
  if (!raw || typeof raw !== "object") return null;
  let rawSize = 0;
  try {
    rawSize = Buffer.byteLength(JSON.stringify(raw));
  } catch {
    return null;
  }
  if (rawSize > 500_000) return null;

  const units = {};
  const aliases = new Map();
  const rawUnits = raw.units && typeof raw.units === "object" ? raw.units : {};
  for (const [key, value] of Object.entries(rawUnits).slice(0, 24)) {
    const unit = sanitizeUnit(value, key);
    if (!unit || units[unit.id]) continue;
    units[unit.id] = unit;
    aliases.set(String(key), unit.id);
    aliases.set(unit.id, unit.id);
  }

  const resolveId = value => aliases.get(String(value || "")) || null;
  const seenPlacements = new Set();
  let deployed = 0;
  const rawBoard = Array.isArray(raw.board) ? raw.board.slice(0, BOARD_SIZE) : [];
  while (rawBoard.length < BOARD_SIZE) rawBoard.push(null);
  const board = rawBoard.map((value, index) => {
    if (index < PLAYER_BOARD_START || deployed >= MAX_DEPLOYED) return null;
    const id = resolveId(value);
    if (!id || seenPlacements.has(id)) return null;
    seenPlacements.add(id);
    deployed += 1;
    return id;
  });

  const rawBench = Array.isArray(raw.bench) ? raw.bench.slice(0, BENCH_SIZE) : [];
  while (rawBench.length < BENCH_SIZE) rawBench.push(null);
  const bench = rawBench.map(value => {
    const id = resolveId(value);
    if (!id || seenPlacements.has(id)) return null;
    seenPlacements.add(id);
    return id;
  });

  return {
    commanderName: safeText(raw.commanderName),
    hp: Math.max(0, Math.min(30, Number(raw.hp) || 30)),
    gold: Math.max(0, Math.min(9999, Number(raw.gold) || 0)),
    level: Math.max(3, Math.min(8, Number(raw.level) || 3)),
    xp: Math.max(0, Math.min(9999, Number(raw.xp) || 0)),
    board,
    bench,
    units,
    shop: Array.isArray(raw.shop)
      ? raw.shop.slice(0, 5).map(value => VALID_UNIT_KEYS.has(String(value)) ? String(value) : null)
      : Array(5).fill(null),
    shopLocked: Boolean(raw.shopLocked),
    inventory: Array.isArray(raw.inventory)
      ? raw.inventory.slice(0, 30).map(value => String(value).slice(0, 40)).filter(value => VALID_ITEM_KEYS.has(value))
      : [],
    blessings: Array.isArray(raw.blessings)
      ? [...new Set(raw.blessings.slice(0, 20).map(value => String(value).slice(0, 40)).filter(value => VALID_BLESSING_KEYS.has(value)))]
      : [],
    pendingItemRewards: Math.max(0, Math.min(20, Number(raw.pendingItemRewards) || 0)),
    pendingBlessingRewards: Math.max(0, Math.min(20, Number(raw.pendingBlessingRewards) || 0)),
    streak: Math.max(-999, Math.min(999, Number(raw.streak) || 0)),
    battleLog: Array.isArray(raw.battleLog) ? raw.battleLog.slice(-40).map(entry => ({
      text: safeText(entry?.text, "Battle update", 180),
      type: ["good", "bad", "gold", ""].includes(entry?.type) ? entry.type : ""
    })) : [],
    tutorialSeen: Boolean(raw.tutorialSeen),
    draftComplete: Boolean(raw.draftComplete),
    draftPicksRemaining: Math.max(0, Math.min(3, Number(raw.draftPicksRemaining) || 0)),
    draftHistory: Array.isArray(raw.draftHistory)
      ? raw.draftHistory.slice(0, 3).map(value => String(value).slice(0, 40)).filter(value => VALID_UNIT_KEYS.has(value))
      : []
  };
}

function createRoom(ws, message) {
  if (socketMeta.has(ws)) return jsonSend(ws, "error", { code: "ALREADY_IN_ROOM", message: "Leave the current lobby before creating another one." });
  const kind = message.kind === "party" ? "party" : "duel";
  const code = randomCode();
  const room = {
    code,
    kind,
    maxPlayers: roomCapacity(kind),
    hostId: null,
    status: "lobby",
    round: 1,
    players: new Map(),
    battles: new Map(),
    roundResults: new Map(),
    createdAt: Date.now(),
    lastActivity: Date.now()
  };
  const player = makePlayer(ws, message.name, room);
  room.players.set(player.id, player);
  room.hostId = player.id;
  rooms.set(code, room);
  attachSocket(ws, room, player);
  jsonSend(ws, "room-joined", { playerId: player.id, token: player.token, room: publicRoom(room) });
  broadcastRoom(room);
}

function joinRoom(ws, message) {
  if (socketMeta.has(ws)) return jsonSend(ws, "error", { code: "ALREADY_IN_ROOM", message: "Leave the current lobby before joining another one." });
  const code = safeCode(message.code);
  const room = rooms.get(code);
  if (!room) return jsonSend(ws, "error", { code: "ROOM_NOT_FOUND", message: "That lobby code was not found." });
  if (room.status !== "lobby") return jsonSend(ws, "error", { code: "MATCH_STARTED", message: "That lobby has already started." });
  if (room.players.size >= room.maxPlayers) return jsonSend(ws, "error", { code: "ROOM_FULL", message: "That lobby is full." });
  const player = makePlayer(ws, message.name, room);
  room.players.set(player.id, player);
  attachSocket(ws, room, player);
  jsonSend(ws, "room-joined", { playerId: player.id, token: player.token, room: publicRoom(room) });
  broadcastRoom(room);
}

function resumeRoom(ws, message) {
  const room = rooms.get(safeCode(message.code));
  const playerId = String(message.playerId || "");
  const token = String(message.token || "");
  const player = room?.players.get(playerId);
  if (!room || !player || !token || token !== player.token) {
    return jsonSend(ws, "resume-failed", { message: "The previous online session could not be restored." });
  }
  if (player.ws && player.ws !== ws && player.ws.readyState === WebSocket.OPEN) {
    try { player.ws.close(4001, "Session resumed elsewhere"); } catch {}
  }
  attachSocket(ws, room, player);
  jsonSend(ws, "room-resumed", { playerId: player.id, token: player.token, room: publicRoom(room) });
  broadcastRoom(room);

  if (room.status === "draft") {
    jsonSend(ws, "match-start", { room: publicRoom(room), reconnect: true, selfSnapshot: player.snapshot });
  } else if (room.status === "planning") {
    jsonSend(ws, "planning-start", {
      room: publicRoom(room),
      round: room.round,
      reconnect: true,
      selfSnapshot: player.snapshot,
      selfLocked: player.locked
    });
  } else if (room.status === "battle") {
    const battle = [...room.battles.values()].find(item => !item.resolved && item.participantIds.includes(player.id));
    if (battle) sendBattleToPlayer(room, battle, player);
  } else if (room.status === "complete") {
    const alive = [...room.players.values()].filter(item => item.alive);
    jsonSend(ws, "match-ended", { room: publicRoom(room), winnerId: alive.length === 1 ? alive[0].id : null });
  }
}

function removeFromLobby(room, player) {
  room.players.delete(player.id);
  if (room.hostId === player.id) {
    room.hostId = [...room.players.values()].sort((a, b) => a.seat - b.seat)[0]?.id || null;
  }
  if (!room.players.size) rooms.delete(room.code);
  else broadcastRoom(room);
}

function surrenderPlayer(room, player) {
  player.alive = false;
  player.hp = 0;
  player.locked = true;
  player.ready = false;
  player.lastResult = "Surrendered";
  if (room.hostId === player.id) ensureRoomHost(room);
  if (room.status === "battle") {
    for (const battle of room.battles.values()) {
      if (battle.resolved || !battle.participantIds.includes(player.id)) continue;
      const winnerSide = battle.aId === player.id ? "b" : "a";
      resolveBattle(room, battle, winnerSide, 3, false, true);
    }
  } else {
    maybeAdvanceAfterPlayerChange(room);
  }
  broadcastRoom(room);
}

function leaveRoom(ws, explicit = true) {
  const { room, player } = playerFromSocket(ws);
  if (!room || !player) return;
  socketMeta.delete(ws);

  // A reconnect can replace a player's socket before the old socket's close event fires.
  // Ignore that stale close so it cannot mark the newly resumed session offline.
  if (player.ws && player.ws !== ws) return;

  if (room.status === "lobby" || room.status === "complete") {
    removeFromLobby(room, player);
    return;
  }
  if (explicit) {
    player.connected = false;
    player.disconnectedAt = Date.now();
    if (room.hostId === player.id) ensureRoomHost(room);
    surrenderPlayer(room, player);
    return;
  }

  player.connected = false;
  player.disconnectedAt = Date.now();
  if (room.hostId === player.id) ensureRoomHost(room);

  // If the disconnected player was responsible for reporting a direct battle,
  // hand authority to the connected opponent so the round does not stall.
  if (room.status === "battle") {
    for (const battle of room.battles.values()) {
      if (battle.resolved || battle.authorityId !== player.id || battle.ghost) continue;
      const replacementId = battle.participantIds.find(id => id !== player.id && room.players.get(id)?.connected);
      if (!replacementId) continue;
      battle.authorityId = replacementId;
      const replacement = room.players.get(replacementId);
      if (replacement) sendBattleToPlayer(room, battle, replacement);
    }
  }
  broadcastRoom(room);
}

function startMatch(room) {
  room.status = "draft";
  room.round = 1;
  room.battles.clear();
  room.roundResults.clear();
  for (const player of room.players.values()) {
    player.ready = false;
    player.drafted = false;
    player.locked = false;
    player.hp = 30;
    player.alive = true;
    player.snapshot = null;
    player.lastResult = null;
  }
  broadcast(room, "match-start", { room: publicRoom(room), reconnect: false });
  broadcastRoom(room);
}

function allActive(room, predicate) {
  const active = [...room.players.values()].filter(player => player.alive);
  return active.length > 0 && active.every(predicate);
}

function startPlanning(room) {
  room.status = "planning";
  for (const player of room.players.values()) {
    if (!player.alive) continue;
    player.locked = false;
    player.lastResult = null;
  }
  broadcast(room, "planning-start", { room: publicRoom(room), round: room.round, reconnect: false });
  broadcastRoom(room);
}

function roundPairings(players, round) {
  const sorted = [...players].sort((a, b) => a.seat - b.seat);
  if (sorted.length === 2) return [{ a: sorted[0], b: sorted[1], ghost: false }];
  if (sorted.length === 3) {
    const cycle = (round - 1) % 3;
    const direct = [
      [0, 1, 2, 0],
      [1, 2, 0, 1],
      [2, 0, 1, 2]
    ][cycle];
    return [
      { a: sorted[direct[0]], b: sorted[direct[1]], ghost: false },
      { a: sorted[direct[2]], b: sorted[direct[3]], ghost: true }
    ];
  }
  if (sorted.length >= 4) {
    const cycle = (round - 1) % 3;
    const schedules = [
      [[0, 1], [2, 3]],
      [[0, 2], [1, 3]],
      [[0, 3], [1, 2]]
    ];
    return schedules[cycle].map(([a, b]) => ({ a: sorted[a], b: sorted[b], ghost: false }));
  }
  return [];
}

function battlePayload(room, battle, player) {
  const a = room.players.get(battle.aId);
  const b = room.players.get(battle.bId);
  return {
    battle: {
      id: battle.id,
      round: battle.round,
      seed: battle.seed,
      environmentSeed: battle.environmentSeed,
      actionLog: battle.actionLog || [],
      authorityId: battle.authorityId,
      youSide: player.id === battle.aId ? "a" : "b",
      ghost: battle.ghost,
      ghostOwnerId: battle.ghost ? battle.bId : null,
      a: { id: a.id, name: a.name, snapshot: battle.aSnapshot },
      b: { id: b.id, name: b.name, snapshot: battle.bSnapshot }
    },
    room: publicRoom(room)
  };
}

function sendBattleToPlayer(room, battle, player) {
  jsonSend(player.ws, "battle-start", battlePayload(room, battle, player));
}

function beginBattles(room) {
  const active = [...room.players.values()].filter(player => player.alive && player.snapshot);
  const pairings = roundPairings(active, room.round);
  if (!pairings.length) return finishMatchIfNeeded(room);

  room.status = "battle";
  room.battles.clear();
  room.roundResults.clear();

  for (const pairing of pairings) {
    const battle = {
      id: crypto.randomUUID(),
      round: room.round,
      seed: crypto.randomInt(1, 2_147_483_647),
      environmentSeed: seedFromString(room.code),
      aId: pairing.a.id,
      bId: pairing.b.id,
      aSnapshot: pairing.a.snapshot,
      bSnapshot: pairing.b.snapshot,
      ghost: pairing.ghost,
      authorityId: pairing.a.id,
      participantIds: pairing.ghost ? [pairing.a.id] : [pairing.a.id, pairing.b.id],
      startedAt: Date.now(),
      actionLog: [],
      actionUsage: new Map(),
      resolved: false,
      result: null
    };
    room.battles.set(battle.id, battle);
    sendBattleToPlayer(room, battle, pairing.a);
    if (!pairing.ghost) sendBattleToPlayer(room, battle, pairing.b);
  }
  broadcastRoom(room);
}

function addRoundResult(room, playerId, result) {
  if (!playerId) return;
  const previous = room.roundResults.get(playerId) || { battles: [], won: 0, lost: 0, damageTaken: 0 };
  previous.battles.push(result);
  if (result.won) previous.won += 1;
  if (result.lost) previous.lost += 1;
  previous.damageTaken += result.damageTaken || 0;
  room.roundResults.set(playerId, previous);
}

function resolveBattle(room, battle, winnerSide, survivorPower, timedOut = false, forced = false) {
  if (!battle || battle.resolved) return;
  const a = room.players.get(battle.aId);
  const b = room.players.get(battle.bId);
  if (!a || !b) return;

  const winningPlayer = winnerSide === "b" ? b : a;
  const losingPlayer = winnerSide === "b" ? a : b;
  const power = Math.max(0, Math.min(12, Number(survivorPower) || 0));
  const damage = Math.max(3, Math.min(15, 3 + power));
  let damagedPlayer = null;

  if (battle.ghost) {
    if (winnerSide === "b") {
      a.hp = Math.max(0, a.hp - damage);
      a.alive = a.hp > 0;
      a.lastResult = `Lost to ${b.name}'s ghost · -${damage} heart`;
      damagedPlayer = a;
      addRoundResult(room, a.id, {
        battleId: battle.id,
        opponentId: b.id,
        opponentName: `${b.name} (ghost)`,
        won: false,
        lost: true,
        ghost: true,
        damageTaken: damage,
        damageDealt: 0,
        timedOut
      });
    } else {
      a.lastResult = `Defeated ${b.name}'s ghost`;
      addRoundResult(room, a.id, {
        battleId: battle.id,
        opponentId: b.id,
        opponentName: `${b.name} (ghost)`,
        won: true,
        lost: false,
        ghost: true,
        damageTaken: 0,
        damageDealt: 0,
        timedOut
      });
    }
  } else {
    losingPlayer.hp = Math.max(0, losingPlayer.hp - damage);
    losingPlayer.alive = losingPlayer.hp > 0;
    winningPlayer.lastResult = `Defeated ${losingPlayer.name}`;
    losingPlayer.lastResult = `Lost to ${winningPlayer.name} · -${damage} heart`;
    damagedPlayer = losingPlayer;
    addRoundResult(room, winningPlayer.id, {
      battleId: battle.id,
      opponentId: losingPlayer.id,
      opponentName: losingPlayer.name,
      won: true,
      lost: false,
      ghost: false,
      damageTaken: 0,
      damageDealt: damage,
      timedOut
    });
    addRoundResult(room, losingPlayer.id, {
      battleId: battle.id,
      opponentId: winningPlayer.id,
      opponentName: winningPlayer.name,
      won: false,
      lost: true,
      ghost: false,
      damageTaken: damage,
      damageDealt: 0,
      timedOut
    });
  }

  battle.resolved = true;
  battle.result = {
    winnerSide,
    winnerId: winningPlayer.id,
    loserId: battle.ghost && winnerSide === "a" ? null : losingPlayer.id,
    damage: damagedPlayer ? damage : 0,
    timedOut,
    forced
  };

  for (const participantId of battle.participantIds) {
    const participant = room.players.get(participantId);
    jsonSend(participant?.ws, "battle-resolved", {
      battleId: battle.id,
      result: battle.result,
      room: publicRoom(room)
    });
  }

  if ([...room.battles.values()].every(item => item.resolved)) completeRound(room);
  else broadcastRoom(room);
}

function completeRound(room) {
  const completedRound = room.round;
  const alive = [...room.players.values()].filter(player => player.alive);
  if (alive.length <= 1) {
    room.status = "complete";
    ensureRoomHost(room);
    broadcast(room, "match-ended", {
      room: publicRoom(room),
      winnerId: alive.length === 1 ? alive[0].id : null,
      completedRound,
      results: Object.fromEntries(room.roundResults)
    });
    broadcastRoom(room);
    return;
  }

  room.round += 1;
  room.status = "planning";
  for (const player of room.players.values()) {
    player.locked = false;
    if (player.alive) player.snapshot = null;
  }
  broadcast(room, "round-complete", {
    completedRound,
    nextRound: room.round,
    results: Object.fromEntries(room.roundResults),
    room: publicRoom(room)
  });
  room.battles.clear();
  room.roundResults.clear();
  broadcastRoom(room);
}

function finishMatchIfNeeded(room) {
  const alive = [...room.players.values()].filter(player => player.alive);
  if (alive.length <= 1 && room.status !== "lobby") {
    room.status = "complete";
    ensureRoomHost(room);
    broadcast(room, "match-ended", {
      room: publicRoom(room),
      winnerId: alive.length === 1 ? alive[0].id : null,
      completedRound: room.round
    });
  }
}

function maybeAdvanceAfterPlayerChange(room) {
  finishMatchIfNeeded(room);
  if (room.status === "planning" && allActive(room, player => player.locked && player.snapshot)) beginBattles(room);
}

function resetToLobby(room) {
  room.status = "lobby";
  room.round = 1;
  room.battles.clear();
  room.roundResults.clear();
  for (const player of room.players.values()) {
    player.ready = false;
    player.drafted = false;
    player.locked = false;
    player.hp = 30;
    player.alive = true;
    player.snapshot = null;
    player.lastResult = null;
  }
  broadcast(room, "returned-to-lobby", { room: publicRoom(room) });
  broadcastRoom(room);
}

function relayCombatAction(room, battle, player, message) {
  if (!battle || battle.resolved || room.status !== "battle") return;
  if (!battle.participantIds.includes(player.id)) {
    return jsonSend(player.ws, "error", { code: "NOT_PARTICIPANT", message: "You are not a participant in this battle." });
  }

  const actionType = String(message.actionType || "");
  if (!VALID_COMBAT_ACTIONS.has(actionType)) {
    return jsonSend(player.ws, "error", { code: "BAD_ACTION", message: "Unknown commander action." });
  }

  const now = Date.now();
  const usage = battle.actionUsage.get(player.id) || { spellUsed: false, focusUsed: false, lastAt: 0 };
  if (now - usage.lastAt < COMMAND_GCD_MS) {
    return jsonSend(player.ws, "error", { code: "COMMAND_COOLDOWN", message: "Commander actions share a short global cooldown." });
  }
  if (actionType === "focus" && usage.focusUsed) {
    return jsonSend(player.ws, "error", { code: "FOCUS_USED", message: "Your Focus Banner was already used this battle." });
  }
  if (actionType !== "focus" && usage.spellUsed) {
    return jsonSend(player.ws, "error", { code: "SPELL_USED", message: "Your commander spell was already used this battle." });
  }

  let cellIndex = null;
  if (actionType !== "focus") {
    const parsed = Number(message.cellIndex);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed >= BOARD_SIZE) {
      return jsonSend(player.ws, "error", { code: "BAD_TARGET", message: "Choose a valid board tile." });
    }
    cellIndex = parsed;
  }

  const rawActionId = String(message.clientActionId || "").replace(/[^A-Za-z0-9_\-:.]/g, "").slice(0, 80);
  const rawSourceId = String(message.targetSourceId || "").replace(/[^A-Za-z0-9_\-:.]/g, "").slice(0, 100);
  const fallbackX = Number(message.fallbackX);
  const fallbackY = Number(message.fallbackY);
  const action = {
    actionId: rawActionId || crypto.randomUUID(),
    actorId: player.id,
    type: actionType,
    cellIndex,
    targetSourceId: actionType === "focus" ? (rawSourceId || null) : null,
    fallbackX: Number.isFinite(fallbackX) ? Math.max(0, Math.min(7, fallbackX)) : null,
    fallbackY: Number.isFinite(fallbackY) ? Math.max(0, Math.min(5, fallbackY)) : null,
    atMs: Math.max(0, Math.min(45_000, now - battle.startedAt))
  };

  if (battle.actionLog.some(entry => entry.actionId === action.actionId)) return;
  if (actionType === "focus") usage.focusUsed = true;
  else usage.spellUsed = true;
  usage.lastAt = now;
  battle.actionUsage.set(player.id, usage);
  battle.actionLog.push(action);
  if (battle.actionLog.length > 12) battle.actionLog.shift();

  for (const participantId of battle.participantIds) {
    const participant = room.players.get(participantId);
    jsonSend(participant?.ws, "combat-action", { battleId: battle.id, action });
  }
}

function handleMessage(ws, message) {
  const type = String(message?.type || "");
  if (type === "create-room") return createRoom(ws, message);
  if (type === "join-room") return joinRoom(ws, message);
  if (type === "resume-room") return resumeRoom(ws, message);
  if (type === "ping") return jsonSend(ws, "pong", { now: Date.now() });

  const { room, player } = playerFromSocket(ws);
  if (!room || !player) return jsonSend(ws, "error", { code: "NOT_IN_ROOM", message: "Join a lobby first." });
  room.lastActivity = Date.now();

  switch (type) {
    case "set-ready": {
      if (room.status !== "lobby") return;
      player.ready = Boolean(message.ready);
      broadcastRoom(room);
      break;
    }
    case "update-name": {
      player.name = safeText(message.name, player.name);
      broadcastRoom(room);
      break;
    }
    case "start-match": {
      if (room.hostId !== player.id) return jsonSend(ws, "error", { code: "HOST_ONLY", message: "Only the host can start the match." });
      const roomState = publicRoom(room);
      if (!roomState.canStart) return jsonSend(ws, "error", { code: "NOT_READY", message: "Everyone must be connected and ready." });
      startMatch(room);
      break;
    }
    case "draft-complete": {
      if (room.status !== "draft" || !player.alive) return;
      player.drafted = true;
      if (allActive(room, item => item.drafted)) startPlanning(room);
      else broadcastRoom(room);
      break;
    }
    case "submit-formation": {
      if (room.status !== "planning" || !player.alive || player.locked) return;
      const snapshot = sanitizeSnapshot(message.snapshot);
      if (!snapshot) return jsonSend(ws, "error", { code: "BAD_SNAPSHOT", message: "The formation data could not be accepted." });
      player.snapshot = snapshot;
      player.locked = true;
      player.name = safeText(snapshot.commanderName || player.name, player.name);
      if (allActive(room, item => item.locked && item.snapshot)) beginBattles(room);
      else broadcastRoom(room);
      break;
    }
    case "combat-action": {
      if (room.status !== "battle") return;
      const battle = room.battles.get(String(message.battleId || ""));
      if (!battle || battle.resolved) return;
      relayCombatAction(room, battle, player, message);
      break;
    }
    case "battle-result": {
      if (room.status !== "battle") return;
      const battle = room.battles.get(String(message.battleId || ""));
      if (!battle || battle.resolved) return;
      if (battle.authorityId !== player.id) return jsonSend(ws, "error", { code: "NOT_AUTHORITY", message: "This client is not the battle authority." });
      const winnerSide = message.winnerSide === "b" ? "b" : "a";
      resolveBattle(room, battle, winnerSide, message.survivorPower, Boolean(message.timedOut));
      break;
    }
    case "return-lobby": {
      if (room.hostId !== player.id) return jsonSend(ws, "error", { code: "HOST_ONLY", message: "Only the host can return the room to the lobby." });
      if (room.status !== "complete") return;
      resetToLobby(room);
      break;
    }
    case "surrender": {
      if (room.status === "lobby") removeFromLobby(room, player);
      else surrenderPlayer(room, player);
      break;
    }
    case "leave-room": {
      leaveRoom(ws, true);
      jsonSend(ws, "left-room");
      break;
    }
    default:
      jsonSend(ws, "error", { code: "UNKNOWN_MESSAGE", message: "Unknown online action." });
  }
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav"
};

function serveFile(req, res) {
  let requestUrl;
  try {
    requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }
  if (requestUrl.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size, uptime: Math.round(process.uptime()) }));
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }
  if (pathname === "/") pathname = "/index.html";
  const absolute = path.resolve(PUBLIC_DIR, `.${pathname}`);
  if (absolute !== PUBLIC_DIR && !absolute.startsWith(`${PUBLIC_DIR}${path.sep}`)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.stat(absolute, (error, stat) => {
    if (error || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const headers = {
      "Content-Type": mimeTypes[path.extname(absolute).toLowerCase()] || "application/octet-stream",
      "Cache-Control": path.basename(absolute) === "index.html" ? "no-store" : "public, max-age=3600"
    };
    res.writeHead(200, headers);
    fs.createReadStream(absolute).pipe(res);
  });
}

const server = http.createServer(serveFile);
const sockets = new Set();

function acceptWebSocket(request, socket, head) {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const key = request.headers["sec-websocket-key"];
  if (requestUrl.pathname !== "/socket" || !key || String(request.headers.upgrade || "").toLowerCase() !== "websocket") {
    socket.write("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
    socket.destroy();
    return;
  }
  const accept = crypto.createHash("sha1").update(String(key) + WS_GUID).digest("base64");
  socket.write([
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
    "\r\n"
  ].join("\r\n"));

  const ws = new SimpleWebSocket(socket, head);
  sockets.add(ws);
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });
  jsonSend(ws, "connected", { serverTime: Date.now() });
  ws.on("message", data => {
    if (data.length > MAX_MESSAGE_BYTES) {
      ws.close(1009, "Message too large");
      return;
    }
    let message;
    try {
      message = JSON.parse(data.toString("utf8"));
    } catch {
      jsonSend(ws, "error", { code: "BAD_JSON", message: "The server received invalid JSON." });
      return;
    }
    try {
      handleMessage(ws, message);
    } catch (error) {
      console.error("Online message error", error);
      jsonSend(ws, "error", { code: "SERVER_ERROR", message: "The online server hit an unexpected error." });
    }
  });
  ws.on("close", () => {
    sockets.delete(ws);
    leaveRoom(ws, false);
  });
  ws.on("error", error => console.warn("WebSocket error", error.message));
}

server.on("upgrade", acceptWebSocket);

const heartbeat = setInterval(() => {
  for (const ws of sockets) {
    if (ws.isAlive === false) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
}, 30_000);

const cleanup = setInterval(() => {
  const now = Date.now();
  for (const room of rooms.values()) {
    if (room.status === "battle") {
      const overdue = [...room.battles.values()].filter(battle =>
        !battle.resolved && now - (battle.startedAt || now) > BATTLE_REPORT_TIMEOUT_MS
      );
      for (const battle of overdue) {
        const aConnected = room.players.get(battle.aId)?.connected;
        const bConnected = room.players.get(battle.bId)?.connected;
        const winnerSide = aConnected && !bConnected ? "a"
          : bConnected && !aConnected ? "b"
            : battle.seed % 2 === 0 ? "a" : "b";
        resolveBattle(room, battle, winnerSide, 0, true, true);
      }
    }
    for (const player of [...room.players.values()]) {
      if (!player.connected && player.disconnectedAt && now - player.disconnectedAt > RECONNECT_GRACE_MS) {
        if (room.status === "lobby") removeFromLobby(room, player);
        else if (player.alive) surrenderPlayer(room, player);
      }
    }
    if (rooms.has(room.code) && now - room.lastActivity > ROOM_IDLE_MS) {
      broadcast(room, "room-closed", { message: "The lobby closed after being inactive." });
      for (const player of room.players.values()) {
        try { player.ws?.close(4000, "Room inactive"); } catch {}
      }
      rooms.delete(room.code);
    }
  }
}, 15_000);

server.listen(PORT, HOST, () => {
  console.log(`Aetherboard Online listening on http://${HOST}:${PORT}`);
});

function shutdown() {
  clearInterval(heartbeat);
  clearInterval(cleanup);
  for (const ws of sockets) {
    try { ws.close(1001, "Server shutting down"); } catch {}
  }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
