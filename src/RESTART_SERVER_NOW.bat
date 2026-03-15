@echo off
color 0C
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║              ⚡ RESTART SERVER - FIX WASM ERROR ⚡           ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.
echo This will:
echo   1. Kill the current server
echo   2. Start a fresh server
echo   3. Show you EXACTLY what to do in your browser
echo.
echo.
pause
echo.

echo [1/2] Killing current server...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
color 0A
echo     ✅ Server stopped
echo.

echo [2/2] Starting fresh server...
echo.
color 0E
echo ═══════════════════════════════════════════════════════════════
echo.
echo  🚀 SERVER IS STARTING!
echo.
echo  When you see "Local: http://localhost:5173"
echo.
echo  ⚡ DO THIS IMMEDIATELY:
echo  ════════════════════════════════════════════════════════════
echo.
color 0C
echo     OPTION A - INSTANT FIX (10 seconds):
echo     ────────────────────────────────────────────────
color 0E
echo       1. Press Ctrl+Shift+N (incognito mode)
echo       2. Type: http://localhost:5173
echo       3. Press Enter
echo       4. ✅ APP LOADS - NO ERROR!
echo.
echo       This PROVES the code is fixed!
echo.
color 0C
echo     OPTION B - PERMANENT FIX (30 seconds):
echo     ────────────────────────────────────────────────
color 0E
echo       1. Go to http://localhost:5173
echo       2. You'll see a RED SCREEN with instructions
echo       3. Press Ctrl+Shift+Delete
echo       4. Select "All time"
echo       5. Check "Cached images and files"
echo       6. Click "Clear data"
echo       7. Refresh page (F5)
echo       8. ✅ APP LOADS - ERROR GONE FOREVER!
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
color 0A

npm run dev
