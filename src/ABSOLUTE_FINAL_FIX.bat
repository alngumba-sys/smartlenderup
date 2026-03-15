@echo off
cls
echo.
echo ================================================================
echo          ABSOLUTE FINAL FIX - NUCLEAR OPTION
echo ================================================================
echo.
echo Killing all Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo Deleting ALL cache folders...
if exist .vite rd /s /q .vite 2>nul
if exist .vite-cache rd /s /q .vite-cache 2>nul
if exist dist rd /s /q dist 2>nul
if exist node_modules\.vite rd /s /q node_modules\.vite 2>nul

echo Cleaning npm cache...
call npm cache clean --force >nul 2>&1

echo.
echo ================================================================
echo          STARTING SERVER ON PORT 5174
echo ================================================================
echo.
echo Please wait while the server starts...
echo.

start /B cmd /c "npm run dev > server.log 2>&1"

timeout /t 8 >nul

echo.
echo ================================================================
echo          OPENING BROWSER IN INCOGNITO MODE
echo ================================================================
echo.

REM Try Chrome first
start chrome.exe --incognito http://localhost:5174 2>nul && (
    echo Opened Chrome in incognito mode
    goto :done
)

REM Try Edge
start msedge.exe --inprivate http://localhost:5174 2>nul && (
    echo Opened Edge in InPrivate mode
    goto :done
)

REM Try Firefox
start firefox.exe -private-window http://localhost:5174 2>nul && (
    echo Opened Firefox in private window
    goto :done
)

echo.
echo Could not auto-open browser.
echo.
echo PLEASE DO THIS MANUALLY:
echo 1. Press Ctrl + Shift + N
echo 2. Go to: http://localhost:5174
echo.

:done
echo.
echo ================================================================
echo          FIX COMPLETE!
echo ================================================================
echo.
echo The app should now be running at: http://localhost:5174
echo.
echo CRITICAL: Make sure you see "5174" in the URL, NOT "5173"!
echo.
echo Press any key to view server logs...
pause >nul
type server.log
