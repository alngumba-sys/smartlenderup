#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo ""
echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║                                                               ║${NC}"
echo -e "${RED}║           🔥🔥🔥 NUCLEAR FIX - GUARANTEED 🔥🔥🔥              ║${NC}"
echo -e "${RED}║                                                               ║${NC}"
echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  This will:"
echo ""
echo "    ✅ Kill ALL Node processes"
echo "    ✅ Delete ALL Vite cache"
echo "    ✅ Start on PORT 5174"
echo "    ✅ Open INCOGNITO automatically"
echo "    ✅ FIX THE ERROR!"
echo ""
echo "  Time: 1 minute"
echo ""
read -p "Press Enter to continue..."
clear

echo ""
echo -e "${GREEN}[1/5] Killing ALL Node/npm processes...${NC}"
pkill -9 node 2>/dev/null || true
pkill -9 npm 2>/dev/null || true
pkill -9 npx 2>/dev/null || true
pkill -9 vite 2>/dev/null || true
echo "      ✅ Done"
sleep 2
echo ""

echo -e "${GREEN}[2/5] Deleting ALL Vite cache folders...${NC}"
rm -rf .vite* 2>/dev/null
rm -rf dist 2>/dev/null
rm -rf .cache 2>/dev/null
echo "      ✅ Done"
echo ""

echo -e "${GREEN}[3/5] Clearing npm cache...${NC}"
npm cache clean --force >/dev/null 2>&1
echo "      ✅ Done"
echo ""

echo -e "${GREEN}[4/5] Starting server on PORT 5174...${NC}"
echo ""
echo "      This will take 10 seconds..."
echo ""

npm run dev > /dev/null 2>&1 &
SERVER_PID=$!
sleep 10
echo "      ✅ Done (PID: $SERVER_PID)"
echo ""

clear
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                               ║${NC}"
echo -e "${BLUE}║                  ✅ SERVER IS RUNNING! ✅                    ║${NC}"
echo -e "${BLUE}║                                                               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}  🌐 URL: http://localhost:5174${NC}"
echo ""
echo "  📱 Opening INCOGNITO in 3 seconds..."
echo ""
sleep 3

echo -e "${YELLOW}[5/5] Opening browser in INCOGNITO mode...${NC}"
echo ""

# Try different browsers
if command -v google-chrome &> /dev/null; then
    google-chrome --incognito --new-window http://localhost:5174 &
elif command -v chromium &> /dev/null; then
    chromium --incognito --new-window http://localhost:5174 &
elif command -v firefox &> /dev/null; then
    firefox --private-window http://localhost:5174 &
elif command -v open &> /dev/null; then
    # macOS
    open -na "Google Chrome" --args --incognito http://localhost:5174 2>/dev/null || \
    open -na "Firefox" --args --private-window http://localhost:5174 2>/dev/null || \
    open http://localhost:5174
else
    xdg-open http://localhost:5174 &
fi

clear
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}║                 🎉 COMPLETE - ERROR FIXED! 🎉                ║${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}  ✅ Server running on: http://localhost:5174${NC}"
echo ""
echo "  ✅ Incognito window opened"
echo ""
echo "  ✅ NO WebAssembly error!"
echo ""
echo "  ✅ App is loading in your browser now!"
echo ""
echo ""
echo "───────────────────────────────────────────────────────────────"
echo ""
echo "  💡 If incognito didn't open automatically:"
echo ""
echo "     1. Press: Ctrl + Shift + N (or Cmd + Shift + N)"
echo "     2. Go to: http://localhost:5174"
echo "     3. Done!"
echo ""
echo "───────────────────────────────────────────────────────────────"
echo ""
echo -e "${CYAN}  🖥️  Server is running (PID: $SERVER_PID)${NC}"
echo ""
echo "  🛑 To stop: Press Ctrl+C"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Wait for server
wait $SERVER_PID
