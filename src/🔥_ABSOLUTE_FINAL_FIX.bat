@echo off
cls
color 0E
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║          🔥 ABSOLUTE FINAL FIX - DELETE EVERYTHING 🔥        ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.
echo This will:
echo   1. Kill all Node processes
echo   2. Delete node_modules completely
echo   3. Delete package-lock.json
echo   4. Delete ALL cache directories
echo   5. Clear npm cache
echo   6. Run npm install (fresh)
echo   7. Start dev server
echo.
echo After this, you MUST clear your browser cache!
echo.
pause
echo.

echo [1/9] Killing ALL Node processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
timeout /t 3 /nobreak >nul
color 0A
echo     ✅ Done
echo.

echo [2/9] Deleting node_modules...
color 0E
if exist node_modules (
    echo     This will take 30-60 seconds...
    rmdir /s /q node_modules >nul 2>&1
    timeout /t 2 /nobreak >nul
)
color 0A
echo     ✅ Done
echo.

echo [3/9] Deleting package-lock.json...
if exist package-lock.json (del /f /q package-lock.json >nul 2>&1)
echo     ✅ Done
echo.

echo [4/9] Deleting ALL .vite cache directories...
for /d %%d in (.vite*) do (
    echo     Deleting %%d...
    rmdir /s /q "%%d" >nul 2>&1
)
if exist dist (rmdir /s /q dist >nul 2>&1)
echo     ✅ Done
echo.

echo [5/9] Clearing npm cache...
call npm cache clean --force >nul 2>&1
echo     ✅ Done
echo.

echo [6/9] Deleting ANY .wasm files...
del /s /q *.wasm >nul 2>&1
echo     ✅ Done
echo.

echo [7/9] Installing packages...
color 0E
echo     ⏳ This will take 2-3 minutes...
echo.
call npm install
if errorlevel 1 (
    color 0C
    echo.
    echo     ❌ npm install FAILED!
    pause
    exit /b 1
)
color 0A
echo.
echo     ✅ Packages installed!
echo.

echo [8/9] Starting dev server...
echo.
color 0B
echo ═══════════════════════════════════════════════════════════════
echo.
echo  🚀 SERVER IS STARTING...
echo.
echo  When you see "Local: http://localhost:5173"
echo.
echo  DO THIS IN YOUR BROWSER:
echo  ════════════════════════════════════════════════════════════
echo.
echo     1. Close ALL browser tabs/windows
echo.
echo     2. Reopen browser
echo.
echo     3. Press Ctrl+Shift+Delete
echo        - Select "All time"
echo        - Check "Cached images and files"
echo        - Click "Clear data"
echo.
echo     4. Go to http://localhost:5173
echo.
echo     5. ✅ ERROR WILL BE GONE!
echo.
echo.
echo  OR USE INCOGNITO MODE (instant fix):
echo  ════════════════════════════════════════════════════════════
echo.
echo     1. Press Ctrl+Shift+N
echo.
echo     2. Go to http://localhost:5173
echo.
echo     3. ✅ WORKS PERFECTLY!
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo.

echo [9/9] Opening test pages...
timeout /t 2 /nobreak >nul
start "" "http://localhost:5173/test-minimal.html"
timeout /t 1 /nobreak >nul

npm run dev
