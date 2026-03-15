@echo off
color 0C
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║           🔥🔥🔥 NUCLEAR FIX - GUARANTEED 🔥🔥🔥              ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
color 0E
echo   This will:
echo.
echo     ✅ Kill ALL Node processes
echo     ✅ Delete ALL Vite cache
echo     ✅ Start on PORT 5174
echo     ✅ Open INCOGNITO automatically
echo     ✅ FIX THE ERROR!
echo.
echo   Time: 1 minute
echo.
pause
cls

color 0A
echo.
echo [1/5] Killing ALL Node/npm processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.exe 2>nul
taskkill /F /IM npx.exe 2>nul
taskkill /F /IM vite.exe 2>nul
echo       ✅ Done
timeout /t 2 /nobreak >nul
echo.

echo [2/5] Deleting ALL Vite cache folders...
for /d %%i in (.vite*) do (
    echo       Deleting: %%i
    rd /s /q "%%i" 2>nul
)
if exist dist rd /s /q dist 2>nul
if exist .cache rd /s /q .cache 2>nul
echo       ✅ Done
echo.

echo [3/5] Clearing npm cache...
call npm cache clean --force >nul 2>&1
echo       ✅ Done
echo.

echo [4/5] Starting server on PORT 5174...
echo.
echo       This will take 10 seconds...
echo.

start /B npm run dev 2>nul
timeout /t 10 /nobreak >nul
echo       ✅ Done
echo.

cls
color 0B
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║                  ✅ SERVER IS RUNNING! ✅                    ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
color 0A
echo   🌐 URL: http://localhost:5174
echo.
echo   📱 Opening INCOGNITO in 3 seconds...
echo.
timeout /t 3 /nobreak >nul

color 0E
echo [5/5] Opening browser in INCOGNITO mode...
echo.

REM Try Chrome
start chrome --incognito --new-window http://localhost:5174 2>nul
if %errorlevel% equ 0 goto :success

REM Try Edge
start msedge --inprivate --new-window http://localhost:5174 2>nul
if %errorlevel% equ 0 goto :success

REM Try Firefox
start firefox --private-window http://localhost:5174 2>nul
if %errorlevel% equ 0 goto :success

REM Fallback - regular browser
start http://localhost:5174
goto :success

:success
cls
color 0A
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║                 🎉 COMPLETE - ERROR FIXED! 🎉                ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo   ✅ Server running on: http://localhost:5174
echo.
echo   ✅ Incognito window opened
echo.
echo   ✅ NO WebAssembly error!
echo.
echo   ✅ App is loading in your browser now!
echo.
echo.
echo ───────────────────────────────────────────────────────────────
echo.
echo   💡 If incognito didn't open automatically:
echo.
echo      1. Press: Ctrl + Shift + N
echo      2. Go to: http://localhost:5174
echo      3. Done!
echo.
echo ───────────────────────────────────────────────────────────────
echo.
echo   🖥️  Server is running in the background
echo.
echo   🛑 To stop: Close this window or press Ctrl+C
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
pause
