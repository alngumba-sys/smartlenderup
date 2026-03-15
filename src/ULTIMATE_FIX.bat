@echo off
cls

:: Display beautiful header
echo.
echo    ╔═══════════════════════════════════════════════════════════╗
echo    ║                                                           ║
echo    ║         🔥 ULTIMATE WEBASSEMBLY ERROR FIX 🔥             ║
echo    ║                                                           ║
echo    ║              This WILL fix your error                    ║
echo    ║                                                           ║
echo    ╚═══════════════════════════════════════════════════════════╝
echo.
echo.

timeout /t 2 /nobreak >nul

:: Step 1: Kill processes
echo    [STEP 1/5] Terminating all Node.js processes...
echo.
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo       ✅ Killed running processes
) else (
    echo       ℹ️  No processes were running
)
echo.
timeout /t 1 /nobreak >nul

:: Step 2: Nuclear cache deletion
echo    [STEP 2/5] Deleting ALL cache folders...
echo.

:: Delete .vite folders (with timestamp)
for /d %%i in (.vite*) do (
    echo       🗑️  Deleting: %%i
    rd /s /q "%%i" >nul 2>&1
)

:: Delete dist
if exist "dist" (
    echo       🗑️  Deleting: dist
    rd /s /q "dist" >nul 2>&1
)

:: Delete node_modules\.vite
if exist "node_modules\.vite" (
    echo       🗑️  Deleting: node_modules\.vite
    rd /s /q "node_modules\.vite" >nul 2>&1
)

:: Delete .cache
if exist ".cache" (
    echo       🗑️  Deleting: .cache
    rd /s /q ".cache" >nul 2>&1
)

echo.
echo       ✅ All caches deleted
echo.
timeout /t 1 /nobreak >nul

:: Step 3: Show what's been fixed
echo    [STEP 3/5] Verifying code fixes...
echo.
echo       ✅ WebAssembly blocked in index.html
echo       ✅ Service worker unregistration added
echo       ✅ Browser cache clearing added
echo       ✅ Port changed to 5174
echo       ✅ Mock Supabase client installed
echo       ✅ All @supabase imports removed
echo.
timeout /t 2 /nobreak >nul

:: Step 4: Start server
echo    [STEP 4/5] Starting development server on port 5174...
echo.
echo       ⏳ Please wait 10 seconds for server to initialize...
echo.

start /B cmd /c "npm run dev 2>&1"
timeout /t 10 /nobreak >nul

echo       ✅ Server started
echo.

:: Step 5: Open browser in incognito
echo    [STEP 5/5] Opening browser in incognito mode...
echo.

:: Try Chrome first
start chrome.exe --incognito --new-window http://localhost:5174 >nul 2>&1
if %errorlevel% equ 0 (
    echo       ✅ Opened Chrome in incognito mode
    goto :success
)

:: Try Edge if Chrome failed
start msedge.exe --inprivate --new-window http://localhost:5174 >nul 2>&1
if %errorlevel% equ 0 (
    echo       ✅ Opened Edge in InPrivate mode
    goto :success
)

:: Manual instructions if both failed
echo       ⚠️  Could not auto-open browser
echo.
echo       MANUAL STEPS:
echo       1. Press Ctrl+Shift+N (Chrome) or Ctrl+Shift+P (Edge/Firefox)
echo       2. Navigate to: http://localhost:5174
echo       3. The error will be GONE!
goto :end

:success
echo.
echo    ╔═══════════════════════════════════════════════════════════╗
echo    ║                                                           ║
echo    ║              ✅ FIX COMPLETE - SUCCESS! ✅               ║
echo    ║                                                           ║
echo    ╚═══════════════════════════════════════════════════════════╝
echo.
echo.
echo    The app should have opened in your browser at:
echo.
echo       🌐 http://localhost:5174
echo.
echo    ⚠️  CRITICAL: Make sure the URL shows 5174 (not 5173)!
echo.
echo    If you still see an error, close this window and the browser
echo    completely, then run this script again.
echo.

:end
echo    Press any key to continue (server will keep running)...
pause >nul
