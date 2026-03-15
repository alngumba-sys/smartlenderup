@echo off
color 0C
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          🔥🔥🔥 NUCLEAR OPTION - TOTAL RESET 🔥🔥🔥          ║
echo ║                                                              ║
echo ║     This will DELETE EVERYTHING and start 100%% fresh!      ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo.
color 0E
echo ⚠️  WARNING: This will take 5-10 minutes
echo.
echo What this does:
echo   1. Kills ALL Node processes
echo   2. Deletes node_modules COMPLETELY
echo   3. Deletes ALL cache folders
echo   4. Deletes package-lock.json
echo   5. Clears npm cache (force)
echo   6. Fresh npm install from scratch
echo   7. Starts server
echo.
color 0C
set /p confirm="Type YES to continue: "
if /i not "%confirm%"=="YES" (
    echo.
    echo Cancelled.
    pause
    exit /b 0
)

cls
color 0A
echo.
echo ══════════════════════════════════════════════════════════════
echo   STEP 1: KILLING ALL NODE PROCESSES
echo ══════════════════════════════════════════════════════════════
echo.
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
taskkill /F /IM vite.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✅ All Node processes killed
echo.
echo.

echo ══════════════════════════════════════════════════════════════
echo   STEP 2: DELETING NODE_MODULES (this may take a minute)
echo ══════════════════════════════════════════════════════════════
echo.
if exist node_modules (
    rd /s /q node_modules 2>nul
    echo ✅ node_modules deleted
) else (
    echo ℹ️  node_modules doesn't exist
)
echo.
echo.

echo ══════════════════════════════════════════════════════════════
echo   STEP 3: DELETING ALL CACHE FOLDERS
echo ══════════════════════════════════════════════════════════════
echo.
for /d %%d in (.vite*) do (
    rd /s /q "%%d" 2>nul
    echo ✅ Deleted %%d
)
if exist dist (
    rd /s /q dist 2>nul
    echo ✅ Deleted dist
)
if exist .cache (
    rd /s /q .cache 2>nul
    echo ✅ Deleted .cache
)
if exist .turbo (
    rd /s /q .turbo 2>nul
    echo ✅ Deleted .turbo
)
echo.
echo.

echo ══════════════════════════════════════════════════════════════
echo   STEP 4: DELETING package-lock.json
echo ══════════════════════════════════════════════════════════════
echo.
if exist package-lock.json (
    del /f /q package-lock.json 2>nul
    echo ✅ package-lock.json deleted
) else (
    echo ℹ️  package-lock.json doesn't exist
)
echo.
echo.

echo ══════════════════════════════════════════════════════════════
echo   STEP 5: CLEARING NPM CACHE
echo ══════════════════════════════════════════════════════════════
echo.
call npm cache clean --force
echo ✅ npm cache cleared
echo.
echo.

echo ══════════════════════════════════════════════════════════════
echo   STEP 6: VERIFYING NO @supabase PACKAGES
echo ══════════════════════════════════════════════════════════════
echo.
findstr /i /c:"@supabase" package.json >nul
if errorlevel 1 (
    echo ✅ No @supabase packages in package.json
) else (
    color 0C
    echo.
    echo ❌ ERROR: Found @supabase in package.json!
    echo.
    echo Please remove all @supabase packages from package.json first.
    echo.
    pause
    exit /b 1
)
echo.
echo.

echo ══════════════════════════════════════════════════════════════
echo   STEP 7: FRESH NPM INSTALL (3-5 minutes)
echo ══════════════════════════════════════════════════════════════
echo.
echo Installing...
echo.
call npm install

if errorlevel 1 (
    color 0C
    echo.
    echo ══════════════════════════════════════════════════════════════
    echo   ❌ NPM INSTALL FAILED!
    echo ══════════════════════════════════════════════════════════════
    echo.
    echo Possible fixes:
    echo   1. Check your internet connection
    echo   2. Try running as Administrator
    echo   3. Delete node_modules and try again
    echo.
    pause
    exit /b 1
)

cls
color 0B
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║              ✅✅✅ INSTALLATION COMPLETE! ✅✅✅            ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo.
color 0E
echo   🎉 Everything is now 100%% fresh!
echo.
echo   📁 Installed packages: 
dir node_modules 2>nul | find "DIR" | find /c /v ""
echo.
echo   🚀 Starting development server...
echo.
color 0A
echo ══════════════════════════════════════════════════════════════
echo   📋 IMPORTANT - DO THIS AFTER SERVER STARTS:
echo ══════════════════════════════════════════════════════════════
echo.
color 0E
echo   Method 1: Clear Browser Cache (PERMANENT FIX)
echo   ─────────────────────────────────────────────────────────
echo     1. Press: Ctrl + Shift + Delete
echo     2. Select: "All time" 
echo     3. Check: "Cached images and files"
echo     4. Click: "Clear data"
echo     5. Reload: http://localhost:5173
echo.
color 0B
echo   Method 2: Use Incognito Mode (INSTANT TEST)
echo   ─────────────────────────────────────────────────────────
echo     1. Press: Ctrl + Shift + N
echo     2. Go to: http://localhost:5173
echo     3. ✅ ERROR WILL BE GONE!
echo.
color 0E
echo ══════════════════════════════════════════════════════════════
echo.
echo   Starting server in 3 seconds...
timeout /t 3 /nobreak >nul
echo.
echo.

npm run dev
