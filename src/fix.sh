#!/bin/bash
echo "🔧 Fixing WebAssembly error..."
pkill -9 node 2>/dev/null
rm -rf node_modules/.vite .vite dist
echo "✅ Cache cleared. Starting server..."
npm run dev
