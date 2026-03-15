#!/bin/bash
echo "🔧 Fixing WebAssembly error..."
pkill -9 node 2>/dev/null
rm -rf node_modules/.vite .vite dist /tmp/vite* ~/.vite 2>/dev/null
npm cache clean --force 2>/dev/null
echo "✅ Cache cleared. Starting server with --force flag..."
npm run dev -- --force
