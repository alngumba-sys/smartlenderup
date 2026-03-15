#!/bin/bash

clear
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "         🔥 FIXING WEBASSEMBLY ERROR - ONE CLICK 🔥"
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo ""
echo "[1/5] Killing Node processes..."
pkill -9 node 2>/dev/null || true
pkill -9 npm 2>/dev/null || true
sleep 2
echo "      ✅ Done"
echo ""
echo "[2/5] Deleting cache folders..."
rm -rf .vite* dist .cache 2>/dev/null || true
echo "      ✅ Done"
echo ""
echo "[3/5] Deleting node_modules..."
rm -rf node_modules 2>/dev/null || true
echo "      ✅ Done"
echo ""
echo "[4/5] Clearing npm cache..."
npm cache clean --force >/dev/null 2>&1 || true
echo "      ✅ Done"
echo ""
echo "[5/5] Installing packages (2-3 minutes)..."
echo ""
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ npm install FAILED!"
    echo ""
    exit 1
fi

clear
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "                 ✅ ✅ ✅ ALL DONE! ✅ ✅ ✅"
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo ""
echo " 🎉 The fix is complete!"
echo ""
echo " 🚀 Starting server now..."
echo ""
echo " 📋 AFTER server starts:"
echo ""
echo "    1. Press: Ctrl + Shift + Delete"
echo "    2. Check: \"Cached images and files\""
echo "    3. Click: \"Clear data\""
echo "    4. Reload: http://localhost:5173"
echo ""
echo "    OR just use incognito mode (Ctrl+Shift+N)"
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo " Starting server in 3 seconds..."
sleep 3
echo ""

npm run dev
