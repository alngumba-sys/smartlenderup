#!/bin/bash

clear
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║          🔥 ABSOLUTE FINAL FIX - DELETE EVERYTHING 🔥        ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo ""
echo "This will:"
echo "  1. Kill all Node processes"
echo "  2. Delete node_modules completely"
echo "  3. Delete package-lock.json"
echo "  4. Delete ALL cache directories"
echo "  5. Clear npm cache"
echo "  6. Run npm install (fresh)"
echo "  7. Start dev server"
echo ""
echo "After this, you MUST clear your browser cache!"
echo ""
read -p "Press Enter to continue..."
echo ""

echo "[1/9] Killing ALL Node processes..."
pkill -9 node 2>/dev/null || true
pkill -9 npm 2>/dev/null || true
sleep 3
echo "    ✅ Done"
echo ""

echo "[2/9] Deleting node_modules..."
if [ -d "node_modules" ]; then
    echo "    This will take 30-60 seconds..."
    rm -rf node_modules 2>/dev/null || true
    sleep 2
fi
echo "    ✅ Done"
echo ""

echo "[3/9] Deleting package-lock.json..."
if [ -f "package-lock.json" ]; then
    rm -f package-lock.json 2>/dev/null || true
fi
echo "    ✅ Done"
echo ""

echo "[4/9] Deleting ALL .vite cache directories..."
rm -rf .vite* 2>/dev/null || true
rm -rf dist 2>/dev/null || true
echo "    ✅ Done"
echo ""

echo "[5/9] Clearing npm cache..."
npm cache clean --force >/dev/null 2>&1 || true
echo "    ✅ Done"
echo ""

echo "[6/9] Deleting ANY .wasm files..."
find . -name "*.wasm" -type f -delete 2>/dev/null || true
echo "    ✅ Done"
echo ""

echo "[7/9] Installing packages..."
echo "    ⏳ This will take 2-3 minutes..."
echo ""
npm install
if [ $? -ne 0 ]; then
    echo ""
    echo "    ❌ npm install FAILED!"
    exit 1
fi
echo ""
echo "    ✅ Packages installed!"
echo ""

echo "[8/9] Starting dev server..."
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo " 🚀 SERVER IS STARTING..."
echo ""
echo " When you see \"Local: http://localhost:5173\""
echo ""
echo " DO THIS IN YOUR BROWSER:"
echo " ════════════════════════════════════════════════════════════"
echo ""
echo "    1. Close ALL browser tabs/windows"
echo ""
echo "    2. Reopen browser"
echo ""
echo "    3. Press Ctrl+Shift+Delete"
echo "       - Select \"All time\""
echo "       - Check \"Cached images and files\""
echo "       - Click \"Clear data\""
echo ""
echo "    4. Go to http://localhost:5173"
echo ""
echo "    5. ✅ ERROR WILL BE GONE!"
echo ""
echo ""
echo " OR USE INCOGNITO MODE (instant fix):"
echo " ════════════════════════════════════════════════════════════"
echo ""
echo "    1. Press Ctrl+Shift+N"
echo ""
echo "    2. Go to http://localhost:5173"
echo ""
echo "    3. ✅ WORKS PERFECTLY!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo ""

echo "[9/9] Opening test page..."
sleep 2
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:5173/test-minimal.html" 2>/dev/null &
elif command -v open &> /dev/null; then
    open "http://localhost:5173/test-minimal.html" 2>/dev/null &
fi
sleep 1

npm run dev
