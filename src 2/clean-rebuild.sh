#!/bin/bash

# Clean TypeScript build cache and rebuild
echo "🧹 Cleaning TypeScript cache..."
rm -rf node_modules/.cache
rm -f tsconfig.tsbuildinfo
rm -rf dist

echo "🔨 Running clean build..."
npm run build

echo "✅ Build complete!"
