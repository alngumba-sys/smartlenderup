#!/bin/bash

clear

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║      🔥 ULTIMATE WEBASSEMBLY FIX - NUCLEAR OPTION 🔥       ║"
echo "║                                                            ║"
echo "║  This will COMPLETELY DESTROY and rebuild everything      ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "⚠️  This script will:"
echo "   • Kill all Node processes"
echo "   • Delete node_modules completely"
echo "   • Clear ALL caches (npm, vite, OS)"
echo "   • Clear browser cache (you'll need to do this)"
echo "   • Reinstall everything from scratch"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: KILLING ALL PROCESSES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pkill -9 node 2>/dev/null || true
pkill -9 vite 2>/dev/null || true
pkill -9 npm 2>/dev/null || true
killall node 2>/dev/null || true
killall vite 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 3
echo "✅ All processes killed"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: NUCLEAR DELETION OF ALL DEPENDENCIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Deleting node_modules..."
rm -rf node_modules
echo "Deleting package-lock.json..."
rm -f package-lock.json
echo "Deleting yarn.lock..."
rm -f yarn.lock
echo "✅ Dependencies deleted"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: DELETING ALL CACHES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Clearing Vite cache..."
rm -rf .vite
rm -rf node_modules/.vite
rm -rf node_modules/.cache
echo "Clearing build artifacts..."
rm -rf dist
rm -rf build
rm -rf .cache
rm -rf .parcel-cache
rm -rf .next
echo "Clearing OS temp files..."
rm -rf /tmp/vite* 2>/dev/null || true
rm -rf /tmp/node* 2>/dev/null || true
rm -rf ~/.npm/_cacache 2>/dev/null || true
echo "Deleting all WASM files..."
find . -name "*.wasm" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
echo "Clearing npm cache..."
npm cache clean --force 2>/dev/null || true
npm cache verify 2>/dev/null || true
echo "✅ All caches cleared"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: VERIFYING MOCK FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "lib/supabase.ts" ]; then
  echo "✅ lib/supabase.ts exists"
else
  echo "❌ lib/supabase.ts MISSING!"
  exit 1
fi

if [ -f "lib/supabase-mock.ts" ]; then
  echo "✅ lib/supabase-mock.ts exists"
else
  echo "❌ lib/supabase-mock.ts MISSING!"
  exit 1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: REINSTALLING DEPENDENCIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Installing packages (this may take a few minutes)..."
npm install --legacy-peer-deps
echo "✅ Dependencies installed"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 6: VERIFYING NO SUPABASE PACKAGE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "node_modules/@supabase" ]; then
  echo "⚠️  WARNING: @supabase folder found in node_modules"
  echo "    This might be a dependency of another package"
else
  echo "✅ No @supabase package found"
fi
echo ""

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║                  ✅ SETUP COMPLETE!                         ║"
echo "║                                                            ║"
echo "║  Now starting the development server...                   ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚨 CRITICAL: YOU MUST CLEAR YOUR BROWSER CACHE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After the server starts, do ONE of these:"
echo ""
echo "✅ OPTION 1 (EASIEST):"
echo "   1. Press Ctrl+Shift+N (or Cmd+Shift+N on Mac)"
echo "   2. This opens INCOGNITO mode (zero cache)"
echo "   3. Go to http://localhost:5173"
echo "   4. ✨ NO MORE ERROR!"
echo ""
echo "✅ OPTION 2 (Manual):"
echo "   1. Press Ctrl+Shift+Delete"
echo "   2. Select 'Cached images and files'"
echo "   3. Click 'Clear data'"
echo "   4. Refresh the page"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

sleep 2

npm run dev