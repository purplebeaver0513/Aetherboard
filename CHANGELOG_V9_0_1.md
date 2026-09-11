# Aetherboard Arena 9.0.1 — Compatibility and Recovery Patch

Incremental patch on the attached **Version 9 Shifting Arenas / package 9.0.0**. The game title, save schema, element/unit IDs, rule data, combat balance, server implementation, multiplayer messages, asset hooks, and deployment configuration are retained.

## Verified fixes

1. **Unfinished drafts persist.** In Expedition, Endless, Hardcore, and Local Duel, accepted starter picks are saved before the next choice appears. Previously the first two picks were not written to the offline save. Online drafts retain their existing private-snapshot path.
2. **Sold-out shops stay sold out after reload.** Initialization no longer mistakes an all-null saved shop for a new shop. Shop lock and gold are preserved; new installations still initialize their opening shop normally.
3. **Reward decisions survive planning recovery.** Item, Blessing, and Black Market entitlements stay pending while the choice is open. They are consumed and saved after a selection or a zero-heart pass, not when the modal is displayed. A repeated completion callback cannot decrement the counter twice. Reward order and amounts are unchanged.
4. **Reopened sockets reclaim their existing seat.** A newly opened connection sends the already-defined `resume-room` handshake when saved credentials exist, even when the client still holds its old room object. Previously a transport could reconnect while its player remained disconnected on the server. Existing open connections and explicitly fresh queue connections retain their previous behavior.

## Tests and packaging

- Added 27 client compatibility/recovery cases using the actual inline client in an isolated Node VM with stubbed presentation and in-memory storage.
- Added 11 real HTTP/WebSocket delivery-contract cases against an isolated server process.
- Added a synthetic representative V9 save fixture captured from the unmodified baseline, including exhausted commander charges and seeded terrain.
- Added optional Chromium DOM recovery and two-client real-WebSocket reconnect checks.
- Hardened the existing browser harness to query a combat target and dispatch the pointer event in one browser task. Animated unit nodes can be replaced between element-handle resolution and event dispatch. Two initial legacy runs timed out at this step; the atomic helper passed the same scenarios. No production targeting code was changed.
- `npm test` retains the three existing suites and appends the two new Node suites. Runtime dependencies remain empty. Package and lock metadata advance to 9.0.1; the save format remains version 9.

## Compatibility

No fresh V9 run is required. Existing V9 storage keys, profile namespace, online snapshot envelope, and deployment paths remain unchanged. The patch does not migrate V7/V8 saves or recover data already lost before installation.

The exact original `server.js`, `public/rules.js`, CSS, HTML markup, asset configuration, Dockerfile, Render configuration and launchers remain unchanged. Only four client functions contain production-code edits.

## Known limitations retained

- Server-process restarts still clear active rooms and queues; this is not a persistence/database upgrade.
- Participating clients still calculate combat; server-side validation is not full anti-cheat.
- At 390px width, the existing mobile layout clips part of the board and compresses the header. The audit reproduced identical geometry before and after this patch. This is queued as a separate targeted layout correction.
- The audit browser cannot navigate to local HTTP URLs under its managed runner policy. Browser scenarios therefore load the shipped source into a document and model storage in memory; network tests use real local HTTP and WebSocket connections. Native browser storage durability, public HTTPS/tunnel behavior, and full internet play were not certified.

See [AUDIT_V9_0_1.md](AUDIT_V9_0_1.md), [TESTING_V9_0_1.md](TESTING_V9_0_1.md), and [UPGRADE_V9_0_1.md](UPGRADE_V9_0_1.md).
