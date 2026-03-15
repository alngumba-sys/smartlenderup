@echo off
echo.
echo ========================================
echo   FIXING WEBASSEMBLY ERROR NOW
echo ========================================
echo.
echo Stopping old server...
taskkill /F /IM node.exe >nul 2>&1

echo Deleting cache...
if exist .vite rd /s /q .vite >nul 2>&1
if exist dist rd /s /q dist >nul 2>&1

echo.
echo Starting server on PORT 5174...
echo.
start /B npm run dev

timeout /t 10 >nul

echo.
echo Opening browser in INCOGNITO mode...
echo.
start chrome.exe --incognito http://localhost:5174 2>nul
if errorlevel 1 start msedge.exe --inprivate http://localhost:5174 2>nul

echo.
echo ========================================
echo   DONE! Check your browser.
echo   URL should be: localhost:5174
echo ========================================
echo.
pause
