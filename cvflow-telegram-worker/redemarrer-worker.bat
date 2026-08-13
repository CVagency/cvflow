@echo off
title CVFLOW - Redemarrage worker Telegram
cd /d "%USERPROFILE%\Downloads\cvflow-telegram-worker"
echo Arret de l'ancien worker (port 8080)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
timeout /t 2 /nobreak >nul
echo Relance du worker...
start "cvflow-worker" cmd /k "node index.js"
echo.
echo Worker relance dans une nouvelle fenetre. Tu peux fermer celle-ci.
timeout /t 3 >nul
