#!/bin/bash

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  🔍 Verification Script                               ║"
echo "║  Checks if the WebAssembly fix was applied correctly ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

ERRORS=0

# Check 1: No problematic @version imports
echo "🔍 [1/6] Checking for @version imports in source code..."
if grep -r "from ['\"].*@[0-9]" --include="*.tsx" --include="*.ts" . 2>/dev/null | \
   grep -v "react-hook-form@7.55.0" | \
   grep -v "supabase/functions" | \
   grep -v "node_modules" | \
   grep -v ".md" | \
   grep -v ".sh" | \
   grep -v ".bat" | \
   grep -v "verify-fix" | \
   grep -q .; then
    echo "❌ FAIL: Found problematic @version imports:"
    grep -r "from ['\"].*@[0-9]" --include="*.tsx" --include="*.ts" . 2>/dev/null | \
      grep -v "react-hook-form@7.55.0" | \
      grep -v "supabase/functions" | \
      grep -v "node_modules" | \
      grep -v ".md" | \
      grep -v ".sh" | \
      grep -v ".bat" | \
      grep -v "verify-fix"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: No problematic @version imports found"
fi
echo ""

# Check 2: Only one vite.config.ts
echo "🔍 [2/6] Checking for multiple vite.config files..."
VITE_CONFIGS=$(find . -name "vite.config*" -not -path "./node_modules/*" | wc -l)
if [ "$VITE_CONFIGS" -eq 1 ]; then
    echo "✅ PASS: Only one vite.config.ts found"
elif [ "$VITE_CONFIGS" -eq 0 ]; then
    echo "❌ FAIL: No vite.config.ts found!"
    ERRORS=$((ERRORS + 1))
else
    echo "❌ FAIL: Found $VITE_CONFIGS vite.config files:"
    find . -name "vite.config*" -not -path "./node_modules/*"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 3: Only one package.json
echo "🔍 [3/6] Checking for multiple package.json files..."
PKG_JSONS=$(find . -name "package.json" -not -path "./node_modules/*" | wc -l)
if [ "$PKG_JSONS" -eq 1 ]; then
    echo "✅ PASS: Only one package.json found"
elif [ "$PKG_JSONS" -eq 0 ]; then
    echo "❌ FAIL: No package.json found!"
    ERRORS=$((ERRORS + 1))
else
    echo "❌ FAIL: Found $PKG_JSONS package.json files:"
    find . -name "package.json" -not -path "./node_modules/*"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 4: Node modules exist
echo "🔍 [4/6] Checking if node_modules exists..."
if [ -d "node_modules" ]; then
    echo "✅ PASS: node_modules directory exists"
else
    echo "⚠️  WARNING: node_modules not found. Run 'npm install'"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 5: Critical packages installed
echo "🔍 [5/6] Checking if critical packages are installed..."
MISSING_PACKAGES=0

if [ ! -d "node_modules/sonner" ]; then
    echo "❌ FAIL: sonner not installed"
    MISSING_PACKAGES=$((MISSING_PACKAGES + 1))
else
    echo "✅ sonner installed"
fi

if [ ! -d "node_modules/recharts" ]; then
    echo "❌ FAIL: recharts not installed"
    MISSING_PACKAGES=$((MISSING_PACKAGES + 1))
else
    echo "✅ recharts installed"
fi

if [ ! -d "node_modules/lucide-react" ]; then
    echo "❌ FAIL: lucide-react not installed"
    MISSING_PACKAGES=$((MISSING_PACKAGES + 1))
else
    echo "✅ lucide-react installed"
fi

if [ $MISSING_PACKAGES -gt 0 ]; then
    echo "⚠️  WARNING: $MISSING_PACKAGES critical packages missing. Run 'npm install'"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: All critical packages installed"
fi
echo ""

# Check 6: Node/npm versions
echo "🔍 [6/6] Checking Node and npm versions..."
NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//' | cut -d'.' -f1)
NPM_VERSION=$(npm --version 2>/dev/null | cut -d'.' -f1)

if [ -z "$NODE_VERSION" ]; then
    echo "❌ FAIL: Node.js not found!"
    ERRORS=$((ERRORS + 1))
elif [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  WARNING: Node.js $NODE_VERSION detected. Recommended: v20.0.0+"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: Node.js v$NODE_VERSION (>= v20)"
fi

if [ -z "$NPM_VERSION" ]; then
    echo "❌ FAIL: npm not found!"
    ERRORS=$((ERRORS + 1))
elif [ "$NPM_VERSION" -lt 9 ]; then
    echo "⚠️  WARNING: npm $NPM_VERSION detected. Recommended: v9.0.0+"
else
    echo "✅ PASS: npm v$NPM_VERSION (>= v9)"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo "✅ ALL CHECKS PASSED!"
    echo ""
    echo "Your environment is properly configured."
    echo "The WebAssembly fix has been applied correctly."
    echo ""
    echo "You can now run: npm run dev"
else
    echo "❌ FAILED $ERRORS CHECK(S)"
    echo ""
    echo "Please fix the issues above before running the app."
    echo ""
    echo "Quick fixes:"
    echo "  - If imports have @version: Remove version numbers from imports"
    echo "  - If multiple configs: Delete duplicates in /imports/ directory"
    echo "  - If packages missing: Run 'npm install --legacy-peer-deps'"
    echo "  - If Node version old: Update from https://nodejs.org/"
    echo ""
    echo "Or run the automated fix:"
    echo "  ./NUCLEAR_FIX.sh"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $ERRORS
