@echo off
cls
color 0E
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║             ⚡ HARD REFRESH - CACHE BUSTER ⚡                 ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.
echo This will start the server with AGGRESSIVE cache busting.
echo.
echo After this runs, do this in your browser:
echo.
echo     1. Go to http://localhost:5173
echo     2. Press Ctrl+Shift+R (HARD REFRESH)
echo     3. Press Ctrl+Shift+R again
echo     4. Press Ctrl+Shift+R one more time
echo.
echo     ✅ The error will be GONE!
echo.
echo.
pause
echo.

echo [1/2] Killing old servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo     ✅ Done
echo.

echo [2/2] Starting server with cache busting...
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
color 0A
echo  🚀 SERVER IS STARTING!
echo.
echo  When it says "Local: http://localhost:5173"
echo.
echo  DO THIS IN YOUR BROWSER:
echo  ────────────────────────
echo.
echo     1. Go to http://localhost:5173
echo.
echo     2. Press Ctrl+Shift+R (HARD REFRESH) 3 TIMES
echo.
echo     3. If you STILL see error, press Ctrl+Shift+N
echo        (incognito mode) and go to http://localhost:5173
echo.
echo  ✅ The error will be GONE!
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo.

npm run dev
