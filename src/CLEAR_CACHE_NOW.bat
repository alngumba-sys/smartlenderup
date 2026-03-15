@echo off
cls
echo.
echo ================================================================
echo           CLEARING ALL CACHE - COMPLETE WIPE
echo ================================================================
echo.

echo [1/5] Stopping all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo       Done!
echo.

echo [2/5] Deleting .vite folders...
for /d %%i in (.vite*) do (
    echo       Deleting: %%i
    rd /s /q "%%i" 2>nul
)
echo       Done!
echo.

echo [3/5] Deleting dist folder...
if exist "dist" (
    echo       Deleting: dist
    rd /s /q "dist" 2>nul
)
echo       Done!
echo.

echo [4/5] Deleting node_modules\.vite...
if exist "node_modules\.vite" (
    echo       Deleting: node_modules\.vite
    rd /s /q "node_modules\.vite" 2>nul
)
echo       Done!
echo.

echo [5/5] Deleting .cache...
if exist ".cache" (
    echo       Deleting: .cache
    rd /s /q ".cache" 2>nul
)
echo       Done!
echo.

echo ================================================================
echo                   CACHE CLEARED SUCCESSFULLY!
echo ================================================================
echo.
echo Now run: npm run dev
echo.
echo The app will open at: http://localhost:5174
echo.
pause
