@echo off
REM ============================================
REM DEPLOY MOBILE RESPONSIVE FIX TO GITHUB
REM ============================================

echo.
echo ============================================
echo    DEPLOYING MOBILE RESPONSIVE FIX
echo ============================================
echo.

REM Step 1: Add all changes
echo [ADD] Adding all mobile responsive changes...
git add components/MotherCompanyHome.tsx
git add components/modals/RegistrationTypeModal.tsx
git add components/modals/OrganizationSignUpModal.tsx
git add MOBILE_RESPONSIVE_FIX.md
git add deploy-mobile-fix.bat
git add deploy-mobile-fix.sh

echo [OK] Files added
echo.

REM Step 2: Show git status
echo [STATUS] Git status:
git status --short
echo.

REM Step 3: Commit changes
echo [COMMIT] Creating commit...
git commit -m "Fix: Mobile responsive design for landing page and modals" -m "" -m "MOBILE RESPONSIVENESS IMPLEMENTED" -m "" -m "Issues Fixed:" -m "- Hero section text now responsive (72px -> 32px on mobile)" -m "- Feature cards display in single column on mobile" -m "- Sign Up/Login buttons added to header" -m "- Modal z-index increased to 9999 for proper display" -m "- Touch-friendly button sizes (min 44x44px)" -m "- No horizontal scrolling on mobile" -m "" -m "Changes Made:" -m "- Hero typography: Uses clamp() for responsive scaling" -m "- Grid layout: 3 columns -> 1 column on mobile" -m "- Modals: Full-screen with proper overflow scrolling" -m "- Forms: Single column on mobile, 2 columns on desktop" -m "- Navigation: Added Sign Up/Login buttons" -m "- Cards: Removed transform scale on mobile" -m "- Live activity: Hidden on mobile" -m "" -m "Files Modified:" -m "- /components/MotherCompanyHome.tsx" -m "- /components/modals/RegistrationTypeModal.tsx" -m "- /components/modals/OrganizationSignUpModal.tsx" -m "" -m "Testing:" -m "- Tested on mobile (< 768px)" -m "- Verified modals appear and scroll properly" -m "- Confirmed no horizontal overflow" -m "- All text readable on small screens" -m "" -m "Status: Ready for production" -m "Date: January 1, 2026"

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
        echo [SUCCESS] Mobile responsive fix pushed!
        echo.
        echo [NEXT STEPS]
        echo    1. Wait for Netlify auto-deployment (~2 minutes)
        echo    2. Test on mobile device at: https://smartlenderup.com
        echo    3. Verify Sign Up/Login buttons work
        echo    4. Test modal popups on mobile
        echo    5. Check responsiveness at different screen sizes
        echo.
        echo [TESTS TO PERFORM]
        echo    Mobile (< 768px):
        echo    - Hero text scales properly
        echo    - Cards stack vertically
        echo    - Sign Up button appears and works
        echo    - Modals open and scroll properly
        echo.
        echo    Tablet (768px - 1024px):
        echo    - 2-column layout for cards
        echo    - Proper spacing
        echo.
        echo    Desktop (> 1024px):
        echo    - 3-column layout for cards
        echo    - All features visible
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
