#!/bin/bash

echo "🔧 Removing version numbers from imports..."

# Find all .ts and .tsx files and remove @version from imports
find . -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/dist/*" -exec sed -i '' 's/@[0-9]\+\.[0-9]\+\.[0-9]\+"/"/g' {} +

echo "✅ Done! Version numbers removed from all imports."
