@echo off
taskkill /F /IM node.exe /T 2>nul & rmdir /s /q node_modules\.vite 2>nul & rmdir /s /q .vite 2>nul & rmdir /s /q dist 2>nul & npm run dev
