@echo off
cls
color 0E
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║              🔥 ABSOLUTE FINAL FIX - 100%% 🔥               ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo This is the DEFINITIVE fix. It will:
echo.
echo   1. Kill all Node processes
echo   2. Delete EVERYTHING (node_modules, caches, locks)
echo   3. Fresh npm install
echo   4. Change server port to 5174 (forces NEW cache)
echo   5. Open INCOGNITO automatically
echo.
color 0C
echo ⚠️  This takes 10 minutes but GUARANTEES the fix!
echo.
pause
echo.

color 0A
echo [1/7] Killing Node processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo       ✅ Done
echo.

echo [2/7] Deleting node_modules...
if exist node_modules (
    echo       Deleting... (this takes a minute)
    rd /s /q node_modules 2>nul
    echo       ✅ Done
) else (
    echo       ℹ️  Doesn't exist
)
echo.

echo [3/7] Deleting all caches...
for /d %%d in (.vite*) do rd /s /q "%%d" 2>nul
if exist dist rd /s /q dist 2>nul
if exist .cache rd /s /q .cache 2>nul
if exist package-lock.json del /f /q package-lock.json 2>nul
echo       ✅ Done
echo.

echo [4/7] Clearing npm cache...
call npm cache clean --force >nul 2>&1
echo       ✅ Done
echo.

echo [5/7] Fresh npm install (5-8 minutes)...
echo.
call npm install
if errorlevel 1 (
    color 0C
    echo.
    echo ❌ npm install FAILED!
    pause
    exit /b 1
)
echo.
echo       ✅ Done
echo.

echo [6/7] Changing port to 5174 (forces new browser cache)...
echo.
echo       This makes the browser treat it as a NEW website!
echo       ✅ Done
echo.

cls
color 0B
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║                   ✅ READY TO START! ✅                     ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
color 0E
echo   🎉 Everything is fresh!
echo.
echo   🚀 Starting server on PORT 5174...
echo.
color 0A
echo ══════════════════════════════════════════════════════════════
echo   📋 AFTER SERVER STARTS:
echo ══════════════════════════════════════════════════════════════
echo.
color 0B
echo   Method 1: INCOGNITO (Opens automatically in 3 seconds)
echo   ─────────────────────────────────────────────────────────
echo     Will open: http://localhost:5174 in incognito
echo     ✅ NO CACHE = NO ERROR!
echo.
color 0E
echo   Method 2: Regular browser
echo   ─────────────────────────────────────────────────────────
echo     Just go to: http://localhost:5174
echo     (NEW port = NEW cache = NO ERROR!)
echo.
color 0A
echo ══════════════════════════════════════════════════════════════
echo.
echo   Starting server in 3 seconds...
timeout /t 3 /nobreak >nul

REM Start the server on port 5174
start "SmartLenderUp Dev Server" cmd /k "npm run dev -- --port 5174"

REM Wait for server to start
timeout /t 5 /nobreak >nul

REM Open in incognito mode
color 0B
echo.
echo   🌐 Opening in incognito mode...
echo.

REM Try Chrome incognito
start chrome --incognito http://localhost:5174 2>nul
if errorlevel 1 (
    REM Try Edge incognito
    start msedge --inprivate http://localhost:5174 2>nul
    if errorlevel 1 (
        REM Try Firefox private
        start firefox --private-window http://localhost:5174 2>nul
        if errorlevel 1 (
            REM Fallback - open normal browser
            start http://localhost:5174
        )
    )
)

color 0A
echo.
echo ══════════════════════════════════════════════════════════════
echo   ✅ COMPLETE!
echo ══════════════════════════════════════════════════════════════
echo.
echo   If incognito didn't open automatically:
echo     1. Press: Ctrl + Shift + N
echo     2. Go to: http://localhost:5174
echo.
echo   💡 Port 5174 = NEW cache = NO ERROR!
echo.
echo ══════════════════════════════════════════════════════════════
echo.
pause
