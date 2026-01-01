#!/bin/bash

echo "🧹 Performing DEEP clean..."

# Remove all possible TypeScript caches
rm -rf node_modules/.cache
rm -rf node_modules/.vite
rm -rf .tsbuildinfo
rm -rf tsconfig.tsbuildinfo
rm -rf dist
rm -rf .eslintcache

# Remove any VS Code TypeScript cache
rm -rf .vscode/.tscache

echo "✅ Clean complete!"
echo ""
echo "🔨 Running fresh TypeScript compilation..."
npx tsc --incremental false --force

echo ""
echo "✅ Done! Check errors above."
