@echo off
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║           🔥 NUCLEAR CACHE CLEAR 🔥                          ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo [1/7] Stopping Vite dev server...
taskkill /F /IM node.exe 2>nul
echo     ✅ Done
echo.

echo [2/7] Deleting ALL .vite cache folders...
if exist .vite rmdir /s /q .vite
if exist .vite-cache* rmdir /s /q .vite-cache*
if exist .vite-nocache* rmdir /s /q .vite-nocache*
if exist node_modules\.vite rmdir /s /q node_modules\.vite
echo     ✅ Done
echo.

echo [3/7] Deleting Vite dependency cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo     ✅ Done
echo.

echo [4/7] Deleting node_modules...
if exist node_modules rmdir /s /q node_modules
echo     ✅ Done
echo.

echo [5/7] Deleting package-lock.json...
if exist package-lock.json del /f /q package-lock.json
echo     ✅ Done
echo.

echo [6/7] Reinstalling dependencies...
call npm install
echo     ✅ Done
echo.

echo [7/7] Starting fresh dev server...
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║  ✅ Everything cleared! Starting Vite...                     ║
echo ║                                                              ║
echo ║  After it starts, press Ctrl+Shift+N (incognito)            ║
echo ║  Then go to http://localhost:5173                           ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

call npm run dev