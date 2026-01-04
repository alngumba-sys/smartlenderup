#!/bin/bash

# ============================================
# DEPLOY SUPER ADMIN DATA FIX TO GITHUB
# ============================================

echo ""
echo "============================================"
echo "   DEPLOYING SUPER ADMIN FIX"
echo "============================================"
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Show current branch
echo -e "${BLUE}📍 Current branch:${NC}"
git branch --show-current
echo ""

# Step 2: Add all changes
echo -e "${BLUE}📦 Adding Super Admin fix files...${NC}"
git add utils/superAdminDataFix.ts
git add App.tsx
git add components/modals/OrganizationSignUpModal.tsx
git add deploy-superadmin-fix.bat
git add deploy-superadmin-fix.sh
git add SUPERADMIN_FIX_GUIDE.md

echo -e "${GREEN}✅ Files added${NC}"
echo ""

# Step 3: Show git status
echo -e "${BLUE}📊 Git status:${NC}"
git status --short
echo ""

# Step 4: Commit with detailed message
echo -e "${BLUE}💾 Creating commit...${NC}"
git commit -m "Fix: Super Admin dashboard data visibility and Organization modal improvements

🔧 SUPER ADMIN FIXES IMPLEMENTED

Issues Fixed:
- Super Admin dashboard now shows correct client/borrower counts
- Super Admin can see loans and repayments across all organizations
- Added data sync utility for Super Admin visibility
- Date of Incorporation now uses mobile-friendly HTML5 date input
- Town/City field is now optional (not required)

New Features:
- window.syncAllDataToSupabase() - Syncs all local data to Supabase
- window.checkSupabaseData() - Checks what data exists in Supabase
- Dual storage sync ensures Super Admin sees all data

Files Modified:
- /utils/superAdminDataFix.ts (NEW - data sync utility)
- /App.tsx (registered new utility)
- /components/modals/OrganizationSignUpModal.tsx (mobile date picker + optional town)

How to Use:
1. After deployment, open browser console
2. Run: window.checkSupabaseData()
3. If data is missing, run: window.syncAllDataToSupabase()
4. Refresh Super Admin dashboard

Status: Ready for production
Date: January 1, 2026"

echo -e "${GREEN}✅ Commit created${NC}"
echo ""

# Step 5: Ask for confirmation before pushing
echo -e "${YELLOW}⚠️  Ready to push to GitHub?${NC}"
echo "   This will push to: origin/$(git branch --show-current)"
echo ""
read -p "   Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Step 6: Push to GitHub
    echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
    git push origin $(git branch --show-current)
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ ============================================${NC}"
        echo -e "${GREEN}   DEPLOYMENT SUCCESSFUL!${NC}"
        echo -e "${GREEN}   ============================================${NC}"
        echo ""
        echo "🎉 Super Admin fix pushed successfully!"
        echo ""
        echo "📋 CRITICAL NEXT STEPS:"
        echo ""
        echo "   1. Wait for Netlify auto-deployment (~2 minutes)"
        echo "   2. Open https://smartlenderup.com"
        echo "   3. Login and create a loan with repayment"
        echo "   4. Access Super Admin portal"
        echo "   5. Open browser console (F12)"
        echo "   6. Run: window.checkSupabaseData()"
        echo "   7. If counts are 0, run: window.syncAllDataToSupabase()"
        echo "   8. Refresh Super Admin dashboard"
        echo "   9. Verify all counts are correct"
        echo ""
        echo "🔧 Console Commands:"
        echo "   window.checkSupabaseData()        - Check what's in Supabase"
        echo "   window.syncAllDataToSupabase()    - Sync all local data"
        echo ""
    else
        echo ""
        echo -e "${RED}❌ Push failed. Please check the error above.${NC}"
        echo ""
    fi
else
    echo ""
    echo -e "${YELLOW}⏸️  Push cancelled. Changes are committed locally.${NC}"
    echo "   Run 'git push' manually when ready."
    echo ""
fi

echo "🏁 Script completed."
echo ""
