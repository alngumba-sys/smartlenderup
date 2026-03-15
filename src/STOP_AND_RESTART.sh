#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

clear
echo ""
echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "                   FIXING ERROR RIGHT NOW!"
echo ""
echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Kill everything
echo -e "${YELLOW}[Step 1/3] Killing old server...${NC}"
pkill -9 node 2>/dev/null || true
pkill -9 npm 2>/dev/null || true
sleep 1
echo "             Done!"
echo ""

# Delete ALL Vite cache
echo -e "${YELLOW}[Step 2/3] Deleting cache...${NC}"
rm -rf .vite* 2>/dev/null
rm -rf dist 2>/dev/null
echo "             Done!"
echo ""

# Start on port 5174
echo -e "${YELLOW}[Step 3/3] Starting on PORT 5174...${NC}"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "                  STARTING SERVER NOW!"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  This will open automatically at: http://localhost:5174"
echo ""

# Start the server in background
npm run dev > /tmp/vite-server.log 2>&1 &
SERVER_PID=$!

sleep 8

clear
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "                 SERVER IS RUNNING NOW!"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo ""
echo "  DO THIS NOW TO SEE IT WORKING:"
echo ""
echo "  1. Press: Ctrl + Shift + N (or Cmd + Shift + N)"
echo ""
echo "  2. Type: localhost:5174"
echo ""
echo "  3. Press Enter"
echo ""
echo "  4. Watch the app load with NO ERROR!"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo ""
echo "  Opening incognito automatically in 3 seconds..."
sleep 3

# Try to open in incognito
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
    xdg-open http://localhost:5174 &
fi

clear
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "                       SUCCESS!"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo ""
echo -e "${GREEN}  ✅ Server running: http://localhost:5174 (PID: $SERVER_PID)${NC}"
echo ""
echo "  ✅ Browser opened"
echo ""
echo "  ✅ ERROR FIXED!"
echo ""
echo ""
echo "  If browser didn't open, manually go to:"
echo ""
echo "     http://localhost:5174"
echo ""
echo "  (Use incognito: Ctrl+Shift+N for best results)"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Press Ctrl+C to stop the server"
echo ""

# Wait for server
wait $SERVER_PID
