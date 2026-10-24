@echo off
title The Inspirational Academy - Free 24/7 Cloud Deployment
color 0B
echo =====================================================================
echo    THE INSPIRATIONAL ACADEMY - 100%% FREE CLOUD DEPLOYMENT
echo =====================================================================
echo.
echo This script will help you publish your website online FOR FREE (0 cost, no credit card).
echo.
echo [Step 1 of 2]: Make sure you have created an empty repository on GitHub.
echo If you haven't yet:
echo   1. Go to: https://github.com/new
echo   2. Repository name: tia-timetable (or theinspirationalacademy)
echo   3. Keep it Public, DO NOT check "Add a README"
echo   4. Click "Create repository"
echo.
echo =====================================================================
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/syedhamadalishah/tia-timetable.git): "

if "%REPO_URL%"=="" (
    echo Error: No URL entered. Exiting...
    pause
    exit /b
)

echo.
echo Linking to your repository: %REPO_URL%
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git branch -M main

echo.
echo Pushing your code to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =====================================================================
    echo [Step 2 of 2]: Connect to Render.com (100%% FREE forever)
    echo =====================================================================
    echo 1. Open: https://render.com
    echo 2. Sign in with GitHub (FREE)
    echo 3. Click "New +" -^> "Web Service"
    echo 4. Choose your repository and click "Connect"
    echo 5. Render will automatically detect settings and deploy!
    echo.
    echo Your website will be live 24/7 at:
    echo   https://theinspirationalacademy.onrender.com
    echo =====================================================================
) else (
    echo.
    echo Error during push. Please ensure you are logged in to GitHub on your browser.
)

pause
