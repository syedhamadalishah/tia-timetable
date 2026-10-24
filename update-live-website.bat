@echo off
title The Inspirational Academy - Update Live Website
color 0A
echo =====================================================================
echo    THE INSPIRATIONAL ACADEMY - 1-CLICK LIVE WEBSITE UPDATER
echo =====================================================================
echo.
echo [1/3] Syncing updated files from public/ to docs/...
powershell -Command "Copy-Item -Path 'public\*' -Destination 'docs\' -Recurse -Force; if (Test-Path 'google*.html') { Copy-Item 'google*.html' 'docs\'; Copy-Item 'google*.html' 'public\' }"

echo.
echo [2/3] Staging changes...
git add .

set COMMIT_MSG=Update website content - %date% %time%
echo.
echo [3/3] Uploading to GitHub Pages...
git commit -m "%COMMIT_MSG%"
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =====================================================================
    echo   SUCCESS! All your changes are now pushed to your live website!
    echo   Live URL: https://syedhamadalishah.github.io/tia-timetable/
    echo   (GitHub Pages updates in 30-60 seconds. Refresh with Ctrl+F5)
    echo =====================================================================
) else (
    echo.
    echo [NOTE] No new changes to push or network issue.
)

pause
