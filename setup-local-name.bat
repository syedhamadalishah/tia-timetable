@echo off
title Setup Local Name - The Inspirational Academy
echo =====================================================================
echo   Set up 'http://theinspirationalacademy:3000' on your computer
echo =====================================================================
echo.
echo Checking for Administrator privileges...
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [IMPORTANT] Please Right-Click this file and choose "Run as administrator".
    echo This is required by Windows to add 'theinspirationalacademy' to your hosts file.
    pause
    exit /b
)

echo.
findstr /i "theinspirationalacademy" %SystemRoot%\System32\drivers\etc\hosts >nul
if %ERRORLEVEL% EQU 0 (
    echo 'theinspirationalacademy' is already configured in your hosts file!
) else (
    echo 127.0.0.1 theinspirationalacademy >> %SystemRoot%\System32\drivers\etc\hosts
    echo Successfully added 'theinspirationalacademy' to Windows hosts file!
)

echo.
echo =====================================================================
echo Done! Now, when your server is running, you can access your site at:
echo   http://theinspirationalacademy:3000
echo =====================================================================
pause
