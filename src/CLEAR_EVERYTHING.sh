#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║           🔥 NUCLEAR CACHE CLEAR 🔥                          ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "[1/7] Stopping Vite dev server..."
pkill -f vite 2>/dev/null || true
echo "    ✅ Done"
echo ""

echo "[2/7] Deleting ALL .vite cache folders..."
rm -rf .vite .vite-cache* .vite-nocache* node_modules/.vite
echo "    ✅ Done"
echo ""

echo "[3/7] Deleting Vite dependency cache..."
rm -rf node_modules/.cache
echo "    ✅ Done"
echo ""

echo "[4/7] Deleting node_modules..."
rm -rf node_modules
echo "    ✅ Done"
echo ""

echo "[5/7] Deleting package-lock.json..."
rm -f package-lock.json
echo "    ✅ Done"
echo ""

echo "[6/7] Reinstalling dependencies..."
npm install
echo "    ✅ Done"
echo ""

echo "[7/7] Starting fresh dev server..."
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║  ✅ Everything cleared! Starting Vite...                     ║"
echo "║                                                              ║"
echo "║  After it starts, press Ctrl+Shift+N (incognito)            ║"
echo "║  Then go to http://localhost:5173                           ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

npm run dev