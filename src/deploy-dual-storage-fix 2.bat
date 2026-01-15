@echo off
REM ============================================
REM DEPLOY DUAL STORAGE SYNC FIX TO GITHUB
REM ============================================
REM This script commits and pushes the dual storage sync fix
REM that enables Super Admin to see all organization data

echo.
echo ============================================
echo    DEPLOYING DUAL STORAGE SYNC FIX
echo ============================================
echo.

REM Step 1: Show current branch
echo [BRANCH] Current branch:
git branch --show-current
echo.

REM Step 2: Show modified and new files
echo [FILES] Files to be committed:
echo.
echo New Files:
echo   [+] /utils/dualStorageSync.ts
echo   [+] /utils/migrateProjectStatesToTables.ts
echo   [+] /DUAL_STORAGE_SYNC_FIX.md
echo.
echo Modified Files:
echo   [*] /utils/singleObjectSync.ts
echo   [*] /contexts/DataContext.tsx
echo   [*] /components/superadmin/SettingsTab.tsx
echo.

REM Step 3: Add all changes
echo [ADD] Adding all changes...
git add utils/dualStorageSync.ts
git add utils/migrateProjectStatesToTables.ts
git add utils/singleObjectSync.ts
git add contexts/DataContext.tsx
git add components/superadmin/SettingsTab.tsx
git add DUAL_STORAGE_SYNC_FIX.md
git add deploy-dual-storage-fix.sh
git add deploy-dual-storage-fix.bat

echo [OK] Files added
echo.

REM Step 4: Show git status
echo [STATUS] Git status:
git status --short
echo.

REM Step 5: Commit with detailed message
echo [COMMIT] Creating commit...
git commit -m "Fix: Implement dual storage sync for Super Admin visibility" -m "" -m "DUAL STORAGE PATTERN IMPLEMENTED" -m "" -m "Problem:" -m "- Super Admin could only see organizations, not clients/loans/repayments" -m "- All data was stored in project_states table (JSONB)" -m "- Individual tables (clients, loans, repayments) were empty" -m "" -m "Solution:" -m "- Implemented dual storage: saves to BOTH project_states AND individual tables" -m "- Super Admin can now query normalized tables" -m "- Manager view continues using fast project_states queries" -m "" -m "New Files:" -m "- /utils/dualStorageSync.ts - Syncs data to individual tables" -m "- /utils/migrateProjectStatesToTables.ts - Migration utility" -m "- /DUAL_STORAGE_SYNC_FIX.md - Complete documentation" -m "" -m "Modified Files:" -m "- /utils/singleObjectSync.ts - Added dual storage sync" -m "- /contexts/DataContext.tsx - Pass userId for sync" -m "- /components/superadmin/SettingsTab.tsx - Added migration button" -m "" -m "Features:" -m "- Automatic sync for all new data" -m "- One-click migration for existing organizations" -m "- Super Admin can now see all clients, loans, repayments" -m "- No performance impact on manager view" -m "- Backward compatible - existing functionality unchanged" -m "" -m "Usage:" -m "1. Super Admin -> Platform Settings" -m "2. Click 'Migrate All Organizations Now' button" -m "3. All existing data synced to individual tables" -m "4. Super Admin can now view all organization data" -m "" -m "Testing:" -m "- Tested with BV Funguo Ltd organization" -m "- Clients, loans, repayments now visible in Super Admin" -m "- No breaking changes to existing functionality" -m "" -m "Status: Ready for production deployment" -m "Date: January 1, 2026"

echo [OK] Commit created
echo.

REM Step 6: Show commit details
echo [INFO] Commit details:
git log -1 --stat
echo.

REM Step 7: Ask for confirmation before pushing
echo.
echo ============================================
set /p CONFIRM="Ready to push to GitHub? (Y/N): "
echo.

if /i "%CONFIRM%"=="Y" (
    REM Step 8: Push to GitHub
    echo [PUSH] Pushing to GitHub...
    for /f "delims=" %%i in ('git branch --show-current') do set BRANCH=%%i
    git push origin %BRANCH%
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ============================================
        echo    DEPLOYMENT SUCCESSFUL!
        echo ============================================
        echo.
        echo [SUCCESS] Changes pushed to GitHub successfully!
        echo.
        echo [NEXT STEPS]
        echo    1. Wait for Netlify auto-deployment (~2 minutes^)
        echo    2. Visit: https://smartlenderup.netlify.app
        echo    3. Login to Super Admin
        echo    4. Go to Platform Settings
        echo    5. Click 'Migrate All Organizations Now'
        echo    6. Verify data appears in Loan Management tab
        echo.
        echo [DOCS] Documentation: See /DUAL_STORAGE_SYNC_FIX.md
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
