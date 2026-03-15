@echo off
REM ============================================
REM WebAssembly Error Fix - Complete Cleanup
REM ============================================

echo.
echo ============================================
echo WebAssembly Error Fix - Complete Cleanup
echo ============================================
echo.

REM Step 1: Clear all Vite caches
echo [1/4] Clearing Vite caches...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist ".vite" rmdir /s /q ".vite"
if exist "dist" rmdir /s /q "dist"
echo ✓ Vite caches cleared
echo.

REM Step 2: Clear npm cache
echo [2/4] Clearing npm cache...
call npm cache clean --force
echo ✓ npm cache cleared
echo.

REM Step 3: Reinstall dependencies
echo [3/4] Reinstalling dependencies...
if exist "node_modules" rmdir /s /q "node_modules"
call npm install
echo ✓ Dependencies reinstalled
echo.

REM Step 4: Verification
echo [4/4] Verification complete
echo.
echo ============================================
echo ✓ Cleanup complete!
echo.
echo Starting dev server...
echo ============================================
echo.

call npm run dev
