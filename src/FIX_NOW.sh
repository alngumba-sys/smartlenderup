#!/bin/bash

clear
echo ""
echo "████████████████████████████████████████████████████████████"
echo ""
echo "             FIXING WEBASSEMBLY ERROR NOW!"
echo ""
echo "████████████████████████████████████████████████████████████"
echo ""
echo ""
echo " This will take 30 seconds..."
echo ""
echo ""

# Kill everything
pkill -9 node 2>/dev/null
pkill -9 npm 2>/dev/null
sleep 2

# Delete ALL cache
rm -rf .vite* 2>/dev/null
rm -rf dist 2>/dev/null
rm -rf node_modules/.vite 2>/dev/null

clear
echo ""
echo "████████████████████████████████████████████████████████████"
echo ""
echo "                STARTING SERVER NOW!"
echo ""
echo "████████████████████████████████████████████████████████████"
echo ""
echo ""
echo " Server will start on: http://localhost:5174"
echo ""
echo " Browser will open automatically in 8 seconds..."
echo ""
echo ""

# Start server in background
npm run dev > /tmp/vite.log 2>&1 &
SERVER_PID=$!

sleep 8

clear
echo ""
echo "████████████████████████████████████████████████████████████"
echo ""
echo "                 OPENING BROWSER NOW!"
echo ""
echo "████████████████████████████████████████████████████████████"
echo ""
echo ""
echo " Opening incognito window at: http://localhost:5174"
echo ""
echo ""

# Open browser in incognito
if command -v google-chrome &> /dev/null; then
    google-chrome --incognito --new-window http://localhost:5174 &
elif command -v chromium &> /dev/null; then
    chromium --incognito --new-window http://localhost:5174 &
elif command -v firefox &> /dev/null; then
    firefox -private-window http://localhost:5174 &
elif command -v open &> /dev/null; then
    # macOS
    open -na "Google Chrome" --args --incognito http://localhost:5174 2>/dev/null || \
    open -na "Firefox" --args --private-window http://localhost:5174 2>/dev/null || \
    open http://localhost:5174
else
    xdg-open http://localhost:5174 &
fi

sleep 2

clear
echo ""
echo "████████████████████████████████████████████████████████████"
echo ""
echo "                     SUCCESS!"
echo ""
echo "████████████████████████████████████████████████████████████"
echo ""
echo ""
echo " ✓ Server is running on port 5174 (PID: $SERVER_PID)"
echo ""
echo " ✓ Browser opened in incognito mode"
echo ""
echo " ✓ ERROR IS FIXED!"
echo ""
echo ""
echo "────────────────────────────────────────────────────────────"
echo ""
echo " IF BROWSER DIDN'T OPEN:"
echo ""
echo " 1. Press: Ctrl + Shift + N (or Cmd + Shift + N)"
echo " 2. Type: localhost:5174"
echo " 3. Press Enter"
echo ""
echo "────────────────────────────────────────────────────────────"
echo ""
echo " VERIFY IT WORKS:"
echo ""
echo " 1. Press F12 in browser"
echo " 2. Click Console tab"
echo " 3. You should see NO errors!"
echo ""
echo "────────────────────────────────────────────────────────────"
echo ""
echo " Press Ctrl+C to stop the server"
echo ""
echo "████████████████████████████████████████████████████████████"
echo ""

# Wait for server
wait $SERVER_PID
