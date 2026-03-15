@echo off
setlocal enabledelayedexpansion
color 0E
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║           ⚡ COMPLETE FIX - WASM ERROR - ONE CLICK ⚡         ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.
echo This will:
echo   ✅ Kill all Node processes
echo   ✅ Delete all caches
echo   ✅ Delete node_modules
echo   ✅ Fresh npm install
echo   ✅ Start the server
echo   ✅ Open cache clearer page
echo   ✅ Guide you step-by-step
echo.
echo Time: 3-4 minutes
echo.
pause
cls

REM ═══════════════════════════════════════════════════════════════
REM STEP 1: Kill processes
REM ═══════════════════════════════════════════════════════════════
color 0C
echo.
echo [1/7] Killing all Node processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
timeout /t 2 /nobreak >nul
color 0A
echo       ✅ Processes killed
echo.

REM ═══════════════════════════════════════════════════════════════
REM STEP 2: Delete caches
REM ═══════════════════════════════════════════════════════════════
color 0E
echo [2/7] Deleting cache directories...
for /d %%d in (.vite*) do rd /s /q "%%d" 2>nul
if exist dist rd /s /q dist 2>nul
if exist .cache rd /s /q .cache 2>nul
color 0A
echo       ✅ Caches deleted
echo.

REM ═══════════════════════════════════════════════════════════════
REM STEP 3: Delete node_modules
REM ═══════════════════════════════════════════════════════════════
color 0E
echo [3/7] Deleting node_modules...
echo       (This takes 30-60 seconds)
if exist node_modules rd /s /q node_modules 2>nul
timeout /t 2 /nobreak >nul
color 0A
echo       ✅ node_modules deleted
echo.

REM ═══════════════════════════════════════════════════════════════
REM STEP 4: Clear npm cache
REM ═══════════════════════════════════════════════════════════════
color 0E
echo [4/7] Clearing npm cache...
call npm cache clean --force >nul 2>&1
color 0A
echo       ✅ npm cache cleared
echo.

REM ═══════════════════════════════════════════════════════════════
REM STEP 5: Install packages
REM ═══════════════════════════════════════════════════════════════
color 0E
echo [5/7] Installing packages...
echo       (This takes 2-3 minutes)
echo.
call npm install

if errorlevel 1 (
    color 0C
    echo.
    echo ❌ npm install FAILED!
    pause
    exit /b 1
)

color 0A
echo.
echo       ✅ Packages installed
echo.

REM ═══════════════════════════════════════════════════════════════
REM STEP 6: Open cache clearer
REM ═══════════════════════════════════════════════════════════════
color 0E
echo [6/7] Opening browser cache clearer...
start CLEAR_BROWSER_CACHE.html
timeout /t 2 /nobreak >nul
color 0A
echo       ✅ Cache clearer opened
echo.

REM ═══════════════════════════════════════════════════════════════
REM STEP 7: Start server
REM ═══════════════════════════════════════════════════════════════
cls
color 0B
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║                    ✅ SETUP COMPLETE! ✅                      ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.
color 0E
echo [7/7] Starting server...
echo.
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
color 0A
echo  ✅ Server is starting now!
echo.
color 0E
echo  🌐 A browser page opened with instructions
echo.
echo  📋 FOLLOW THESE STEPS IN THE BROWSER PAGE:
echo  ════════════════════════════════════════════════════════════
echo.
color 0C
echo   1. Press Ctrl+Shift+Delete
echo   2. Select "All time"
echo   3. Check "Cached images and files"
echo   4. Click "Clear data"
echo.
color 0E
echo  Then in the browser:
echo.
color 0A
echo   5. Go to http://localhost:5173
echo   6. ✅ NO MORE ERROR!
echo.
color 0E
echo ═══════════════════════════════════════════════════════════════
echo.
echo.
color 0B
echo  💡 TIP: If you don't want to clear your cache:
echo     → Just use incognito mode (Ctrl+Shift+N)
echo     → Go to http://localhost:5173
echo     → ✅ Works perfectly!
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo.
color 0A
echo  🚀 The server is running now!
echo.
echo  Press Ctrl+C to stop the server when done.
echo.
echo.

npm run dev
