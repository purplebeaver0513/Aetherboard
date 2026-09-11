# Aetherboard Arena — Version 10 / 1.0.1 Animated

This is the complete game with the animation update already integrated. It continues the recovered Version 10 source.

## Play

1. Extract the whole ZIP into a new folder. Keep your previous game folder as a backup.
2. Use Node.js 22 or newer, as required by the existing game.
3. Open a terminal in the extracted folder and run `npm start`.
4. Open `http://localhost:8080` in your browser.

The existing Windows `START_AETHERBOARD.bat` and `start-aetherboard.sh` launchers are also included unchanged. There are no new runtime dependencies or asset-generation steps.

Use the **same browser and address** as before to access browser-local saves. Copy any personal art and `CUSTOM_ASSETS` settings from your own edited copy before replacing it. Uploaded custom images still take priority over the bundled animation.

## Inspect the animation

While the server is running, open `http://localhost:8080/art-gallery.html`.

The gallery includes all 56 spirits with idle, walk, attack, cast, hit and defeat poses; a frame-step control; all 83 animated item/interface symbols; 16 effect sheets; seven terrain overlays; all six arena floors; and the new title scene. It does not read or change your saved run.

You can also open `public/art-gallery.html` locally to inspect the assets, or view `docs/art-animation/all-characters-animated.gif` without starting the server. Use `npm start` to run the game and multiplayer.

## GitHub / hosting

Upload the contents of this extracted folder, including **all of `public/`**. This package contains the source files, assets, `package.json`, server, Render configuration, Dockerfile and launchers. The original deployment procedure is unchanged. GitHub Pages alone cannot run the Node multiplayer server.

No deployment was performed as part of this update.

## Validation

`npm test` runs the six existing suites plus the new animation suite. All seven suites passed for this package. The new HTTP check serves every animation asset and verifies its exact bytes. See `docs/art-animation/tests-final.txt`.

Browser visual playtesting is still pending: this environment's browser security policy blocked the local game preview. The supplied GIF and sprite sheets were visually inspected; they are asset previews, not screenshots of a completed browser playtest.
