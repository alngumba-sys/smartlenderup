#!/bin/bash
clear
echo ""
echo "========================================"
echo "  FIXING WEBASSEMBLY ERROR NOW"
echo "========================================"
echo ""
echo "Stopping old server..."
killall -9 node 2>/dev/null || pkill -9 node 2>/dev/null

echo "Deleting cache..."
rm -rf .vite* dist 2>/dev/null

echo ""
echo "Starting server on PORT 5174..."
echo ""
npm run dev &
SERVER_PID=$!

sleep 10

echo ""
echo "Opening browser in INCOGNITO mode..."
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    open -na "Google Chrome" --args --incognito http://localhost:5174 2>/dev/null
else
    google-chrome --incognito http://localhost:5174 2>/dev/null &
fi

echo ""
echo "========================================"
echo "  DONE! Check your browser."
echo "  URL should be: localhost:5174"
echo "========================================"
echo ""
echo "Server PID: $SERVER_PID"
echo "To stop: kill $SERVER_PID"
echo ""
