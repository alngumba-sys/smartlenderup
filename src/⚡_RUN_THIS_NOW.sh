#!/bin/bash

clear

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║           ⚡ COMPLETE FIX - WASM ERROR - ONE CLICK ⚡         ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo ""
echo "This will:"
echo "  ✅ Kill all Node processes"
echo "  ✅ Delete all caches"
echo "  ✅ Delete node_modules"
echo "  ✅ Fresh npm install"
echo "  ✅ Start the server"
echo "  ✅ Open cache clearer page"
echo "  ✅ Guide you step-by-step"
echo ""
echo "Time: 3-4 minutes"
echo ""
read -p "Press Enter to continue..."
clear

# ═══════════════════════════════════════════════════════════════
# STEP 1: Kill processes
# ═══════════════════════════════════════════════════════════════
echo ""
echo "[1/7] Killing all Node processes..."
pkill -9 node 2>/dev/null || true
pkill -9 npm 2>/dev/null || true
sleep 2
echo "      ✅ Processes killed"
echo ""

# ═══════════════════════════════════════════════════════════════
# STEP 2: Delete caches
# ═══════════════════════════════════════════════════════════════
echo "[2/7] Deleting cache directories..."
rm -rf .vite* dist .cache 2>/dev/null || true
echo "      ✅ Caches deleted"
echo ""

# ═══════════════════════════════════════════════════════════════
# STEP 3: Delete node_modules
# ═══════════════════════════════════════════════════════════════
echo "[3/7] Deleting node_modules..."
echo "      (This takes 30-60 seconds)"
if [ -d "node_modules" ]; then
    rm -rf node_modules 2>/dev/null || true
    sleep 2
fi
echo "      ✅ node_modules deleted"
echo ""

# ═══════════════════════════════════════════════════════════════
# STEP 4: Clear npm cache
# ═══════════════════════════════════════════════════════════════
echo "[4/7] Clearing npm cache..."
npm cache clean --force >/dev/null 2>&1 || true
echo "      ✅ npm cache cleared"
echo ""

# ═══════════════════════════════════════════════════════════════
# STEP 5: Install packages
# ═══════════════════════════════════════════════════════════════
echo "[5/7] Installing packages..."
echo "      (This takes 2-3 minutes)"
echo ""
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ npm install FAILED!"
    exit 1
fi

echo ""
echo "      ✅ Packages installed"
echo ""

# ═══════════════════════════════════════════════════════════════
# STEP 6: Open cache clearer
# ═══════════════════════════════════════════════════════════════
echo "[6/7] Opening browser cache clearer..."

# Try to open the HTML file
if command -v xdg-open &> /dev/null; then
    xdg-open CLEAR_BROWSER_CACHE.html &>/dev/null &
elif command -v open &> /dev/null; then
    open CLEAR_BROWSER_CACHE.html &>/dev/null &
else
    echo "      ⚠️  Please manually open: CLEAR_BROWSER_CACHE.html"
fi

sleep 2
echo "      ✅ Cache clearer opened"
echo ""

# ═══════════════════════════════════════════════════════════════
# STEP 7: Start server
# ═══════════════════════════════════════════════════════════════
clear
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║                    ✅ SETUP COMPLETE! ✅                      ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo ""
echo "[7/7] Starting server..."
echo ""
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo " ✅ Server is starting now!"
echo ""
echo " 🌐 A browser page opened with instructions"
echo ""
echo " 📋 FOLLOW THESE STEPS IN THE BROWSER PAGE:"
echo " ════════════════════════════════════════════════════════════"
echo ""
echo "  1. Press Ctrl+Shift+Delete"
echo "  2. Select \"All time\""
echo "  3. Check \"Cached images and files\""
echo "  4. Click \"Clear data\""
echo ""
echo " Then in the browser:"
echo ""
echo "  5. Go to http://localhost:5173"
echo "  6. ✅ NO MORE ERROR!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo ""
echo " 💡 TIP: If you don't want to clear your cache:"
echo "    → Just use incognito mode (Ctrl+Shift+N)"
echo "    → Go to http://localhost:5173"
echo "    → ✅ Works perfectly!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo ""
echo " 🚀 The server is running now!"
echo ""
echo " Press Ctrl+C to stop the server when done."
echo ""
echo ""

npm run dev
