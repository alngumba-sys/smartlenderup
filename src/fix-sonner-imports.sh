#!/bin/bash

# Fix all sonner@2.0.3 imports to just sonner
# This script removes the version specifier from all sonner imports

echo "Fixing sonner imports..."

# Find and replace in all TypeScript/TSX files
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./dist/*" \
  -exec sed -i "s/from 'sonner@2\.0\.3'/from 'sonner'/g" {} +

echo "✓ All sonner imports fixed!"
echo "Please run: npm install && npm run dev"
