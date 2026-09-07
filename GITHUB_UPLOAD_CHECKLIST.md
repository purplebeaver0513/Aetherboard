# Version 9 — GitHub upload checklist

- [ ] Stop the old server before replacing code during a match.
- [ ] Extract the ZIP, rather than uploading the ZIP itself.
- [ ] Upload the contents of the extracted project to the repository root.
- [ ] Include `public/index.html` **and the new `public/rules.js`**.
- [ ] Include `server.js`, `package.json`, `package-lock.json`, `tests/`, launchers and documentation.
- [ ] Keep custom assets under `public/assets/` and reapply your `CUSTOM_ASSETS` paths when replacing HTML.
- [ ] Do not upload `node_modules/`, Cloudflare executables, tokens, personal tunnel configs, or `.env` files.
- [ ] Run `npm test` and `npm start` with Node.js 22 or newer.
- [ ] Check `http://localhost:8080` and `/health`.
- [ ] Refresh both devices on the same public/tunnel address and start a new V9 match.

## Manual Node Web Service settings

No Blueprint is required. Build: `npm install --omit=dev`. Start: `npm start`. Health check: `/health`. Leave Root Directory blank when package.json is directly in the repository root.
