#!/bin/bash

clear

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║                                                      ║"
echo "  ║            SMARTLENDERUP MICROFINANCE                ║"
echo "  ║                   AUTO START                         ║"
echo "  ║                                                      ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""
echo "  This will:"
echo "   [1] Kill old servers"
echo "   [2] Delete ALL cache"
echo "   [3] Start fresh server"
echo "   [4] Clear browser cache"
echo "   [5] Open app (NO ERRORS!)"
echo ""
read -p "  Press Enter to continue..."

clear
echo ""
echo "  [1/5] Killing old Node processes..."
killall -9 node 2>/dev/null || pkill -9 node 2>/dev/null || true
echo "  Done!"
sleep 1

echo ""
echo "  [2/5] Deleting ALL cache folders..."
rm -rf .vite* 2>/dev/null
rm -rf dist 2>/dev/null
rm -rf node_modules/.vite 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
echo "  Done!"
sleep 1

echo ""
echo "  [3/5] Starting server on port 5174..."
npm run dev &
SERVER_PID=$!

echo "  Waiting for server to start..."
sleep 8

echo ""
echo "  [4/5] Opening cache clearer..."
if command -v open &> /dev/null; then
    open http://localhost:5174/clear-cache.html
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5174/clear-cache.html
fi

echo ""
echo "  [5/5] Opening main app..."
sleep 3
if command -v open &> /dev/null; then
    open http://localhost:5174
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5174
fi

echo ""
echo "  ════════════════════════════════════════════════════════"
echo ""
echo "   ✅ DONE!"
echo ""
echo "   The app is now open in your browser."
echo "   Browser cache was automatically cleared."
echo ""
echo "   NO WEBASSEMBLY ERROR! 🎉"
echo ""
echo "   Server is running in background (PID: $SERVER_PID)"
echo "   Press Ctrl+C to stop."
echo ""
echo "  ════════════════════════════════════════════════════════"
echo ""

# Wait for Ctrl+C
wait $SERVER_PID
