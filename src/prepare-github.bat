@echo off
REM ========================================
REM SmartLenderUp - Prepare for GitHub Push
REM This script helps prepare the code for GitHub (Windows)
REM ========================================

echo.
echo ================================================
echo SmartLenderUp - GitHub Preparation Script
echo ================================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo [OK] Found package.json - we're in the right place
echo.

REM Step 1: Check for sensitive keys
echo Step 1: Checking for sensitive keys...
findstr /C:"service_role" lib\supabase.ts > nul
if %ERRORLEVEL% EQU 0 (
    findstr /C:"PASTE_YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE" lib\supabase.ts > nul
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Service role key detected in lib\supabase.ts
        echo This should NOT be pushed to GitHub!
        echo.
        echo Options:
        echo 1. Replace it with: PASTE_YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE
        echo 2. Use environment variables instead
        echo.
        set /p CONTINUE="Continue anyway? (y/N): "
        if /i not "%CONTINUE%"=="y" (
            echo [ERROR] Aborted. Please fix the service role key first.
            pause
            exit /b 1
        )
    ) else (
        echo [OK] Placeholder detected - safe to push
    )
) else (
    echo [OK] No service role key found
)
echo.

REM Step 2: Check if .gitignore exists
echo Step 2: Checking .gitignore...
if not exist ".gitignore" (
    echo [WARNING] .gitignore not found! Creating one...
    (
        echo # Dependencies
        echo node_modules/
        echo .pnp
        echo .pnp.js
        echo.
        echo # Testing
        echo coverage/
        echo.
        echo # Production
        echo build/
        echo dist/
        echo.
        echo # Environment variables
        echo .env
        echo .env.local
        echo .env.development.local
        echo .env.test.local
        echo .env.production.local
        echo.
        echo # Logs
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
        echo.
        echo # Editor
        echo .vscode/
        echo .idea/
        echo *.swp
        echo *.swo
        echo.
        echo # OS
        echo .DS_Store
        echo Thumbs.db
        echo.
        echo # Supabase
        echo .supabase/
    ) > .gitignore
    echo [OK] Created .gitignore
) else (
    echo [OK] .gitignore exists
)
echo.

REM Step 3: Initialize git if needed
echo Step 3: Checking Git initialization...
if not exist ".git" (
    echo [WARNING] Git not initialized. Initializing now...
    git init
    git remote add origin https://github.com/alngumba-sys/smartlenderup.git
    echo [OK] Git initialized
) else (
    echo [OK] Git already initialized
)
echo.

REM Step 4: Check git remote
echo Step 4: Checking Git remote...
git remote -v | findstr "alngumba-sys/smartlenderup" > nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Git remote is correct
) else (
    echo [WARNING] Git remote not set correctly. Setting now...
    git remote add origin https://github.com/alngumba-sys/smartlenderup.git 2>nul
    if %ERRORLEVEL% NEQ 0 (
        git remote set-url origin https://github.com/alngumba-sys/smartlenderup.git
    )
    echo [OK] Git remote updated
)
echo.

REM Step 5: Show git status
echo Step 5: Current Git Status
echo ======================================
git status --short
echo.

REM Step 6: Ready to push
echo ================================================
echo [SUCCESS] Pre-push checks complete!
echo.
echo Next steps:
echo   1. Review the changes above
echo   2. Run: git add .
echo   3. Run: git commit -m "Complete migration from Figma Make"
echo   4. Run: git push origin main --force
echo.
echo [WARNING] Using --force will OVERWRITE everything on GitHub!
echo.
set /p PROCEED="Do you want to proceed with 'git add' now? (y/N): "

if /i "%PROCEED%"=="y" (
    echo.
    echo Adding files to git...
    git add .
    echo [OK] Files added!
    echo.
    echo Next, run:
    echo   git commit -m "Complete migration from Figma Make - Live deployment"
    echo   git push origin main --force
) else (
    echo Skipped. You can manually run: git add .
)

echo.
echo Done! Ready to push to GitHub.
echo.
pause
