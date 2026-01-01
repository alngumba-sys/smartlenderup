#!/bin/bash

# ============================================
# DEPLOY DUAL STORAGE SYNC FIX TO GITHUB
# ============================================
# This script commits and pushes the dual storage sync fix
# that enables Super Admin to see all organization data

echo ""
echo "🚀 ============================================"
echo "   DEPLOYING DUAL STORAGE SYNC FIX"
echo "   ============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Show current branch
echo -e "${BLUE}📍 Current branch:${NC}"
git branch --show-current
echo ""

# Step 2: Show modified and new files
echo -e "${BLUE}📝 Files to be committed:${NC}"
echo ""
echo -e "${YELLOW}New Files:${NC}"
echo "  ✅ /utils/dualStorageSync.ts"
echo "  ✅ /utils/migrateProjectStatesToTables.ts"
echo "  ✅ /DUAL_STORAGE_SYNC_FIX.md"
echo ""
echo -e "${YELLOW}Modified Files:${NC}"
echo "  ✏️  /utils/singleObjectSync.ts"
echo "  ✏️  /contexts/DataContext.tsx"
echo "  ✏️  /components/superadmin/SettingsTab.tsx"
echo ""

# Step 3: Add all changes
echo -e "${BLUE}📦 Adding all changes...${NC}"
git add utils/dualStorageSync.ts
git add utils/migrateProjectStatesToTables.ts
git add utils/singleObjectSync.ts
git add contexts/DataContext.tsx
git add components/superadmin/SettingsTab.tsx
git add DUAL_STORAGE_SYNC_FIX.md
git add deploy-dual-storage-fix.sh
git add deploy-dual-storage-fix.bat

echo -e "${GREEN}✅ Files added${NC}"
echo ""

# Step 4: Show git status
echo -e "${BLUE}📊 Git status:${NC}"
git status --short
echo ""

# Step 5: Commit with detailed message
echo -e "${BLUE}💾 Creating commit...${NC}"
git commit -m "Fix: Implement dual storage sync for Super Admin visibility

🔄 DUAL STORAGE PATTERN IMPLEMENTED

Problem:
- Super Admin could only see organizations, not clients/loans/repayments
- All data was stored in project_states table (JSONB)
- Individual tables (clients, loans, repayments) were empty

Solution:
- Implemented dual storage: saves to BOTH project_states AND individual tables
- Super Admin can now query normalized tables
- Manager view continues using fast project_states queries

New Files:
✅ /utils/dualStorageSync.ts - Syncs data to individual tables
✅ /utils/migrateProjectStatesToTables.ts - Migration utility
✅ /DUAL_STORAGE_SYNC_FIX.md - Complete documentation

Modified Files:
✏️  /utils/singleObjectSync.ts - Added dual storage sync
✏️  /contexts/DataContext.tsx - Pass userId for sync
✏️  /components/superadmin/SettingsTab.tsx - Added migration button

Features:
🎯 Automatic sync for all new data
🔄 One-click migration for existing organizations
📊 Super Admin can now see all clients, loans, repayments
⚡ No performance impact on manager view
🔒 Backward compatible - existing functionality unchanged

Usage:
1. Super Admin → Platform Settings
2. Click 'Migrate All Organizations Now' button
3. All existing data synced to individual tables
4. Super Admin can now view all organization data

Testing:
✅ Tested with BV Funguo Ltd organization
✅ Clients, loans, repayments now visible in Super Admin
✅ No breaking changes to existing functionality

Status: Ready for production deployment
Date: January 1, 2026"

echo -e "${GREEN}✅ Commit created${NC}"
echo ""

# Step 6: Show commit details
echo -e "${BLUE}📄 Commit details:${NC}"
git log -1 --stat
echo ""

# Step 7: Ask for confirmation before pushing
echo -e "${YELLOW}⚠️  Ready to push to GitHub?${NC}"
echo "   This will push to: origin/$(git branch --show-current)"
echo ""
read -p "   Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Step 8: Push to GitHub
    echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
    git push origin $(git branch --show-current)
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ ============================================${NC}"
        echo -e "${GREEN}   DEPLOYMENT SUCCESSFUL!${NC}"
        echo -e "${GREEN}   ============================================${NC}"
        echo ""
        echo "🎉 Changes pushed to GitHub successfully!"
        echo ""
        echo "📋 Next Steps:"
        echo "   1. Wait for Netlify auto-deployment (~2 minutes)"
        echo "   2. Visit: https://smartlenderup.netlify.app"
        echo "   3. Login to Super Admin"
        echo "   4. Go to Platform Settings"
        echo "   5. Click 'Migrate All Organizations Now'"
        echo "   6. Verify data appears in Loan Management tab"
        echo ""
        echo "📖 Documentation: See /DUAL_STORAGE_SYNC_FIX.md"
        echo ""
    else
        echo ""
        echo -e "${YELLOW}❌ Push failed. Please check the error above.${NC}"
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
