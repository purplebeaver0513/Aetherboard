# Aetherboard Arena — Version 8 Changelog

## Public Main Server Queue

- Added a public 1v1 matchmaking queue.
- Added separate Standard Duel and Hardcore Duel queues.
- Added queue position, number of searchers, elapsed time, connection state, and cancellation.
- Added automatic pairing in first-in-first-out order.
- Added automatic match start when two compatible players are found.
- Added a Match Found screen showing both commander names.
- Added Queue Again after a public match.
- Added queue disconnect cleanup and a ten-minute queue timeout.
- Added queue counts to `/health`.

## Private Lobby

- Reorganized invite-code multiplayer into a dedicated Private Lobby mode.
- Private Lobby now clearly offers Private Duel or Private Party.
- Hardcore can be enabled for Private Duel.
- Private Party remains Standard and supports two to four devices.
- Joining by room code now ignores the joiner’s local rules selection and safely uses the host’s room settings.

## User interface

- Replaced separate Online Duel and Online Party title cards with:
  - Main Server Queue
  - Private Lobby
- Added animated matchmaking radar and queue status panel.
- Added clear public-versus-private descriptions.
- Fixed the Hardcore toggle remaining visible when an unrelated title mode was selected.
- Updated top-bar mode names, round titles, waiting screens, help text, and match-end actions.

## Networking and recovery

- Added room `access` metadata so clients distinguish matchmaking rooms from private rooms.
- Matchmaking rooms cannot be joined with a private code or returned to a private lobby.
- Active online sessions retain reconnection support.
- Startup now attempts to restore an active saved online match before beginning a new online action.
- Public queue cancellation does not create or expose a private lobby code.

## Compatibility

- Updated internal state version to 8.
- Migrates Version 7 local saves.
- Retains all Version 7 Hardcore, support-role, map, weather, item, Blessing, Black Market, commander-spell, Focus Banner, and custom-asset systems.
