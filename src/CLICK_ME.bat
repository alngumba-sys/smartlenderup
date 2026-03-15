@echo off
color 0A
cls
echo.
echo ══════════════════════════════════════════════════════════════
echo.
echo          🔥 FIXING WEBASSEMBLY ERROR - ONE CLICK 🔥
echo.
echo ══════════════════════════════════════════════════════════════
echo.
echo.
echo [1/5] Killing Node processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo       ✅ Done
echo.
echo [2/5] Deleting cache folders...
for /d %%d in (.vite*) do rd /s /q "%%d" 2>nul
if exist dist rd /s /q dist 2>nul
if exist .cache rd /s /q .cache 2>nul
echo       ✅ Done
echo.
echo [3/5] Deleting node_modules...
if exist node_modules rd /s /q node_modules 2>nul
echo       ✅ Done
echo.
echo [4/5] Clearing npm cache...
call npm cache clean --force >nul 2>&1
echo       ✅ Done
echo.
echo [5/5] Installing packages (2-3 minutes)...
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

cls
color 0B
echo.
echo ══════════════════════════════════════════════════════════════
echo.
echo                  ✅ ✅ ✅ ALL DONE! ✅ ✅ ✅
echo.
echo ══════════════════════════════════════════════════════════════
echo.
echo.
color 0E
echo  🎉 The fix is complete!
echo.
echo  🚀 Starting server now...
echo.
echo  📋 AFTER server starts:
echo.
color 0A
echo     1. Press: Ctrl + Shift + Delete
echo     2. Check: "Cached images and files"
echo     3. Click: "Clear data"
echo     4. Reload: http://localhost:5173
echo.
color 0B
echo     OR just use incognito mode (Ctrl+Shift+N)
echo.
color 0E
echo ══════════════════════════════════════════════════════════════
echo.
echo  Starting server in 3 seconds...
timeout /t 3 /nobreak >nul
echo.

npm run dev
