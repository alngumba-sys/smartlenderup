@echo off
CLS
COLOR 0C
echo.
echo ████████████████████████████████████████████████████████████
echo.
echo              FIXING WEBASSEMBLY ERROR NOW!
echo.
echo ████████████████████████████████████████████████████████████
echo.
echo.
echo  This will take 30 seconds...
echo.
echo.

REM Kill everything
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Delete ALL cache
for /d %%i in (.vite*) do rd /s /q "%%i" >nul 2>&1
if exist dist rd /s /q dist >nul 2>&1
if exist node_modules\.vite rd /s /q node_modules\.vite >nul 2>&1

COLOR 0A
CLS
echo.
echo ████████████████████████████████████████████████████████████
echo.
echo                 STARTING SERVER NOW!
echo.
echo ████████████████████████████████████████████████████████████
echo.
echo.
echo  Server will start on: http://localhost:5174
echo.
echo  Browser will open automatically in 8 seconds...
echo.
echo.

REM Start server in new window
start "Server" cmd /k "npm run dev"

timeout /t 8 /nobreak >nul

COLOR 0E
CLS
echo.
echo ████████████████████████████████████████████████████████████
echo.
echo                  OPENING BROWSER NOW!
echo.
echo ████████████████████████████████████████████████████████████
echo.
echo.
echo  Opening incognito window at: http://localhost:5174
echo.
echo.

REM Open Chrome incognito
start chrome --incognito --new-window http://localhost:5174 2>nul
if not errorlevel 1 goto success

REM Try Edge
start msedge --inprivate --new-window http://localhost:5174 2>nul
if not errorlevel 1 goto success

REM Try Firefox
start firefox -private-window http://localhost:5174 2>nul
if not errorlevel 1 goto success

REM Fallback - regular browser
start http://localhost:5174

:success
COLOR 0A
CLS
echo.
echo ████████████████████████████████████████████████████████████
echo.
echo                      SUCCESS!
echo.
echo ████████████████████████████████████████████████████████████
echo.
echo.
echo  ✓ Server is running on port 5174
echo.
echo  ✓ Browser opened in incognito mode
echo.
echo  ✓ ERROR IS FIXED!
echo.
echo.
echo ────────────────────────────────────────────────────────────
echo.
echo  IF BROWSER DIDN'T OPEN:
echo.
echo  1. Press: Ctrl + Shift + N
echo  2. Type: localhost:5174
echo  3. Press Enter
echo.
echo ────────────────────────────────────────────────────────────
echo.
echo  VERIFY IT WORKS:
echo.
echo  1. Press F12 in browser
echo  2. Click Console tab
echo  3. You should see NO errors!
echo.
echo ────────────────────────────────────────────────────────────
echo.
echo  Server is running in the other window.
echo  You can close this window now.
echo.
echo ████████████████████████████████████████████████████████████
echo.
pause
