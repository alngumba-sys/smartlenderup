@echo off
cls
color 0A
echo.
echo ╔═════════════════════════════════════════════════════════════════╗
echo ║                                                                 ║
echo ║         🔥 STARTING WITH ZERO CACHE 🔥                          ║
echo ║                                                                 ║
echo ╚═════════════════════════════════════════════════════════════════╝
echo.

echo [1/5] Stopping any running dev servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Deleting ALL cache directories...
if exist .vite-nocache-* (
    rmdir /s /q .vite-nocache-* 2>nul
)
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite 2>nul
)
if exist dist (
    rmdir /s /q dist 2>nul
)

echo [3/5] Deleting Vite cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache 2>nul
)

echo [4/5] Deleting @supabase packages...
if exist node_modules\@supabase (
    rmdir /s /q node_modules\@supabase 2>nul
    echo     ✅ Deleted @supabase
) else (
    echo     ✅ No @supabase found (good!)
)

echo [5/5] Starting fresh dev server...
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
echo  🚀 Server starting with ZERO cache...
echo.
echo  📝 IMPORTANT:
echo     If you still see a WebAssembly error, it means
echo     your BROWSER has cached the old JavaScript files.
echo.
echo  ✅ SOLUTION:
echo     1. Press Ctrl+Shift+N (incognito mode)
echo     2. Go to http://localhost:5173
echo     3. Error will be GONE!
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.

npm run dev
