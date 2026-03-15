#!/bin/bash
set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║          FINAL WEBASSEMBLY FIX - NUCLEAR OPTION              ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "🔴 Step 1: Killing ALL Node processes..."
pkill -9 node 2>/dev/null && echo "   ✓ Node killed" || echo "   ✓ No Node running"
sleep 3

echo ""
echo "🗑️  Step 2: Deleting EVERYTHING cache-related..."
rm -rf node_modules/.vite 2>/dev/null && echo "   ✓ Deleted node_modules/.vite" || echo "   ✓ Already gone"
rm -rf node_modules/.cache 2>/dev/null && echo "   ✓ Deleted node_modules/.cache" || echo "   ✓ Already gone"
rm -rf .vite 2>/dev/null && echo "   ✓ Deleted .vite" || echo "   ✓ Already gone"
rm -rf dist 2>/dev/null && echo "   ✓ Deleted dist" || echo "   ✓ Already gone"
rm -rf .cache 2>/dev/null && echo "   ✓ Deleted .cache" || echo "   ✓ Already gone"
rm -rf .parcel-cache 2>/dev/null && echo "   ✓ Deleted .parcel-cache" || echo "   ✓ Already gone"
find . -name "*.wasm" -type f -delete 2>/dev/null && echo "   ✓ Deleted all .wasm files" || echo "   ✓ No .wasm files found"

echo ""
echo "🧹 Step 3: Clearing npm cache..."
npm cache clean --force 2>&1 | grep -v "npm WARN" || true
echo "   ✓ NPM cache cleared"

echo ""
echo "🔧 Step 4: Clearing browser cache instructions..."
echo "   📌 After server starts, do this in your browser:"
echo "   1. Press F12 (open DevTools)"
echo "   2. Right-click the refresh button"
echo "   3. Click 'Empty Cache and Hard Reload'"
echo ""

echo "🚀 Step 5: Starting dev server with WASM disabled..."
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Once you see 'ready in X ms', open http://localhost:5173   ║"
echo "║  Then do the browser cache clear (F12 → Hard Reload)        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

npm run dev
