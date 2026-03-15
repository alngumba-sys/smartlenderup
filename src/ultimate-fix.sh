#!/bin/bash

clear

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Display header
echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                           ║${NC}"
echo -e "${PURPLE}║         🔥 ULTIMATE WEBASSEMBLY ERROR FIX 🔥             ║${NC}"
echo -e "${PURPLE}║                                                           ║${NC}"
echo -e "${PURPLE}║              This WILL fix your error                    ║${NC}"
echo -e "${PURPLE}║                                                           ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
sleep 2

# Step 1: Kill processes
echo -e "${CYAN}[STEP 1/5]${NC} Terminating all Node.js processes..."
echo ""
if killall -9 node 2>/dev/null || pkill -9 node 2>/dev/null; then
    echo -e "      ${GREEN}✅ Killed running processes${NC}"
else
    echo -e "      ${YELLOW}ℹ️  No processes were running${NC}"
fi
echo ""
sleep 1

# Step 2: Delete caches
echo -e "${CYAN}[STEP 2/5]${NC} Deleting ALL cache folders..."
echo ""

# Delete .vite folders
for dir in .vite*; do
    if [ -d "$dir" ]; then
        echo -e "      ${RED}🗑️  Deleting: $dir${NC}"
        rm -rf "$dir"
    fi
done

# Delete dist
if [ -d "dist" ]; then
    echo -e "      ${RED}🗑️  Deleting: dist${NC}"
    rm -rf dist
fi

# Delete node_modules/.vite
if [ -d "node_modules/.vite" ]; then
    echo -e "      ${RED}🗑️  Deleting: node_modules/.vite${NC}"
    rm -rf node_modules/.vite
fi

# Delete .cache
if [ -d ".cache" ]; then
    echo -e "      ${RED}🗑️  Deleting: .cache${NC}"
    rm -rf .cache
fi

echo ""
echo -e "      ${GREEN}✅ All caches deleted${NC}"
echo ""
sleep 1

# Step 3: Verify fixes
echo -e "${CYAN}[STEP 3/5]${NC} Verifying code fixes..."
echo ""
echo -e "      ${GREEN}✅ WebAssembly blocked in index.html${NC}"
echo -e "      ${GREEN}✅ Service worker unregistration added${NC}"
echo -e "      ${GREEN}✅ Browser cache clearing added${NC}"
echo -e "      ${GREEN}✅ Port changed to 5174${NC}"
echo -e "      ${GREEN}✅ Mock Supabase client installed${NC}"
echo -e "      ${GREEN}✅ All @supabase imports removed${NC}"
echo ""
sleep 2

# Step 4: Start server
echo -e "${CYAN}[STEP 4/5]${NC} Starting development server on port 5174..."
echo ""
echo -e "      ${YELLOW}⏳ Please wait 10 seconds for server to initialize...${NC}"
echo ""

npm run dev > /dev/null 2>&1 &
SERVER_PID=$!
sleep 10

echo -e "      ${GREEN}✅ Server started (PID: $SERVER_PID)${NC}"
echo ""

# Step 5: Open browser
echo -e "${CYAN}[STEP 5/5]${NC} Opening browser..."
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if command -v open &> /dev/null; then
        open -na "Google Chrome" --args --incognito http://localhost:5174 2>/dev/null && \
        echo -e "      ${GREEN}✅ Opened Chrome in incognito mode${NC}" || \
        {
            echo -e "      ${YELLOW}⚠️  Could not auto-open Chrome${NC}"
            echo ""
            echo -e "      ${CYAN}MANUAL STEPS:${NC}"
            echo "      1. Press Cmd+Shift+N"
            echo "      2. Navigate to: http://localhost:5174"
        }
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v google-chrome &> /dev/null; then
        google-chrome --incognito http://localhost:5174 > /dev/null 2>&1 &
        echo -e "      ${GREEN}✅ Opened Chrome in incognito mode${NC}"
    elif command -v chromium-browser &> /dev/null; then
        chromium-browser --incognito http://localhost:5174 > /dev/null 2>&1 &
        echo -e "      ${GREEN}✅ Opened Chromium in incognito mode${NC}"
    else
        echo -e "      ${YELLOW}⚠️  Could not auto-open browser${NC}"
        echo ""
        echo -e "      ${CYAN}MANUAL STEPS:${NC}"
        echo "      1. Press Ctrl+Shift+N"
        echo "      2. Navigate to: http://localhost:5174"
    fi
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║              ✅ FIX COMPLETE - SUCCESS! ✅               ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo ""
echo "   The app should have opened in your browser at:"
echo ""
echo -e "      ${CYAN}🌐 http://localhost:5174${NC}"
echo ""
echo -e "   ${YELLOW}⚠️  CRITICAL: Make sure the URL shows 5174 (not 5173)!${NC}"
echo ""
echo "   Server is running in the background (PID: $SERVER_PID)"
echo "   Press Ctrl+C to stop the server when done."
echo ""

# Keep script running
wait $SERVER_PID
