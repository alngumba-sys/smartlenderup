#!/bin/bash

clear
echo ""
echo "╔═════════════════════════════════════════════════════════════════╗"
echo "║                                                                 ║"
echo "║         🔥 STARTING WITH ZERO CACHE 🔥                          ║"
echo "║                                                                 ║"
echo "╚═════════════════════════════════════════════════════════════════╝"
echo ""

echo "[1/5] Stopping any running dev servers..."
pkill -f "vite" 2>/dev/null || true
sleep 2

echo "[2/5] Deleting ALL cache directories..."
rm -rf .vite-nocache-* 2>/dev/null || true
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true

echo "[3/5] Deleting Vite cache..."
rm -rf node_modules/.cache 2>/dev/null || true

echo "[4/5] Deleting @supabase packages..."
if [ -d "node_modules/@supabase" ]; then
    rm -rf node_modules/@supabase 2>/dev/null || true
    echo "    ✅ Deleted @supabase"
else
    echo "    ✅ No @supabase found (good!)"
fi

echo "[5/5] Starting fresh dev server..."
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo " 🚀 Server starting with ZERO cache..."
echo ""
echo " 📝 IMPORTANT:"
echo "    If you still see a WebAssembly error, it means"
echo "    your BROWSER has cached the old JavaScript files."
echo ""
echo " ✅ SOLUTION:"
echo "    1. Press Ctrl+Shift+N (incognito mode)"
echo "    2. Go to http://localhost:5173"
echo "    3. Error will be GONE!"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo ""

npm run dev
