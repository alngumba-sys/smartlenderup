#!/bin/bash

clear
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║              INSTALL AND RUN - FRESH START                    ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo ""

echo "[1/5] Killing all Node processes..."
pkill -9 node 2>/dev/null || true
sleep 2
echo "    ✅ Done"
echo ""

echo "[2/5] Deleting node_modules and package-lock.json..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo "    ✅ Deleted node_modules"
else
    echo "    ✅ Already deleted"
fi
if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
    echo "    ✅ Deleted package-lock.json"
else
    echo "    ✅ Already deleted"
fi
echo ""

echo "[3/5] Deleting cache directories..."
rm -rf .vite-nocache-* 2>/dev/null || true
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf dist 2>/dev/null || true
echo "    ✅ Done"
echo ""

echo "[4/5] Installing dependencies (this may take a minute)..."
npm install
if [ $? -ne 0 ]; then
    echo "    ❌ npm install failed!"
    exit 1
fi
echo "    ✅ Done"
echo ""

echo "[5/5] Starting dev server..."
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo " ✅ INSTALLATION COMPLETE!"
echo ""
echo " Starting dev server..."
echo " App will be available at: http://localhost:5173"
echo ""
echo " ✅ NO WEBASSEMBLY ERROR! 🎉"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
npm run dev
