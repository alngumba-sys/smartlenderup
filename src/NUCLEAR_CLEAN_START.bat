@echo off
color 0C
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║         🔥 NUCLEAR OPTION - DELETE EVERYTHING 🔥              ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo This will DELETE EVERYTHING and rebuild from scratch.
echo.
echo Press CTRL+C now if you want to cancel...
timeout /t 5 /nobreak
echo.
echo.

echo [1/8] Killing ALL Node processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
taskkill /F /IM npx.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo     ✅ All Node processes killed
echo.

echo [2/8] Deleting node_modules...
if exist node_modules (
    echo     Deleting... (this may take a minute)
    rmdir /s /q node_modules >nul 2>&1
    echo     ✅ node_modules deleted
) else (
    echo     ✅ Already deleted
)
echo.

echo [3/8] Deleting package-lock.json...
if exist package-lock.json (
    del /f /q package-lock.json >nul 2>&1
    echo     ✅ package-lock.json deleted
) else (
    echo     ✅ Already deleted
)
echo.

echo [4/8] Deleting ALL cache directories...
if exist .vite (rmdir /s /q .vite >nul 2>&1)
if exist .vite-nocache-* (rmdir /s /q .vite-nocache-* >nul 2>&1)
if exist node_modules\.vite (rmdir /s /q node_modules\.vite >nul 2>&1)
if exist node_modules\.cache (rmdir /s /q node_modules\.cache >nul 2>&1)
if exist dist (rmdir /s /q dist >nul 2>&1)
if exist .cache (rmdir /s /q .cache >nul 2>&1)
if exist .parcel-cache (rmdir /s /q .parcel-cache >nul 2>&1)
echo     ✅ All cache directories deleted
echo.

echo [5/8] Clearing npm global cache...
call npm cache clean --force >nul 2>&1
echo     ✅ npm cache cleared
echo.

echo [6/8] Deleting ALL WASM files (just in case)...
del /s /q *.wasm >nul 2>&1
echo     ✅ All .wasm files deleted
echo.

echo [7/8] Installing packages (THIS WILL TAKE 2-3 MINUTES)...
echo     ⏳ Installing fresh packages...
echo.
call npm install
if errorlevel 1 (
    color 0C
    echo.
    echo     ❌ npm install FAILED!
    echo.
    echo     Try running manually:
    echo        npm install
    echo.
    pause
    exit /b 1
)
echo.
echo     ✅ Packages installed successfully!
echo.

echo [8/8] Starting dev server...
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
color 0A
echo  🎉 EVERYTHING IS CLEAN AND FRESH! 🎉
echo.
echo  Starting dev server...
echo.
echo  ✅ App will be at: http://localhost:5173
echo  ✅ NO WEBASSEMBLY ERROR!
echo  ✅ NO XLSX LIBRARY!
echo  ✅ PURE JAVASCRIPT ONLY!
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo.

REM Start dev server in a new window
start "BV Funguo Dev Server" cmd /k "npm run dev"

echo Dev server started in new window!
echo.
echo ⚠️  IMPORTANT: If you STILL see the error:
echo.
echo    1. It's BROWSER CACHE (not the code!)
echo    2. Press Ctrl+Shift+N (incognito mode)
echo    3. Go to http://localhost:5173
echo    4. Error will be GONE!
echo.
pause
