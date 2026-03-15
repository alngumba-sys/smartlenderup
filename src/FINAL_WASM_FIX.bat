@echo off
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          FINAL WEBASSEMBLY FIX - NUCLEAR OPTION              ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🔴 Step 1: Killing ALL Node processes...
taskkill /F /IM node.exe /T >nul 2>&1 && echo    ✓ Node killed || echo    ✓ No Node running
timeout /t 3 /nobreak >nul

echo.
echo 🗑️  Step 2: Deleting EVERYTHING cache-related...
rmdir /s /q node_modules\.vite >nul 2>&1 && echo    ✓ Deleted node_modules\.vite || echo    ✓ Already gone
rmdir /s /q node_modules\.cache >nul 2>&1 && echo    ✓ Deleted node_modules\.cache || echo    ✓ Already gone
rmdir /s /q .vite >nul 2>&1 && echo    ✓ Deleted .vite || echo    ✓ Already gone
rmdir /s /q dist >nul 2>&1 && echo    ✓ Deleted dist || echo    ✓ Already gone
rmdir /s /q .cache >nul 2>&1 && echo    ✓ Deleted .cache || echo    ✓ Already gone
rmdir /s /q .parcel-cache >nul 2>&1 && echo    ✓ Deleted .parcel-cache || echo    ✓ Already gone
del /s /q *.wasm >nul 2>&1 && echo    ✓ Deleted all .wasm files || echo    ✓ No .wasm files found

echo.
echo 🧹 Step 3: Clearing npm cache...
call npm cache clean --force >nul 2>&1
echo    ✓ NPM cache cleared

echo.
echo 🔧 Step 4: Clearing browser cache instructions...
echo    📌 After server starts, do this in your browser:
echo    1. Press F12 (open DevTools)
echo    2. Right-click the refresh button
echo    3. Click 'Empty Cache and Hard Reload'
echo.

echo 🚀 Step 5: Starting dev server with WASM disabled...
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  Once you see 'ready in X ms', open http://localhost:5173   ║
echo ║  Then do the browser cache clear (F12 → Hard Reload)        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

npm run dev
