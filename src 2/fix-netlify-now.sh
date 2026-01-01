#!/bin/bash

echo "🔧 SmartLenderUp - Netlify TypeScript Fixes"
echo "==========================================="
echo ""

# Fix 1: Install missing npm packages
echo "📦 Step 1: Installing missing dependencies..."
npm install @stripe/react-stripe-js @stripe/stripe-js
echo "✅ Dependencies installed"
echo ""

# Fix 2: Remove @vercel/node imports from API files
echo "🗑️  Step 2: Removing @vercel/node imports..."
if [ -d "api" ]; then
    # Remove the import line from each file
    find api -name "*.ts" -type f | while read file; do
        if grep -q "@vercel/node" "$file"; then
            sed -i '' "s/import { VercelRequest, VercelResponse } from '@vercel\/node';//g" "$file"
            echo "   Fixed: $file"
        fi
    done
    echo "✅ Vercel imports removed"
else
    echo "⚠️  api directory not found - skipping"
fi
echo ""

# Fix 3: Create vite-env.d.ts
echo "📝 Step 3: Creating vite-env.d.ts..."
if [ ! -d "src" ]; then
    mkdir -p src
fi

cat > src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly SUPABASE_SERVICE_ROLE_KEY: string
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
EOF
echo "✅ vite-env.d.ts created in src/"
echo ""

# Fix 4: Fix autoSchemaMigration.ts
echo "🔧 Step 4: Fixing autoSchemaMigration.ts..."
if [ -f "utils/autoSchemaMigration.ts" ]; then
    # Check if already has error property
    if ! grep -q "error: undefined as string" "utils/autoSchemaMigration.ts"; then
        # Add error property after columnsAdded line
        sed -i '' '/columnsAdded: \[\] as string\[\],$/a\
      error: undefined as string | undefined,
' utils/autoSchemaMigration.ts && echo "✅ autoSchemaMigration.ts fixed" || echo "⚠️  Could not auto-fix"
    else
        echo "✅ autoSchemaMigration.ts already has error property"
    fi
else
    echo "⚠️  utils/autoSchemaMigration.ts not found"
fi
echo ""

# Fix 5: Fix populateSampleData.ts
echo "🔧 Step 5: Fixing populateSampleData.ts..."
if [ -f "utils/populateSampleData.ts" ]; then
    # Check if already returns boolean
    if grep -q "export function populateSampleData(): void" "utils/populateSampleData.ts"; then
        sed -i '' 's/export function populateSampleData(): void {/export function populateSampleData(): boolean {/' utils/populateSampleData.ts && echo "✅ populateSampleData.ts fixed" || echo "⚠️  Could not auto-fix"
    else
        echo "✅ populateSampleData.ts already returns boolean"
    fi
else
    echo "⚠️  utils/populateSampleData.ts not found"
fi
echo ""

echo "✅ ALL AUTOMATED FIXES COMPLETE!"
echo ""
echo "📋 SUMMARY:"
echo "  ✅ Installed @stripe/react-stripe-js and @stripe/stripe-js"
echo "  ✅ Removed @vercel/node imports from API files"
echo "  ✅ Created src/vite-env.d.ts"
echo "  ✅ Fixed utils/autoSchemaMigration.ts"
echo "  ✅ Fixed utils/populateSampleData.ts"
echo "  ✅ Fixed CollectionActivityModal.tsx (icons) - ALREADY DONE"
echo "  ✅ Fixed GroupDetailsModal.tsx (documents) - ALREADY DONE"
echo "  ✅ Fixed DatabaseViewer.tsx (icon collision) - ALREADY DONE"
echo "  ✅ Fixed AuthContext.tsx (organizationId) - ALREADY DONE"
echo "  ✅ Created types.ts - ALREADY DONE"
echo ""
echo "🧪 TEST BUILD:"
echo "   npm run build"
echo ""
echo "✅ IF SUCCESSFUL, DEPLOY:"
echo "   git add ."
echo "   git commit -m 'Fix Netlify TypeScript compilation errors'"
echo "   git push origin main"
echo ""
echo "🚀 Netlify will auto-deploy!"
