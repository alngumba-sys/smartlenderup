#!/bin/bash

echo "🔥 FORCE REBUILD - Nuking all caches..."

# Kill any running TypeScript servers
pkill -f tsserver 2>/dev/null || true

# Remove ALL possible caches
rm -rf node_modules/.cache
rm -rf node_modules/.vite  
rm -rf .tsbuildinfo
rm -rf tsconfig.tsbuildinfo
rm -rf *.tsbuildinfo
rm -rf dist
rm -rf .eslintcache
rm -rf .vscode

echo "✅ All caches cleared!"
echo ""
echo "🔨 Running TypeScript with NO incremental build..."

# Force fresh compilation with no cache
npx tsc --incremental false 2>&1 | head -100

echo ""
echo "📊 Counting errors..."
npx tsc --incremental false 2>&1 | grep -c "error TS" || echo "0"
