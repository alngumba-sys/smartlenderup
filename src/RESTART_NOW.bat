@echo off
cls
echo.
echo ============================================
echo    RESTARTING SERVER - CACHE WILL CLEAR
echo ============================================
echo.

REM Kill Node
taskkill /F /IM node.exe 2>nul

REM Wait a moment
timeout /t 2 /nobreak >nul

echo Starting server on port 5174...
echo.
echo Wait 10 seconds, then open:
echo http://localhost:5174
echo.

start npm run dev

timeout /t 10 /nobreak >nul

echo Opening browser...
start http://localhost:5174

echo.
echo DONE! App should open with no errors.
echo.
pause
