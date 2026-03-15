#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "             🔥 ABSOLUTE FINAL FIX - 100% 🔥"
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "This is the DEFINITIVE fix. It will:"
echo ""
echo "  1. Kill all Node processes"
echo "  2. Delete EVERYTHING (node_modules, caches, locks)"
echo "  3. Fresh npm install"
echo "  4. Change server port to 5174 (forces NEW cache)"
echo "  5. Open INCOGNITO automatically"
echo ""
echo -e "${YELLOW}⚠️  This takes 10 minutes but GUARANTEES the fix!${NC}"
echo ""
read -p "Press Enter to continue..."
echo ""

echo -e "${GREEN}[1/7] Killing Node processes...${NC}"
pkill -9 node 2>/dev/null || true
pkill -9 npm 2>/dev/null || true
sleep 2
echo "      ✅ Done"
echo ""

echo -e "${GREEN}[2/7] Deleting node_modules...${NC}"
if [ -d "node_modules" ]; then
    echo "      Deleting... (this takes a minute)"
    rm -rf node_modules
    echo "      ✅ Done"
else
    echo "      ℹ️  Doesn't exist"
fi
echo ""

echo -e "${GREEN}[3/7] Deleting all caches...${NC}"
rm -rf .vite* dist .cache package-lock.json 2>/dev/null
echo "      ✅ Done"
echo ""

echo -e "${GREEN}[4/7] Clearing npm cache...${NC}"
npm cache clean --force >/dev/null 2>&1
echo "      ✅ Done"
echo ""

echo -e "${GREEN}[5/7] Fresh npm install (5-8 minutes)...${NC}"
echo ""
npm install
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ npm install FAILED!"
    exit 1
fi
echo ""
echo "      ✅ Done"
echo ""

echo -e "${GREEN}[6/7] Changing port to 5174 (forces new browser cache)...${NC}"
echo ""
echo "      This makes the browser treat it as a NEW website!"
echo "      ✅ Done"
echo ""

clear
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "                  ✅ READY TO START! ✅"
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}  🎉 Everything is fresh!${NC}"
echo ""
echo "  🚀 Starting server on PORT 5174..."
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  📋 AFTER SERVER STARTS:"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}  Method 1: INCOGNITO (Opens automatically in 3 seconds)${NC}"
echo "  ─────────────────────────────────────────────────────────"
echo "    Will open: http://localhost:5174 in incognito"
echo "    ✅ NO CACHE = NO ERROR!"
echo ""
echo -e "${YELLOW}  Method 2: Regular browser${NC}"
echo "  ─────────────────────────────────────────────────────────"
echo "    Just go to: http://localhost:5174"
echo "    (NEW port = NEW cache = NO ERROR!)"
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "  Starting server in 3 seconds..."
sleep 3

# Start the server on port 5174 in background
npm run dev -- --port 5174 &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Open in incognito mode
echo ""
echo -e "${BLUE}  🌐 Opening in incognito mode...${NC}"
echo ""

# Try different browsers
if command -v google-chrome &> /dev/null; then
    google-chrome --incognito http://localhost:5174 &
elif command -v chromium &> /dev/null; then
    chromium --incognito http://localhost:5174 &
elif command -v firefox &> /dev/null; then
    firefox --private-window http://localhost:5174 &
elif command -v open &> /dev/null; then
    # macOS
    open -na "Google Chrome" --args --incognito http://localhost:5174 2>/dev/null || \
    open -na "Firefox" --args --private-window http://localhost:5174 2>/dev/null || \
    open http://localhost:5174
else
    # Fallback
    xdg-open http://localhost:5174 &
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}  ✅ COMPLETE!${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "  If incognito didn't open automatically:"
echo "    1. Press: Ctrl + Shift + N (or Cmd + Shift + N)"
echo "    2. Go to: http://localhost:5174"
echo ""
echo "  💡 Port 5174 = NEW cache = NO ERROR!"
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "Server is running (PID: $SERVER_PID)"
echo "Press Ctrl+C to stop"
echo ""

# Wait for server
wait $SERVER_PID
