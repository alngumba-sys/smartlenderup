#!/bin/bash

# Comprehensive fix for all Netlify TypeScript errors
# Run this script to fix all compilation issues

echo "🔧 Fixing Netlify TypeScript Errors..."

# Fix 1: Remove @vercel/node imports from API files (Netlify doesn't use Vercel)
echo "📝 Fix 1: Removing @vercel/node imports..."
find src/api -name "*.ts" -type f -exec sed -i '' "s/import { VercelRequest, VercelResponse } from '@vercel\/node';//g" {} \;

# Fix 2: Add missing Lucide React icon imports
echo "📝 Fix 2: Adding missing icon imports..."

# CollectionActivityModal.tsx
if grep -q "import.*lucide-react" src/components/CollectionActivityModal.tsx; then
  # Update existing import
  sed -i '' "s/import {[^}]*} from 'lucide-react'/import { CheckCircle, Calendar, XCircle, AlertTriangle, MapPin, FileText } from 'lucide-react'/" src/components/CollectionActivityModal.tsx
else
  # Add new import at the top after React import
  sed -i '' "1a\\
import { CheckCircle, Calendar, XCircle, AlertTriangle, MapPin, FileText } from 'lucide-react';
" src/components/CollectionActivityModal.tsx
fi

# GroupDetailsModal.tsx
if grep -q "import.*lucide-react" src/components/GroupDetailsModal.tsx; then
  sed -i '' "s/import {[^}]*} from 'lucide-react'/import { CheckCircle, AlertTriangle, Phone, Clock, FileText, Eye, Download } from 'lucide-react'/" src/components/GroupDetailsModal.tsx
else
  sed -i '' "1a\\
import { CheckCircle, AlertTriangle, Phone, Clock, FileText, Eye, Download } from 'lucide-react';
" src/components/GroupDetailsModal.tsx
fi

echo "✅ All fixes applied!"
echo ""
echo "📋 Next steps:"
echo "1. Run: chmod +x FIX_NETLIFY_ERRORS.sh"
echo "2. Run: ./FIX_NETLIFY_ERRORS.sh"
echo "3. Then manually fix type definitions (see instructions below)"
echo ""
echo "🔍 MANUAL FIXES NEEDED:"
echo ""
echo "Fix autoSchemaMigration.ts (line 709):"
echo "  Change:"
echo "    const tableResult = {"
echo "      tableName,"
echo "      columnsAdded: [] as string[],"
echo "    };"
echo "  To:"
echo "    const tableResult = {"
echo "      tableName,"
echo "      columnsAdded: [] as string[],"
echo "      error: undefined as string | undefined,"
echo "    };"
echo ""
echo "Fix populateSampleData.ts (line 6):"
echo "  Change: export function populateSampleData(): void {"
echo "  To:     export function populateSampleData(): boolean {"
