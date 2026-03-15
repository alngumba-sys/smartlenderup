#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "         🔥🔥🔥 NUCLEAR OPTION - TOTAL RESET 🔥🔥🔥"
echo ""
echo "    This will DELETE EVERYTHING and start 100% fresh!"
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will take 5-10 minutes${NC}"
echo ""
echo "What this does:"
echo "  1. Kills ALL Node processes"
echo "  2. Deletes node_modules COMPLETELY"
echo "  3. Deletes ALL cache folders"
echo "  4. Deletes package-lock.json"
echo "  5. Clears npm cache (force)"
echo "  6. Fresh npm install from scratch"
echo "  7. Starts server"
echo ""
echo -e "${RED}Type YES to continue (or anything else to cancel):${NC} "
read confirm

if [ "$confirm" != "YES" ]; then
    echo ""
    echo "Cancelled."
    exit 0
fi

clear
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  STEP 1: KILLING ALL NODE PROCESSES"
echo "══════════════════════════════════════════════════════════════"
echo ""
pkill -9 node 2>/dev/null || true
pkill -9 npm 2>/dev/null || true
pkill -9 vite 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ All Node processes killed${NC}"
echo ""
echo ""

echo "══════════════════════════════════════════════════════════════"
echo "  STEP 2: DELETING NODE_MODULES (this may take a minute)"
echo "══════════════════════════════════════════════════════════════"
echo ""
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo -e "${GREEN}✅ node_modules deleted${NC}"
else
    echo -e "${CYAN}ℹ️  node_modules doesn't exist${NC}"
fi
echo ""
echo ""

echo "══════════════════════════════════════════════════════════════"
echo "  STEP 3: DELETING ALL CACHE FOLDERS"
echo "══════════════════════════════════════════════════════════════"
echo ""
rm -rf .vite* 2>/dev/null && echo -e "${GREEN}✅ Deleted .vite* folders${NC}"
rm -rf dist 2>/dev/null && echo -e "${GREEN}✅ Deleted dist${NC}"
rm -rf .cache 2>/dev/null && echo -e "${GREEN}✅ Deleted .cache${NC}"
rm -rf .turbo 2>/dev/null && echo -e "${GREEN}✅ Deleted .turbo${NC}"
echo ""
echo ""

echo "══════════════════════════════════════════════════════════════"
echo "  STEP 4: DELETING package-lock.json"
echo "══════════════════════════════════════════════════════════════"
echo ""
if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
    echo -e "${GREEN}✅ package-lock.json deleted${NC}"
else
    echo -e "${CYAN}ℹ️  package-lock.json doesn't exist${NC}"
fi
echo ""
echo ""

echo "══════════════════════════════════════════════════════════════"
echo "  STEP 5: CLEARING NPM CACHE"
echo "══════════════════════════════════════════════════════════════"
echo ""
npm cache clean --force
echo -e "${GREEN}✅ npm cache cleared${NC}"
echo ""
echo ""

echo "══════════════════════════════════════════════════════════════"
echo "  STEP 6: VERIFYING NO @supabase PACKAGES"
echo "══════════════════════════════════════════════════════════════"
echo ""
if grep -qi "@supabase" package.json; then
    echo ""
    echo -e "${RED}❌ ERROR: Found @supabase in package.json!${NC}"
    echo ""
    echo "Please remove all @supabase packages from package.json first."
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ No @supabase packages in package.json${NC}"
fi
echo ""
echo ""

echo "══════════════════════════════════════════════════════════════"
echo "  STEP 7: FRESH NPM INSTALL (3-5 minutes)"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "Installing..."
echo ""
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "══════════════════════════════════════════════════════════════"
    echo -e "  ${RED}❌ NPM INSTALL FAILED!${NC}"
    echo "══════════════════════════════════════════════════════════════"
    echo ""
    echo "Possible fixes:"
    echo "  1. Check your internet connection"
    echo "  2. Try running with sudo"
    echo "  3. Delete node_modules and try again"
    echo ""
    exit 1
fi

clear
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "             ✅✅✅ INSTALLATION COMPLETE! ✅✅✅"
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo ""
echo -e "${GREEN}  🎉 Everything is now 100% fresh!${NC}"
echo ""
echo "  📁 Installed packages:"
ls -1 node_modules 2>/dev/null | wc -l
echo ""
echo "  🚀 Starting development server..."
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  📋 IMPORTANT - DO THIS AFTER SERVER STARTS:"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}  Method 1: Clear Browser Cache (PERMANENT FIX)${NC}"
echo "  ─────────────────────────────────────────────────────────"
echo "    1. Press: Ctrl + Shift + Delete"
echo "    2. Select: \"All time\" "
echo "    3. Check: \"Cached images and files\""
echo "    4. Click: \"Clear data\""
echo "    5. Reload: http://localhost:5173"
echo ""
echo -e "${GREEN}  Method 2: Use Incognito Mode (INSTANT TEST)${NC}"
echo "  ─────────────────────────────────────────────────────────"
echo "    1. Press: Ctrl + Shift + N (Cmd + Shift + N on Mac)"
echo "    2. Go to: http://localhost:5173"
echo "    3. ✅ ERROR WILL BE GONE!"
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "  Starting server in 3 seconds..."
sleep 3
echo ""
echo ""

npm run dev
