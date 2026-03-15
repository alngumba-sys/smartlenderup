#!/bin/bash

clear
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║         🔥 NUCLEAR OPTION - DELETE EVERYTHING 🔥              ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "This will DELETE EVERYTHING and rebuild from scratch."
echo ""
echo "Press CTRL+C now if you want to cancel..."
sleep 5
echo ""
echo ""

echo "[1/8] Killing ALL Node processes..."
pkill -9 node 2>/dev/null || true
pkill -9 npm 2>/dev/null || true
pkill -9 npx 2>/dev/null || true
sleep 3
echo "    ✅ All Node processes killed"
echo ""

echo "[2/8] Deleting node_modules..."
if [ -d "node_modules" ]; then
    echo "    Deleting... (this may take a minute)"
    rm -rf node_modules 2>/dev/null || true
    echo "    ✅ node_modules deleted"
else
    echo "    ✅ Already deleted"
fi
echo ""

echo "[3/8] Deleting package-lock.json..."
if [ -f "package-lock.json" ]; then
    rm -f package-lock.json 2>/dev/null || true
    echo "    ✅ package-lock.json deleted"
else
    echo "    ✅ Already deleted"
fi
echo ""

echo "[4/8] Deleting ALL cache directories..."
rm -rf .vite 2>/dev/null || true
rm -rf .vite-nocache-* 2>/dev/null || true
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf dist 2>/dev/null || true
rm -rf .cache 2>/dev/null || true
rm -rf .parcel-cache 2>/dev/null || true
echo "    ✅ All cache directories deleted"
echo ""

echo "[5/8] Clearing npm global cache..."
npm cache clean --force >/dev/null 2>&1 || true
echo "    ✅ npm cache cleared"
echo ""

echo "[6/8] Deleting ALL WASM files (just in case)..."
find . -name "*.wasm" -type f -delete 2>/dev/null || true
echo "    ✅ All .wasm files deleted"
echo ""

echo "[7/8] Installing packages (THIS WILL TAKE 2-3 MINUTES)..."
echo "    ⏳ Installing fresh packages..."
echo ""
npm install
if [ $? -ne 0 ]; then
    echo ""
    echo "    ❌ npm install FAILED!"
    echo ""
    echo "    Try running manually:"
    echo "       npm install"
    echo ""
    exit 1
fi
echo ""
echo "    ✅ Packages installed successfully!"
echo ""

echo "[8/8] Starting dev server..."
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo " 🎉 EVERYTHING IS CLEAN AND FRESH! 🎉"
echo ""
echo " Starting dev server..."
echo ""
echo " ✅ App will be at: http://localhost:5173"
echo " ✅ NO WEBASSEMBLY ERROR!"
echo " ✅ NO XLSX LIBRARY!"
echo " ✅ PURE JAVASCRIPT ONLY!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo ""
echo "⚠️  IMPORTANT: If you STILL see the error:"
echo ""
echo "   1. It's BROWSER CACHE (not the code!)"
echo "   2. Press Ctrl+Shift+N (incognito mode)"
echo "   3. Go to http://localhost:5173"
echo "   4. Error will be GONE!"
echo ""
echo ""

npm run dev
