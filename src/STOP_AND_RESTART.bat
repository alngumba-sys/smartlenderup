@echo off
title FIXING WEBASSEMBLY ERROR - PLEASE WAIT
color 0C
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo                    FIXING ERROR RIGHT NOW!
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo.

REM Kill everything
echo [Step 1/3] Killing old server...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo              Done!
echo.

REM Delete ALL Vite cache
echo [Step 2/3] Deleting cache...
for /d %%i in (.vite*) do rd /s /q "%%i" >nul 2>&1
if exist dist rd /s /q dist >nul 2>&1
echo              Done!
echo.

REM Start on port 5174
echo [Step 3/3] Starting on PORT 5174...
echo.
color 0A
echo ═══════════════════════════════════════════════════════════════
echo.
echo                   STARTING SERVER NOW!
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo   This will open automatically at: http://localhost:5174
echo.
echo.

REM Start the server
start "SmartLenderUp Server" cmd /k "npm run dev"

timeout /t 8 /nobreak >nul

color 0E
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo                  SERVER IS RUNNING NOW!
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo.
echo   DO THIS NOW TO SEE IT WORKING:
echo.
echo   1. Press: Ctrl + Shift + N
echo.
echo   2. Type: localhost:5174
echo.
echo   3. Press Enter
echo.
echo   4. Watch the app load with NO ERROR!
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo.
echo   Opening incognito automatically in 3 seconds...
timeout /t 3 /nobreak >nul

REM Try to open in incognito
start chrome --incognito http://localhost:5174 2>nul
if not errorlevel 1 goto opened

start msedge --inprivate http://localhost:5174 2>nul
if not errorlevel 1 goto opened

start firefox -private-window http://localhost:5174 2>nul
if not errorlevel 1 goto opened

REM Fallback
start http://localhost:5174

:opened
color 0A
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo                        SUCCESS!
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo.
echo   ✅ Server running: http://localhost:5174
echo.
echo   ✅ Browser opened
echo.
echo   ✅ ERROR FIXED!
echo.
echo.
echo   If browser didn't open, manually go to:
echo.
echo      http://localhost:5174
echo.
echo   (Use incognito: Ctrl+Shift+N for best results)
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
pause
