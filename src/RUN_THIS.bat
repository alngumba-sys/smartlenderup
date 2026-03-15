@echo off
cls
echo.
echo ================================================================
echo             WEBASSEMBLY ERROR FIX - RUNNING NOW
echo ================================================================
echo.
echo This will:
echo   1. Stop all Node.js processes
echo   2. Delete cache folders
echo   3. Start server on port 5174
echo   4. Open browser automatically
echo.
echo ================================================================
echo.

REM Kill all node processes
echo [1/4] Stopping Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Delete cache folders
echo [2/4] Deleting cache...
if exist ".vite" rd /s /q ".vite" >nul 2>&1
if exist "dist" rd /s /q "dist" >nul 2>&1
if exist "node_modules\.vite" rd /s /q "node_modules\.vite" >nul 2>&1

REM Start server
echo [3/4] Starting server on port 5174...
echo.
echo Please wait 10 seconds...
echo.
start /B npm run dev

REM Wait for server to start
timeout /t 10 /nobreak

REM Open browser in incognito
echo [4/4] Opening browser...
start chrome.exe --incognito http://localhost:5174 2>nul
if %errorlevel% neq 0 (
  start msedge.exe --inprivate http://localhost:5174 2>nul
)

echo.
echo ================================================================
echo                         FIX COMPLETE!
echo ================================================================
echo.
echo The app should open at: http://localhost:5174
echo.
echo If you still see errors:
echo   - Press Ctrl+Shift+Delete
echo   - Clear "Cached images and files"
echo   - Reload the page
echo.
echo ================================================================
echo.
pause
