@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 or newer is required.
  echo Install a current Node.js LTS release, then run this file again.
  pause
  exit /b 1
)
echo Starting Aetherboard Arena Version 6...
echo Open http://localhost:8080 in your browser.
echo Keep this window open while online players are connected.
echo.
npm start
pause
