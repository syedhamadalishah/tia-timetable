@echo off
title The Inspirational Academy - Live Public Sharing
echo ========================================================
echo   Starting The Inspirational Academy Portal & Public Tunnel
echo ========================================================
echo.
echo 1. Launching Local Server on port 3000...
start "TIA Local Server" node server.js
timeout /t 3 /nobreak >nul
echo.
echo 2. Generating your Free Live Public URL (localtunnel)...
echo    (Share this URL with anyone on mobile or other devices)
echo.
npx --yes localtunnel --port 3000
pause
