#!/bin/bash

# ============================================
# WebAssembly Error Fix - Complete Cleanup
# ============================================

echo "🔧 Starting complete cleanup and rebuild..."
echo ""

# Step 1: Clear all Vite caches
echo "📦 Clearing Vite caches..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist
echo "✅ Vite caches cleared"
echo ""

# Step 2: Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force
echo "✅ npm cache cleared"
echo ""

# Step 3: Reinstall dependencies
echo "📥 Reinstalling dependencies..."
rm -rf node_modules
npm install
echo "✅ Dependencies reinstalled"
echo ""

# Step 4: Verification
echo "🔍 Running verification checks..."
echo ""

echo "Checking for @version imports..."
if grep -r "from ['\"].*@[0-9]" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v "react-hook-form@7.55.0" | grep -v "supabase/functions" | grep -v "node_modules" | grep -v ".md"; then
    echo "⚠️  WARNING: Found @version imports above!"
else
    echo "✅ No problematic @version imports found"
fi
echo ""

echo "Checking for multiple vite.config files..."
config_count=$(find . -name "vite.config*" -not -path "./node_modules/*" | wc -l)
if [ "$config_count" -eq 1 ]; then
    echo "✅ Only one vite.config.ts found"
else
    echo "⚠️  WARNING: Found $config_count vite.config files"
    find . -name "vite.config*" -not -path "./node_modules/*"
fi
echo ""

echo "Checking for multiple package.json files..."
pkg_count=$(find . -name "package.json" -not -path "./node_modules/*" | wc -l)
if [ "$pkg_count" -eq 1 ]; then
    echo "✅ Only one package.json found"
else
    echo "⚠️  WARNING: Found $pkg_count package.json files"
    find . -name "package.json" -not -path "./node_modules/*"
fi
echo ""

echo "============================================"
echo "✅ Cleanup complete!"
echo ""
echo "🚀 Starting dev server..."
echo "============================================"
npm run dev
