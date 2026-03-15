@echo off
echo Checking for @supabase packages...
echo.

if exist "node_modules\@supabase" (
    echo 🔴 FOUND @supabase in node_modules!
    echo.
    echo Deleting it now...
    rmdir /s /q "node_modules\@supabase"
    echo ✅ Deleted!
) else (
    echo ✅ No @supabase folder found in node_modules
)

echo.
echo Checking package-lock.json for supabase...
findstr /i "supabase" package-lock.json 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo 🔴 FOUND supabase in package-lock.json!
    echo Deleting package-lock.json...
    del /f /q package-lock.json
    echo ✅ Deleted!
) else (
    echo ✅ No supabase in package-lock.json
)

echo.
echo Done!
pause
