@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 or newer is required.
  echo Download Node.js, then run this file again.
  pause
  exit /b 1
)
echo Starting Aetherboard Online...
echo Open http://localhost:8080 in your browser.
echo Keep this window open while people are playing.
echo.
npm start
pause
