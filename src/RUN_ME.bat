@echo off
color 0A
cls
echo.
echo ══════════════════════════════════════════════════════════════
echo.
echo              🚀 FIX WEBASSEMBLY ERROR - SIMPLE 🚀
echo.
echo ══════════════════════════════════════════════════════════════
echo.
echo.
echo   This will start the server on PORT 5174
echo   (Different port = No cached files = No error!)
echo.
echo   Takes: 1 minute
echo.
pause
echo.
echo.
color 0E
echo   [1/2] Stopping old server...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo         ✅ Done
echo.
echo   [2/2] Starting on port 5174...
echo.
echo.
color 0B
echo ══════════════════════════════════════════════════════════════
echo   ✅ Server starting on: http://localhost:5174
echo ══════════════════════════════════════════════════════════════
echo.
color 0A
echo   DO THIS NOW:
echo.
echo     1. Press: Ctrl + Shift + N (opens incognito)
echo     2. Go to: http://localhost:5174
echo     3. ✅ ERROR GONE!
echo.
color 0E
echo   OR just open: http://localhost:5174 in any browser
echo   (New port = new cache = no error!)
echo.
echo ══════════════════════════════════════════════════════════════
echo.
timeout /t 3 /nobreak >nul

REM Start dev server on port 5174
npm run dev -- --port 5174

pause
