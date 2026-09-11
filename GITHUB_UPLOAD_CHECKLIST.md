# Version 10 repository upload

Extract the full ZIP into a separate folder. Keep your current working folder as a backup and preserve local custom art/configuration.

The repository root should directly contain `server.js`, `package.json`, `package-lock.json`, `public/`, `tests/`, `render.yaml` and `Dockerfile`. Upload the extracted contents, not the ZIP or another outer folder.

Include the new files:

```text
public/pixel-art.js
public/pixel-theme.css
public/assets/pixel/    (all contents)
```

Do not upload Node modules, Cloudflare executables, tunnel configurations, certificates, tokens or `.env` files. The existing `.gitignore` covers these.

Run `npm test` and test one disposable duel locally before committing. Deployment commands and `/health` are unchanged. This update does not require Blueprint. Schedule any host restart between matches because rooms remain in server memory.

See `UPGRADE_1_0_1.md` for installation and rollback, and `TESTING_1_0_1.md` for actual validation limits.
