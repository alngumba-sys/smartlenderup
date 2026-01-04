@echo off
REM ============================================
REM DEPLOY AUTO-SYNC FIX TO PRODUCTION
REM ============================================

echo.
echo ============================================
echo    SUPER ADMIN AUTO-SYNC FIX
echo ============================================
echo.
echo This will deploy the automatic data sync
echo so Super Admin can see all borrowers/loans!
echo.

REM Add all changed files
echo [1/4] Adding modified files...
git add components/SuperAdminDashboard.tsx
git add utils/superAdminDataFix.ts
git add App.tsx
git add components/modals/OrganizationSignUpModal.tsx
git add deploy-auto-sync-fix.bat
git add QUICK_FIX_INSTRUCTIONS.md
git add SUPERADMIN_FIX_GUIDE.md

echo       DONE!
echo.

REM Show what will be committed
echo [2/4] Files to be deployed:
git status --short
echo.

REM Create commit
echo [3/4] Creating commit...
git commit -m "Fix: Super Admin auto-sync on portal load" -m "" -m "CRITICAL FIX: Super Admin data visibility" -m "" -m "Problem:" -m "- Super Admin showed 0 borrowers/loans" -m "- Data in localStorage but not synced to Supabase" -m "- Dashboard queries Supabase, sees nothing" -m "" -m "Solution:" -m "- Auto-sync runs when Super Admin portal opens" -m "- Syncs all localStorage data to Supabase automatically" -m "- Toast notification shows sync progress" -m "- Dashboard immediately shows correct counts" -m "" -m "Changes:" -m "- Added useEffect hook with auto-sync on mount" -m "- Imports syncAllDataToSupabase utility" -m "- Shows sync status with isSyncing state" -m "- Date picker mobile-friendly (HTML5 input)" -m "- Town/City now optional" -m "" -m "Testing:" -m "1. Open Super Admin (click logo 5 times)" -m "2. See 'Synced X records' toast" -m "3. Borrower Management shows clients" -m "4. Loan Management shows loans" -m "" -m "Manual sync if needed:" -m "window.syncAllDataToSupabase()"

if %ERRORLEVEL% EQU 0 (
    echo       DONE!
    echo.
) else (
    echo       No changes to commit ^(already committed^)
    echo.
)

REM Push to GitHub
echo [4/4] Ready to push to production...
echo.
set /p CONFIRM="Deploy to smartlenderup.com? (Y/N): "

if /i "%CONFIRM%"=="Y" (
    echo.
    echo       Pushing to GitHub...
    
    git push origin main
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ============================================
        echo    DEPLOYMENT SUCCESSFUL!
        echo ============================================
        echo.
        echo [NEXT STEPS]
        echo.
        echo 1. Wait 2 minutes for Netlify deployment
        echo.
        echo 2. Go to: https://smartlenderup.com
        echo.
        echo 3. Click logo 5 times (Super Admin)
        echo.
        echo 4. Watch for "Synced X records" toast
        echo.
        echo 5. Check Borrower Management tab
        echo    - Should show your client^(s^)
        echo.
        echo 6. Check Loan Management tab
        echo    - Should show your loan^(s^)
        echo.
        echo 7. If still 0, open Console (F12) and run:
        echo    window.syncAllDataToSupabase()
        echo.
        echo ============================================
        echo.
    ) else (
        echo.
        echo [ERROR] Push failed!
        echo.
        echo Try running: git push origin main
        echo.
    )
) else (
    echo.
    echo [CANCELLED] Changes committed locally only.
    echo.
    echo To deploy later, run: git push origin main
    echo.
)

pause
