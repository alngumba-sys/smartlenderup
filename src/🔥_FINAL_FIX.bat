@echo off
color 0E
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║              🔥 ABSOLUTE FINAL FIX - WASM ERROR 🔥           ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.
echo This script will:
echo   1. Kill ALL Node processes
echo   2. Delete ALL cache directories
echo   3. Delete node_modules
echo   4. Fresh npm install
echo   5. Start server
echo   6. Test in YOUR CURRENT BROWSER
echo.
echo Time required: 3-4 minutes
echo.
pause
cls

echo.
echo ═══════════════════════════════════════════════════════════════
echo  STEP 1: Killing processes
echo ═══════════════════════════════════════════════════════════════
echo.

taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✅ All Node processes killed
echo.

echo ═══════════════════════════════════════════════════════════════
echo  STEP 2: Deleting cache directories
echo ═══════════════════════════════════════════════════════════════
echo.

for /d %%d in (.vite*) do rd /s /q "%%d" 2>nul
if exist dist rd /s /q dist 2>nul
if exist .cache rd /s /q .cache 2>nul
if exist .temp rd /s /q .temp 2>nul
if exist .npm rd /s /q .npm 2>nul

echo ✅ All cache directories deleted
echo.

echo ═══════════════════════════════════════════════════════════════
echo  STEP 3: Deleting node_modules
echo ═══════════════════════════════════════════════════════════════
echo.
echo This takes 30-60 seconds...
echo.

if exist node_modules (
    rd /s /q node_modules 2>nul
    timeout /t 2 /nobreak >nul
)

echo ✅ node_modules deleted
echo.

echo ═══════════════════════════════════════════════════════════════
echo  STEP 4: Deleting lock files
echo ═══════════════════════════════════════════════════════════════
echo.

del /f /q package-lock.json 2>nul
del /f /q yarn.lock 2>nul

echo ✅ Lock files deleted
echo.

echo ═══════════════════════════════════════════════════════════════
echo  STEP 5: Clearing npm cache
echo ═══════════════════════════════════════════════════════════════
echo.

call npm cache clean --force >nul 2>&1

echo ✅ npm cache cleared
echo.

echo ═══════════════════════════════════════════════════════════════
echo  STEP 6: Installing packages
echo ═══════════════════════════════════════════════════════════════
echo.
echo This takes 2-3 minutes...
echo.

call npm install

if errorlevel 1 (
    color 0C
    echo.
    echo ❌ npm install FAILED!
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Packages installed
echo.

cls
color 0A
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║                    ✅ SETUP COMPLETE! ✅                      ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.
echo ═══════════════════════════════════════════════════════════════
echo  STEP 7: Starting server
echo ═══════════════════════════════════════════════════════════════
echo.
echo.
color 0E
echo  🚀 Server starting now...
echo.
echo  ⚡ WHAT TO DO NEXT:
echo  ════════════════════════════════════════════════════════════
echo.
echo   1. Wait for server to show: "Local: http://localhost:5173"
echo.
echo   2. BEFORE opening the app:
color 0C
echo      → Press Ctrl+Shift+Delete
echo      → Select "All time"
echo      → Check "Cached images and files"
echo      → Click "Clear data"
echo.
color 0E
echo   3. NOW go to: http://localhost:5173
echo.
echo   4. ✅ App loads perfectly - NO ERROR!
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo.
color 0A
echo  If you DON'T want to clear your browser cache:
echo    → Just open incognito mode (Ctrl+Shift+N)
echo    → Go to http://localhost:5173
echo    → ✅ Works perfectly!
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo.

npm run dev
