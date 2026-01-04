@echo off
REM ============================================
REM DEPLOY SUPER ADMIN DATA FIX TO GITHUB
REM ============================================

echo.
echo ============================================
echo    DEPLOYING SUPER ADMIN FIX
echo ============================================
echo.

REM Step 1: Add all changes
echo [ADD] Adding Super Admin fix files...
git add utils/superAdminDataFix.ts
git add App.tsx
git add components/modals/OrganizationSignUpModal.tsx
git add deploy-superadmin-fix.bat
git add deploy-superadmin-fix.sh
git add SUPERADMIN_FIX_GUIDE.md

echo [OK] Files added
echo.

REM Step 2: Show git status
echo [STATUS] Git status:
git status --short
echo.

REM Step 3: Commit changes
echo [COMMIT] Creating commit...
git commit -m "Fix: Super Admin dashboard data visibility and Organization modal improvements" -m "" -m "SUPER ADMIN FIXES IMPLEMENTED" -m "" -m "Issues Fixed:" -m "- Super Admin dashboard now shows correct client/borrower counts" -m "- Super Admin can see loans and repayments across all organizations" -m "- Added data sync utility for Super Admin visibility" -m "- Date of Incorporation now uses mobile-friendly HTML5 date input" -m "- Town/City field is now optional (not required)" -m "" -m "New Features:" -m "- window.syncAllDataToSupabase() - Syncs all local data to Supabase" -m "- window.checkSupabaseData() - Checks what data exists in Supabase" -m "- Dual storage sync ensures Super Admin sees all data" -m "" -m "Files Modified:" -m "- /utils/superAdminDataFix.ts (NEW - data sync utility)" -m "- /App.tsx (registered new utility)" -m "- /components/modals/OrganizationSignUpModal.tsx (mobile date picker + optional town)" -m "" -m "How to Use:" -m "1. After deployment, open browser console" -m "2. Run: window.checkSupabaseData()" -m "3. If data is missing, run: window.syncAllDataToSupabase()" -m "4. Refresh Super Admin dashboard" -m "" -m "Status: Ready for production" -m "Date: January 1, 2026"

echo [OK] Commit created
echo.

REM Step 4: Push to GitHub
echo.
set /p CONFIRM="Ready to push to GitHub? (Y/N): "
echo.

if /i "%CONFIRM%"=="Y" (
    echo [PUSH] Pushing to GitHub...
    for /f "delims=" %%i in ('git branch --show-current') do set BRANCH=%%i
    git push origin %BRANCH%
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ============================================
        echo    DEPLOYMENT SUCCESSFUL!
        echo ============================================
        echo.
        echo [SUCCESS] Super Admin fix pushed!
        echo.
        echo [NEXT STEPS - CRITICAL]
        echo    1. Wait for Netlify auto-deployment (~2 minutes)
        echo    2. Open https://smartlenderup.com
        echo    3. Login and create a loan with repayment
        echo    4. Access Super Admin portal
        echo    5. Open browser console (F12)
        echo    6. Run: window.checkSupabaseData()
        echo    7. If counts are 0, run: window.syncAllDataToSupabase()
        echo    8. Refresh Super Admin dashboard
        echo    9. Verify all counts are correct
        echo.
        echo [CONSOLE COMMANDS]
        echo    window.checkSupabaseData()        - Check what's in Supabase
        echo    window.syncAllDataToSupabase()    - Sync all local data
        echo.
    ) else (
        echo.
        echo [ERROR] Push failed. Please check the error above.
        echo.
    )
) else (
    echo.
    echo [CANCELLED] Push cancelled. Changes are committed locally.
    echo             Run 'git push' manually when ready.
    echo.
)

echo.
echo [DONE] Script completed.
echo.
pause
