# GitHub Upload Checklist

Upload **everything inside this extracted folder** to the root of one GitHub repository.

## The repository front page should directly show

- `public/`
- `tests/`
- `docs/`
- `server.js`
- `package.json`
- `package-lock.json`
- `render.yaml`
- `Dockerfile`
- `START_AETHERBOARD.bat`
- `start-aetherboard.sh`
- `README.md`
- `CHANGELOG_V7.md`
- `.gitignore`
- `.dockerignore`

## Do not upload

- The ZIP file by itself
- `node_modules/`
- Temporary logs
- Old `.bak` files

## Before deploying

Run locally:

```bash
npm start
```

Open:

```text
http://localhost:8080
```

Run the server test:

```bash
npm test
```

## Manual Render Web Service settings

```text
Language: Node
Branch: main
Root Directory: leave blank
Build Command: npm install --omit=dev
Start Command: npm start
Health Check Path: /health
```

The server health endpoint is:

```text
/health
```
