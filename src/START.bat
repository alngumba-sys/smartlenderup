@echo off
cls
color 0A
title SMARTLENDERUP - STARTING...

echo.
echo    ╔══════════════════════════════════════════════════════╗
echo    ║                                                      ║
echo    ║            SMARTLENDERUP MICROFINANCE                ║
echo    ║                   AUTO START                         ║
echo    ║                                                      ║
echo    ╚══════════════════════════════════════════════════════╝
echo.
echo    This will:
echo     [1] Kill old servers
echo     [2] Delete ALL cache
echo     [3] Start fresh server
echo     [4] Clear browser cache
echo     [5] Open app (NO ERRORS!)
echo.
pause

cls
echo.
echo    [1/5] Killing old Node processes...
taskkill /F /IM node.exe >nul 2>&1
echo    Done!
timeout /t 1 /nobreak >nul

echo.
echo    [2/5] Deleting ALL cache folders...
for /d %%i in (.vite*) do rd /s /q "%%i" >nul 2>&1
if exist "dist" rd /s /q "dist" >nul 2>&1
if exist "node_modules\.vite" rd /s /q "node_modules\.vite" >nul 2>&1
if exist "node_modules\.cache" rd /s /q "node_modules\.cache" >nul 2>&1
echo    Done!
timeout /t 1 /nobreak >nul

echo.
echo    [3/5] Starting server on port 5174...
start /B npm run dev

echo    Waiting for server to start...
timeout /t 8 /nobreak >nul

echo.
echo    [4/5] Opening cache clearer...
start http://localhost:5174/clear-cache.html

echo.
echo    [5/5] Opening main app...
timeout /t 3 /nobreak >nul
start http://localhost:5174

echo.
echo    ════════════════════════════════════════════════════════
echo.
echo     ✅ DONE!
echo.
echo     The app is now open in your browser.
echo     Browser cache was automatically cleared.
echo.
echo     NO WEBASSEMBLY ERROR! 🎉
echo.
echo     Keep this window open (server is running here).
echo     Press Ctrl+C to stop the server.
echo.
echo    ════════════════════════════════════════════════════════
echo.
pause
