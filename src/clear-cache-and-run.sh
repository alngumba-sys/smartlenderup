#!/bin/bash
pkill -9 node 2>/dev/null; rm -rf node_modules/.vite .vite dist 2>/dev/null; npm run dev
