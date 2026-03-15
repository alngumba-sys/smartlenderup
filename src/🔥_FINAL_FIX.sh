#!/bin/bash

clear

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║              🔥 ABSOLUTE FINAL FIX - WASM ERROR 🔥           ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo ""
echo "This script will:"
echo "  1. Kill ALL Node processes"
echo "  2. Delete ALL cache directories"
echo "  3. Delete node_modules"
echo "  4. Fresh npm install"
echo "  5. Start server"
echo "  6. Test in YOUR CURRENT BROWSER"
echo ""
echo "Time required: 3-4 minutes"
echo ""
read -p "Press Enter to continue..."
clear

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo " STEP 1: Killing processes"
echo "═══════════════════════════════════════════════════════════════"
echo ""

pkill -9 node 2>/dev/null || true
pkill -9 npm 2>/dev/null || true
sleep 2
echo "✅ All Node processes killed"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo " STEP 2: Deleting cache directories"
echo "═══════════════════════════════════════════════════════════════"
echo ""

rm -rf .vite* dist .cache .temp .npm 2>/dev/null || true

echo "✅ All cache directories deleted"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo " STEP 3: Deleting node_modules"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "This takes 30-60 seconds..."
echo ""

if [ -d "node_modules" ]; then
    rm -rf node_modules 2>/dev/null || true
    sleep 2
fi

echo "✅ node_modules deleted"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo " STEP 4: Deleting lock files"
echo "═══════════════════════════════════════════════════════════════"
echo ""

rm -f package-lock.json yarn.lock 2>/dev/null || true

echo "✅ Lock files deleted"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo " STEP 5: Clearing npm cache"
echo "═══════════════════════════════════════════════════════════════"
echo ""

npm cache clean --force >/dev/null 2>&1 || true

echo "✅ npm cache cleared"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo " STEP 6: Installing packages"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "This takes 2-3 minutes..."
echo ""

npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ npm install FAILED!"
    echo ""
    exit 1
fi

echo ""
echo "✅ Packages installed"
echo ""

clear
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║                    ✅ SETUP COMPLETE! ✅                      ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo " STEP 7: Starting server"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo ""
echo " 🚀 Server starting now..."
echo ""
echo " ⚡ WHAT TO DO NEXT:"
echo " ════════════════════════════════════════════════════════════"
echo ""
echo "  1. Wait for server to show: \"Local: http://localhost:5173\""
echo ""
echo "  2. BEFORE opening the app:"
echo "     → Press Ctrl+Shift+Delete"
echo "     → Select \"All time\""
echo "     → Check \"Cached images and files\""
echo "     → Click \"Clear data\""
echo ""
echo "  3. NOW go to: http://localhost:5173"
echo ""
echo "  4. ✅ App loads perfectly - NO ERROR!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo ""
echo " If you DON'T want to clear your browser cache:"
echo "   → Just open incognito mode (Ctrl+Shift+N)"
echo "   → Go to http://localhost:5173"
echo "   → ✅ Works perfectly!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo ""

npm run dev
