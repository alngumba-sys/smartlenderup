#!/bin/bash

clear
echo ""
echo "================================================================"
echo "          ABSOLUTE FINAL FIX - NUCLEAR OPTION"
echo "================================================================"
echo ""

echo "Killing all Node processes..."
killall -9 node 2>/dev/null || pkill -9 node 2>/dev/null || true

echo "Deleting ALL cache folders..."
rm -rf .vite* dist node_modules/.vite 2>/dev/null || true

echo "Cleaning npm cache..."
npm cache clean --force >/dev/null 2>&1 || true

echo ""
echo "================================================================"
echo "          STARTING SERVER ON PORT 5174"
echo "================================================================"
echo ""
echo "Please wait while the server starts..."
echo ""

# Start server in background
nohup npm run dev > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 8

echo ""
echo "================================================================"
echo "          OPENING BROWSER IN INCOGNITO MODE"
echo "================================================================"
echo ""

# Detect OS and open appropriate browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if command -v /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome &> /dev/null; then
        open -na "Google Chrome" --args --incognito "http://localhost:5174"
        echo "Opened Chrome in incognito mode"
    elif command -v /Applications/Firefox.app/Contents/MacOS/firefox &> /dev/null; then
        open -a Firefox --args -private-window "http://localhost:5174"
        echo "Opened Firefox in private window"
    elif command -v /Applications/Safari.app/Contents/MacOS/Safari &> /dev/null; then
        open -a Safari "http://localhost:5174"
        echo "Opened Safari (Note: Clear cache manually with Cmd+Option+E)"
    else
        echo "Could not find browser. Please open manually:"
        echo "Press Cmd + Shift + N and go to: http://localhost:5174"
    fi
else
    # Linux
    if command -v google-chrome &> /dev/null; then
        google-chrome --incognito "http://localhost:5174" &
        echo "Opened Chrome in incognito mode"
    elif command -v chromium-browser &> /dev/null; then
        chromium-browser --incognito "http://localhost:5174" &
        echo "Opened Chromium in incognito mode"
    elif command -v firefox &> /dev/null; then
        firefox --private-window "http://localhost:5174" &
        echo "Opened Firefox in private window"
    else
        echo "Could not find browser. Please open manually:"
        echo "Press Ctrl + Shift + N and go to: http://localhost:5174"
    fi
fi

echo ""
echo "================================================================"
echo "          FIX COMPLETE!"
echo "================================================================"
echo ""
echo "The app should now be running at: http://localhost:5174"
echo ""
echo "CRITICAL: Make sure you see '5174' in the URL, NOT '5173'!"
echo ""
echo "Server PID: $SERVER_PID"
echo "To stop server: kill $SERVER_PID"
echo ""
echo "Press Ctrl+C to exit (server will keep running)"
echo ""

# Keep script alive to show server logs
tail -f server.log 2>/dev/null
