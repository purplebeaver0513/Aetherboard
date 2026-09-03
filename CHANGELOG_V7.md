# Aetherboard Arena — Version 7 Changelog

## Hardcore Duel

- Added a Hardcore toggle to Local Duel.
- Added a Hardcore toggle to Online Duel lobby creation.
- Hardcore duelists begin with 40 heart.
- Each player privately bans two individual spirits.
- Removed the complete role-ban phase.
- Each player privately selects a 15-spirit Faction Deck.
- Each player receives a five-spirit Global Pool.
- Knocked-out deployed spirits are permanently removed after combat.
- Equipped items are lost with permanently defeated spirits.
- Grave Idol protects one casualty and then shatters.
- A complete roster wipe eliminates the player.
- Black Market and Team Blessing rewards are scheduled every five rounds.
- Hardcore Party was not added; Party keeps standard multiplayer rules.

## Healer and Buffer roles

- Expanded the roster from 40 to 60 spirits.
- Added one Healer and one Buffer to each of the ten elemental types.
- Added Healer synergy tiers at 2, 4, and 6 units.
- Added Buffer synergy tiers at 2, 4, and 6 units.
- Costs range from 1 to 5 gold and effects range from small targeted support to full-team healing or empowerment.
- Temporary support buffs use the strongest same-stat source instead of stacking every source.

## Commander intervention

- Removed Terrain Wall.
- Added Aegis Shield on key `3`.
- Aegis Shield grants nearby allies a shield equal to 24% of maximum health.
- Fixed Focus Banner enemy selection.
- Fixed side conversion for online target ownership.
- Added a visible target marker to the selected enemy.
- Living allied units continuously refresh the forced target while Focus is active.

## Black Market

- Added a full-size Pass This Market card.
- Added a footer Pass button.
- Passing costs zero heart and continues the reward queue.
- Added Black Market pass tracking to Hardcore state.

## Multiplayer server

- Added `hardcore` room configuration for two-player Duel rooms.
- Added server validation for two banned units, 15 faction units, and five global units.
- Removed role-ban validation.
- Added validation for all 20 new support spirits.
- Added corrupted Black Market item validation.
- Replaced the `wall` combat action with `shield`.
- Added online permanent-death casualty processing and roster-wipe elimination.

## Fixes and validation

- Fixed an ability-cast cooldown runtime error.
- Updated the saved-state version and save key for Version 7.
- Added an automated Node server smoke test.
- Validated all 60 spirits and support-role coverage.
- Validated Hardcore Local Duel setup for both private players.
- Validated Focus Banner, Aegis Shield, Healer casts, and Buffer casts in a headless browser.
