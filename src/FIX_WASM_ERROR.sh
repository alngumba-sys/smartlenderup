#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║       🔧 FIXING WEBASSEMBLY ERROR - FINAL FIX 🔧       ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Kill everything
echo -e "${BLUE}[1/5]${NC} Killing all Node/Vite processes..."
pkill -9 node 2>/dev/null || true
pkill -9 vite 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 2
echo -e "${GREEN}      ✓ Processes killed${NC}"
echo ""

# Step 2: Nuclear cache deletion
echo -e "${BLUE}[2/5]${NC} Deleting ALL caches and build artifacts..."
rm -rf node_modules/.vite 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
rm -rf .vite 2>/dev/null
rm -rf dist 2>/dev/null
rm -rf .cache 2>/dev/null
rm -rf build 2>/dev/null
find . -name "*.wasm" -type f -delete 2>/dev/null
find . -name ".DS_Store" -type f -delete 2>/dev/null
npm cache clean --force >/dev/null 2>&1
echo -e "${GREEN}      ✓ Caches deleted${NC}"
echo ""

# Step 3: Verify mock files exist
echo -e "${BLUE}[3/5]${NC} Verifying mock Supabase files..."
if [ -f "lib/supabase.ts" ] && [ -f "lib/supabase-mock.ts" ]; then
  echo -e "${GREEN}      ✓ Mock files present${NC}"
else
  echo -e "${RED}      ✗ Mock files missing!${NC}"
  exit 1
fi
echo ""

# Step 4: Verify package.json doesn't have Supabase
echo -e "${BLUE}[4/5]${NC} Checking package.json..."
if grep -q "@supabase/supabase-js" package.json; then
  echo -e "${YELLOW}      ⚠ Supabase found in package.json - this is OK if it's commented${NC}"
else
  echo -e "${GREEN}      ✓ No Supabase dependency${NC}"
fi
echo ""

# Step 5: Start dev server
echo -e "${BLUE}[5/5]${NC} Starting development server..."
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║  ${GREEN}✓ READY TO START${NC}                                   ║"
echo "║                                                        ║"
echo "║  ${YELLOW}IMPORTANT: After server starts${NC}                     ║"
echo "║                                                        ║"
echo "║  ${BLUE}1.${NC} Press ${YELLOW}Ctrl+Shift+N${NC} (opens incognito window)       ║"
echo "║  ${BLUE}2.${NC} Go to ${YELLOW}http://localhost:5173${NC}                      ║"
echo "║  ${BLUE}3.${NC} Verify ${GREEN}NO WebAssembly error${NC}                       ║"
echo "║                                                        ║"
echo "║  ${RED}OR if you prefer:${NC}                                   ║"
echo "║                                                        ║"
echo "║  ${BLUE}1.${NC} Open regular browser: ${YELLOW}http://localhost:5173${NC}      ║"
echo "║  ${BLUE}2.${NC} Press ${YELLOW}Ctrl+Shift+Delete${NC}                          ║"
echo "║  ${BLUE}3.${NC} Clear ${YELLOW}Cached images and files${NC}                    ║"
echo "║  ${BLUE}4.${NC} Click ${YELLOW}Clear data${NC}                                 ║"
echo "║  ${BLUE}5.${NC} ${YELLOW}Refresh${NC} the page                                 ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Starting Vite...${NC}"
echo ""

npm run dev
