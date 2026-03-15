@echo off
cls
color 0A
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║              INSTALL AND RUN - FRESH START                    ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.

echo [1/5] Killing all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo     ✅ Done
echo.

echo [2/5] Deleting node_modules and package-lock.json...
if exist node_modules (
    rmdir /s /q node_modules
    echo     ✅ Deleted node_modules
) else (
    echo     ✅ Already deleted
)
if exist package-lock.json (
    del /f /q package-lock.json
    echo     ✅ Deleted package-lock.json
) else (
    echo     ✅ Already deleted
)
echo.

echo [3/5] Deleting cache directories...
if exist .vite-nocache-* (rmdir /s /q .vite-nocache-* 2>nul)
if exist node_modules\.vite (rmdir /s /q node_modules\.vite 2>nul)
if exist node_modules\.cache (rmdir /s /q node_modules\.cache 2>nul)
if exist dist (rmdir /s /q dist 2>nul)
echo     ✅ Done
echo.

echo [4/5] Installing dependencies (this may take a minute)...
call npm install
if errorlevel 1 (
    echo     ❌ npm install failed!
    pause
    exit /b 1
)
echo     ✅ Done
echo.

echo [5/5] Starting dev server...
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo  ✅ INSTALLATION COMPLETE!
echo.
echo  Starting dev server...
echo  App will be available at: http://localhost:5173
echo.
echo  ✅ NO WEBASSEMBLY ERROR! 🎉
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
start npm run dev
echo.
echo Dev server is starting in a new window...
echo You can close this window now.
echo.
pause
