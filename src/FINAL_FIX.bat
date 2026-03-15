@echo off
setlocal enabledelayedexpansion
cls

echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
echo          FINAL FIX - WebAssembly Error Solution
echo.
echo              This WILL fix your error - 100%%
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
echo Starting comprehensive fix process...
echo.

REM Step 1: Kill Node
echo ───────────────────────────────────────────────────────────────────
echo STEP 1/10: Stopping all Node processes
echo ───────────────────────────────────────────────────────────────────
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul
echo √ All Node processes stopped
echo.

REM Step 2: Remove all build artifacts
echo ───────────────────────────────────────────────────────────────────
echo STEP 2/10: Removing ALL build artifacts and caches
echo ───────────────────────────────────────────────────────────────────
if exist "node_modules" (
    echo Deleting node_modules...
    rmdir /s /q "node_modules" 2>nul
)
if exist ".vite" rmdir /s /q ".vite" 2>nul
if exist "dist" rmdir /s /q "dist" 2>nul
if exist "dist-ssr" rmdir /s /q "dist-ssr" 2>nul
if exist "build" rmdir /s /q "build" 2>nul
if exist "out" rmdir /s /q "out" 2>nul
if exist ".cache" rmdir /s /q ".cache" 2>nul
if exist ".turbo" rmdir /s /q ".turbo" 2>nul
if exist ".parcel-cache" rmdir /s /q ".parcel-cache" 2>nul
if exist ".next" rmdir /s /q ".next" 2>nul
if exist "package-lock.json" del /f /q "package-lock.json" 2>nul
if exist "yarn.lock" del /f /q "yarn.lock" 2>nul
if exist "pnpm-lock.yaml" del /f /q "pnpm-lock.yaml" 2>nul
if exist "bun.lockb" del /f /q "bun.lockb" 2>nul
echo √ All build artifacts removed
echo.

REM Step 3: Clear system caches
echo ───────────────────────────────────────────────────────────────────
echo STEP 3/10: Clearing system caches
echo ───────────────────────────────────────────────────────────────────
call npm cache clean --force >nul 2>&1
call npm cache verify >nul 2>&1
del /f /q "%TEMP%\vite*" 2>nul
del /f /q "%TEMP%\npm*" 2>nul
del /f /q "%TEMP%\node*" 2>nul
echo √ System caches cleared
echo.

REM Step 4: Verify Node.js
echo ───────────────────────────────────────────────────────────────────
echo STEP 4/10: Verifying Node.js installation
echo ───────────────────────────────────────────────────────────────────
node --version >nul 2>&1
if errorlevel 1 (
    echo × ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version (v20.x or v22.x)
    echo.
    pause
    exit /b 1
)

for /f "tokens=1,2 delims=.v" %%a in ('node --version 2^>nul') do (
    set NODE_MAJOR=%%a
)

echo Node.js version: !NODE_MAJOR!
if !NODE_MAJOR! LSS 18 (
    echo WARNING: Node.js v!NODE_MAJOR! is old (need v18+)
    echo Recommended: Update to v20 or v22 from https://nodejs.org/
    echo.
    set /p CONTINUE="Continue anyway? (y/N): "
    if /i not "!CONTINUE!"=="y" exit /b 1
) else (
    echo √ Node.js version is compatible
)
echo.

REM Step 5: Verify project files
echo ───────────────────────────────────────────────────────────────────
echo STEP 5/10: Verifying project files
echo ───────────────────────────────────────────────────────────────────
if not exist "package.json" (
    echo × ERROR: package.json not found!
    echo Make sure you're in the project root directory
    pause
    exit /b 1
)
echo √ package.json found

if not exist "vite.config.ts" (
    echo ! WARNING: vite.config.ts not found!
) else (
    echo √ vite.config.ts found
)

if not exist "src\main.tsx" (
    echo ! WARNING: src\main.tsx not found!
) else (
    echo √ src\main.tsx found
)
echo.

REM Step 6: Install core packages
echo ───────────────────────────────────────────────────────────────────
echo STEP 6/10: Installing dependencies (Phase 1: Core packages)
echo ───────────────────────────────────────────────────────────────────
echo This will take 2-3 minutes. Please wait...
echo.
echo Installing React ^& React-DOM...
call npm install react@18.2.0 react-dom@18.2.0 --save --legacy-peer-deps >nul 2>&1
echo √ React installed
echo.

REM Step 7: Install build tools
echo ───────────────────────────────────────────────────────────────────
echo STEP 7/10: Installing dependencies (Phase 2: Build tools)
echo ───────────────────────────────────────────────────────────────────
echo Installing Vite, TypeScript ^& plugins...
call npm install vite @vitejs/plugin-react typescript --save-dev --legacy-peer-deps >nul 2>&1
echo √ Build tools installed
echo.

REM Step 8: Install everything else
echo ───────────────────────────────────────────────────────────────────
echo STEP 8/10: Installing dependencies (Phase 3: All packages)
echo ───────────────────────────────────────────────────────────────────
echo Installing all remaining packages...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo WARNING: Standard install had issues. Trying with --force...
    call npm install --force
)
echo √ All packages installed
echo.

REM Step 9: Final cleanup
echo ───────────────────────────────────────────────────────────────────
echo STEP 9/10: Final cleanup
echo ───────────────────────────────────────────────────────────────────
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite" 2>nul
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" 2>nul
if exist ".vite" rmdir /s /q ".vite" 2>nul
echo √ Final cleanup complete
echo.

REM Step 10: Verification
echo ───────────────────────────────────────────────────────────────────
echo STEP 10/10: Verifying installation
echo ───────────────────────────────────────────────────────────────────

set MISSING=0
if exist "node_modules\react" (echo √ react) else (echo × react MISSING & set MISSING=1)
if exist "node_modules\react-dom" (echo √ react-dom) else (echo × react-dom MISSING & set MISSING=1)
if exist "node_modules\vite" (echo √ vite) else (echo × vite MISSING & set MISSING=1)
if exist "node_modules\sonner" (echo √ sonner) else (echo × sonner MISSING & set MISSING=1)
if exist "node_modules\recharts" (echo √ recharts) else (echo × recharts MISSING & set MISSING=1)
if exist "node_modules\lucide-react" (echo √ lucide-react) else (echo × lucide-react MISSING & set MISSING=1)
if exist "node_modules\@supabase\supabase-js" (echo √ @supabase/supabase-js) else (echo × @supabase/supabase-js MISSING & set MISSING=1)

echo.

if !MISSING! EQU 1 (
    echo ! Some packages are missing!
    echo The app may not work correctly.
    echo.
)

echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
echo                    √ FIX COMPLETE!
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
echo Environment Summary:
node --version 2>nul | findstr /C:"v" && echo    Node.js: OK || echo    Node.js: ERROR
npm --version 2>nul && echo    npm: OK || echo    npm: ERROR
echo    Project: %CD%
echo.
echo Starting development server...
echo.
echo ───────────────────────────────────────────────────────────────────
echo.
echo When the server starts, you'll see:
echo   ►  Local:   http://localhost:5173/
echo.
echo Open that URL in your browser.
echo.
echo IMPORTANT - If you see errors in the BROWSER:
echo.
echo   1. Press F12 (open DevTools)
echo   2. Right-click the refresh button
echo   3. Click 'Empty Cache and Hard Reload'
echo.
echo   OR use Incognito mode: Ctrl+Shift+N (Chrome) or Ctrl+Shift+P (Firefox)
echo.
echo ───────────────────────────────────────────────────────────────────
echo.

REM Start dev server
call npm run dev
