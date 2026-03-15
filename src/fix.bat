@echo off
echo Fixing WebAssembly error...
taskkill /F /IM node.exe /T 2>nul
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist ".vite" rmdir /s /q ".vite"
if exist "dist" rmdir /s /q "dist"
echo Cache cleared. Starting server...
npm run dev
