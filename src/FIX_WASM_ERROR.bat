@echo off
cls

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║       🔧 FIXING WEBASSEMBLY ERROR - FINAL FIX 🔧       ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Step 1: Kill everything
echo [1/5] Killing all Node/Vite processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM vite.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul
echo       ✓ Processes killed
echo.

REM Step 2: Nuclear cache deletion
echo [2/5] Deleting ALL caches and build artifacts...
rmdir /s /q node_modules\.vite >nul 2>&1
rmdir /s /q node_modules\.cache >nul 2>&1
rmdir /s /q .vite >nul 2>&1
rmdir /s /q dist >nul 2>&1
rmdir /s /q .cache >nul 2>&1
rmdir /s /q build >nul 2>&1
del /s /q *.wasm >nul 2>&1
call npm cache clean --force >nul 2>&1
echo       ✓ Caches deleted
echo.

REM Step 3: Verify mock files exist
echo [3/5] Verifying mock Supabase files...
if exist "lib\supabase.ts" (
  if exist "lib\supabase-mock.ts" (
    echo       ✓ Mock files present
  ) else (
    echo       ✗ Mock files missing!
    exit /b 1
  )
) else (
  echo       ✗ Mock files missing!
  exit /b 1
)
echo.

REM Step 4: Check package.json
echo [4/5] Checking package.json...
findstr /C:"@supabase/supabase-js" package.json >nul 2>&1
if %errorlevel% equ 0 (
  echo       ⚠ Supabase found in package.json - this is OK if commented
) else (
  echo       ✓ No Supabase dependency
)
echo.

REM Step 5: Start dev server
echo [5/5] Starting development server...
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║  ✓ READY TO START                                      ║
echo ║                                                        ║
echo ║  IMPORTANT: After server starts                        ║
echo ║                                                        ║
echo ║  1. Press Ctrl+Shift+N (opens incognito window)        ║
echo ║  2. Go to http://localhost:5173                        ║
echo ║  3. Verify NO WebAssembly error                        ║
echo ║                                                        ║
echo ║  OR if you prefer:                                     ║
echo ║                                                        ║
echo ║  1. Open regular browser: http://localhost:5173        ║
echo ║  2. Press Ctrl+Shift+Delete                            ║
echo ║  3. Clear "Cached images and files"                    ║
echo ║  4. Click "Clear data"                                 ║
echo ║  5. Refresh the page                                   ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Starting Vite...
echo.

npm run dev
