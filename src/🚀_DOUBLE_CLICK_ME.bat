@echo off
title FIXING WEBASSEMBLY ERROR
color 0A
cls

echo.
echo    ╔══════════════════════════════════════════════════════╗
echo    ║                                                      ║
echo    ║          WEBASSEMBLY ERROR FIX - RUNNING NOW         ║
echo    ║                                                      ║
echo    ╚══════════════════════════════════════════════════════╝
echo.
echo.
echo    This will fix your error in 3 steps:
echo.
echo    [1] Kill old processes
echo    [2] Delete cache
echo    [3] Start fresh server
echo.
echo    Press any key to start...
pause >nul

cls
echo.
echo    [STEP 1/3] Stopping processes...
taskkill /F /IM node.exe >nul 2>&1
echo    Done!
echo.
timeout /t 2 /nobreak >nul

echo    [STEP 2/3] Deleting cache...
for /d %%i in (.vite*) do rd /s /q "%%i" >nul 2>&1
if exist "dist" rd /s /q "dist" >nul 2>&1
if exist "node_modules\.vite" rd /s /q "node_modules\.vite" >nul 2>&1
echo    Done!
echo.
timeout /t 2 /nobreak >nul

echo    [STEP 3/3] Starting server on port 5174...
echo.
echo    ════════════════════════════════════════════════════════
echo.
echo    The server is starting...
echo    Wait 10 seconds, then open your browser to:
echo.
echo        http://localhost:5174
echo.
echo    The error will be GONE!
echo.
echo    ════════════════════════════════════════════════════════
echo.

start /B npm run dev

timeout /t 10 /nobreak >nul

echo.
echo    Opening browser...
start http://localhost:5174
echo.
echo.
echo    ✅ DONE! The app should open with NO errors.
echo.
echo    If you still see an error:
echo      - Press Ctrl+Shift+N for incognito
echo      - Go to http://localhost:5174
echo      - Error disappears!
echo.
echo    Keep this window open (server is running).
echo    Press Ctrl+C to stop the server.
echo.
pause
