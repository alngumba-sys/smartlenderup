# 🔧 WebAssembly Error Troubleshooting Guide

## ❌ Error Message
```
TypeError: WebAssembly compilation aborted: Network error: Response body loading was aborted
```

## 🎯 Root Cause
This error occurs when Vite's bundler cannot properly resolve module imports, typically due to:
1. Versioned imports (e.g., `package@1.0.0`) in source code
2. Cached build artifacts with old configurations
3. Conflicting configuration files
4. Corrupted node_modules

## ✅ COMPLETE FIX - Run This

### Quick Fix (Recommended)

**Linux/Mac:**
```bash
chmod +x NUCLEAR_FIX.sh
./NUCLEAR_FIX.sh
```

**Windows:**
```cmd
NUCLEAR_FIX.bat
```

This script will:
- ✅ Stop all dev servers
- ✅ Clear ALL caches (Vite, npm, build)
- ✅ Remove node_modules completely
- ✅ Remove all lock files
- ✅ Verify no problematic @version imports
- ✅ Fresh install all dependencies
- ✅ Verify installation
- ✅ Start dev server

---

## 🔍 Manual Troubleshooting

If the automated script doesn't work, follow these steps:

### Step 1: Verify Source Code Has No @version Imports

```bash
# Search for problematic imports
grep -r "from ['\"].*@[0-9]" --include="*.tsx" --include="*.ts" . | \
  grep -v "react-hook-form@7.55.0" | \
  grep -v "supabase/functions" | \
  grep -v "node_modules"
```

**Expected Result:** No matches found

**If you find matches:**
- These are imports with version numbers like `from 'sonner@2.0.3'`
- Change them to `from 'sonner'`
- The ONLY exception is `react-hook-form@7.55.0` (required)

### Step 2: Clear ALL Caches

```bash
# Clear Vite caches
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist
rm -rf dist-ssr

# Clear npm cache
npm cache clean --force

# Clear build outputs
rm -rf build
rm -rf out
```

### Step 3: Complete Reinstall

```bash
# Remove everything
rm -rf node_modules
rm -f package-lock.json

# Fresh install
npm install --legacy-peer-deps
```

### Step 4: Verify Configuration

Check that you have ONLY ONE of each:

```bash
# Should find only 1
find . -name "vite.config*" -not -path "./node_modules/*"

# Should find only 1
find . -name "package.json" -not -path "./node_modules/*"
```

**If you find multiple:**
- Delete any duplicate files in `/imports/` or other subdirectories
- Keep only the root `/vite.config.ts` and `/package.json`

### Step 5: Check Node/npm Versions

```bash
node --version   # Should be >= 20.0.0
npm --version    # Should be >= 9.0.0
```

**If versions are too old:**
- Update Node.js from https://nodejs.org/
- npm will be updated automatically with Node

### Step 6: Browser Cache Clear

The error might be from cached browser files:

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Or try Incognito/Private mode:**
- This bypasses all browser caches
- If it works in Incognito, the issue is browser cache

### Step 7: Check for Browser Extensions

Some extensions can interfere:

1. Disable ALL browser extensions
2. Try loading the app again
3. Re-enable extensions one by one to find the culprit

Common problematic extensions:
- Ad blockers
- Privacy tools
- Script blockers
- React DevTools (sometimes)

---

## 🐛 Still Not Working?

### Check Vite Configuration

Your `/vite.config.ts` should look like this:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      'sonner': 'sonner',
      'recharts': 'recharts',
      'lucide-react': 'lucide-react',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'sonner', 'recharts', 'lucide-react'],
    exclude: [],
    force: true,
    esbuildOptions: {
      mainFields: ['module', 'main'],
    },
  },
  // ... rest of config
});
```

### Check Package.json

Verify these packages are installed:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "sonner": "^2.0.3",
    "recharts": "^2.8.0",
    "lucide-react": "^0.263.1"
  }
}
```

### Verify Installation

```bash
# Check if packages are actually installed
ls node_modules/sonner
ls node_modules/recharts
ls node_modules/lucide-react

# All should exist and contain files
```

---

## 🔬 Deep Debugging

### Enable Verbose Logging

```bash
# Run with debug flags
DEBUG=* npm run dev

# Or with Vite debug
VITE_DEBUG=* npm run dev
```

### Check Network Tab in DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Reload the page
4. Look for:
   - Red/failed requests
   - Requests to `@vite/client`
   - Any 404 errors

### Check Console Errors

Look for errors BEFORE the WebAssembly error:
- Module resolution errors
- Import errors
- Syntax errors

These might be the real cause.

### Try Different Port

Sometimes port conflicts cause issues:

```bash
# Edit vite.config.ts and change:
server: {
  port: 3000,  // Try different port
  strictPort: false,  // Allow port change if taken
}
```

---

## 📋 Checklist Before Asking for Help

- [ ] Ran `NUCLEAR_FIX.sh` or `NUCLEAR_FIX.bat`
- [ ] Verified no @version imports in source code
- [ ] Cleared ALL caches (Vite, npm, browser)
- [ ] Fresh install of node_modules
- [ ] Only ONE vite.config.ts exists
- [ ] Only ONE package.json exists (in root)
- [ ] Node version >= 20.0.0
- [ ] npm version >= 9.0.0
- [ ] Tried different browser
- [ ] Tried Incognito/Private mode
- [ ] Disabled browser extensions
- [ ] Checked DevTools console for other errors
- [ ] Checked DevTools Network tab

---

## 💡 Common Mistakes

### ❌ Don't Do This:
```typescript
import { toast } from 'sonner@2.0.3';  // ❌ BAD
import { Icon } from 'lucide-react@0.487.0';  // ❌ BAD
```

### ✅ Do This:
```typescript
import { toast } from 'sonner';  // ✅ GOOD
import { Icon } from 'lucide-react';  // ✅ GOOD
```

### ❌ Don't Do This:
```bash
npm install  # Using old cache
```

### ✅ Do This:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps  # Fresh install
```

---

## 🎯 Quick Reference

| Problem | Solution |
|---------|----------|
| WebAssembly error | Run NUCLEAR_FIX script |
| @version imports | Remove version from imports |
| Multiple configs | Delete duplicates, keep root only |
| Old cache | Clear ALL caches |
| Corrupted modules | Delete & reinstall node_modules |
| Browser cache | Hard reload / Incognito mode |
| Wrong Node version | Update to Node 20+ |

---

## ✅ Success Indicators

After the fix, you should see:

```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**No errors like:**
- ❌ WebAssembly compilation aborted
- ❌ Network error: Response body loading was aborted
- ❌ Failed to resolve module
- ❌ Cannot find module

**Console should show:**
- ✅ Vite client connected
- ✅ [vite] connecting...
- ✅ [vite] connected.

---

## 📞 Still Stuck?

If none of this works, please provide:

1. **Full error message** from browser console
2. **Network tab screenshot** showing failed requests
3. **Node/npm versions** (`node --version`, `npm --version`)
4. **Operating System** (Windows/Mac/Linux)
5. **Output** from running NUCLEAR_FIX script
6. **Any other errors** that appear BEFORE the WebAssembly error

This will help diagnose the root cause.
