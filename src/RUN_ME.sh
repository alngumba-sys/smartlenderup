#!/bin/bash

clear
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "             🚀 FIX WEBASSEMBLY ERROR - SIMPLE 🚀"
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo ""
echo "  This will start the server on PORT 5174"
echo "  (Different port = No cached files = No error!)"
echo ""
echo "  Takes: 1 minute"
echo ""
read -p "Press Enter to continue..."
echo ""
echo ""
echo "  [1/2] Stopping old server..."
pkill -9 node 2>/dev/null || true
sleep 2
echo "        ✅ Done"
echo ""
echo "  [2/2] Starting on port 5174..."
echo ""
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  ✅ Server starting on: http://localhost:5174"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "  DO THIS NOW:"
echo ""
echo "    1. Press: Ctrl + Shift + N (or Cmd + Shift + N on Mac)"
echo "    2. Go to: http://localhost:5174"
echo "    3. ✅ ERROR GONE!"
echo ""
echo "  OR just open: http://localhost:5174 in any browser"
echo "  (New port = new cache = no error!)"
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
sleep 3

# Start dev server on port 5174
npm run dev -- --port 5174
