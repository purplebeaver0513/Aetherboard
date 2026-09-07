# Version 9 — Shifting Arenas

## Gameplay changes
- Seeded procedural arena layouts persist for exactly three rounds; the next chapter uses a different theme, randomized weather, mirrored nodes, hazards and obstacles.
- A central terrain announcement animates into the persistent arena chip; tiles gain pattern, colour, icon and effect labels.
- Items move to a prominent left-hand panel; the right-hand battle log is compact and scrollable. Notifications are capped at three.
- Hardcore automatically bans two spirits per run/match. Both online players use the same server-selected bans. No manual bans, role bans or faction-deck builder remain.
- Earth and Wind removed; 56 spirits / 8 elements / 7 spirits per element. Added Coalback, Mist Otter, Brambletoad, Tesla Lynx, Icecarapace, Veilhound, Lumenkit and Glyph Mantis.
- Added typed damage matchups: +25% advantage, -20% in reverse; selectable in-game guide and unit details.
- Replaced Rally commander heal with a run-start choice of Meteor Crash, Thunder Bloom or Void Rupture.
- Freeze: 5 per run, at most 1 each round. Chosen AOE: 3 per run, at most 1 each round. Both may be used in one battle with the 3.5-second cooldown.
- Aegis Shield and Focus Banner retained. Hardcore Black Market passing retained.

## Multiplayer / reliability
- Public Standard/Hardcore queues and private Duel/Party retained from V8.
- Shared `public/rules.js` keeps clients/server aligned on roster, bans, terrain and area-attack definitions.
- Server owns online charge budgets, locks the selected AOE, rejects repeated or exhausted casts, and preserves spending on reconnect.
- Immutable initial snapshots and action logs support replay without refilling or double-spending charges.
- Online combat is fixed at real-time speed; low-frame-rate devices catch up fixed simulation steps rather than silently dropping elapsed time.
- Combat DOM rendering is throttled independently from simulation; pointer-down targeting avoids losing clicks when a moving unit is repainted.

## Updating
Use the complete new project, including `public/rules.js`, and start a fresh run. Old local save entries remain untouched. Stop the old Node process before starting the new one. The local port remains 8080; your existing tunnel forwarding to that port can stay running.

Balance numbers are configurable initial values. No production hosting or full competitive anti-cheat is claimed.
