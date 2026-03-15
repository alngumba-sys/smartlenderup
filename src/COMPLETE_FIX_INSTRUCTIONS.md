# 🚨 COMPLETE FIX FOR WEBASSEMBLY ERROR

## Problem
ALL UI component files are using `@version` syntax in imports (e.g., `lucide-react@0.487.0`, `@radix-ui/react-dialog@1.1.6`), which causes WebAssembly compilation errors in Vite.

## ✅ Solution - Run This Command

```bash
node fix-all-ui-imports.js
```

This will automatically fix ALL remaining files by removing version specifiers from imports.

## Or Manual Fix with Find & Replace

If the script doesn't work, use your IDE's global find-and-replace:

### Step 1: Find and Replace Patterns

Replace these patterns in ALL `.tsx` and `.ts` files:

1. `@radix-ui/react-alert-dialog@1.1.6` → `@radix-ui/react-alert-dialog`
2. `@radix-ui/react-aspect-ratio@1.1.2` → `@radix-ui/react-aspect-ratio`
3. `@radix-ui/react-avatar@1.1.3` → `@radix-ui/react-avatar`
4. `@radix-ui/react-checkbox@1.1.4` → `@radix-ui/react-checkbox`
5. `@radix-ui/react-collapsible@1.1.3` → `@radix-ui/react-collapsible`
6. `@radix-ui/react-context-menu@2.2.6` → `@radix-ui/react-context-menu`
7. `@radix-ui/react-dialog@1.1.6` → `@radix-ui/react-dialog`
8. `@radix-ui/react-dropdown-menu@2.1.6` → `@radix-ui/react-dropdown-menu`
9. `@radix-ui/react-hover-card@1.1.6` → `@radix-ui/react-hover-card`
10. `@radix-ui/react-label@2.1.2` → `@radix-ui/react-label`
11. `@radix-ui/react-menubar@1.1.6` → `@radix-ui/react-menubar`
12. `@radix-ui/react-navigation-menu@1.2.5` → `@radix-ui/react-navigation-menu`
13. `@radix-ui/react-popover@1.1.6` → `@radix-ui/react-popover`
14. `@radix-ui/react-progress@1.1.2` → `@radix-ui/react-progress`
15. `@radix-ui/react-radio-group@1.2.3` → `@radix-ui/react-radio-group`
16. `@radix-ui/react-scroll-area@1.2.3` → `@radix-ui/react-scroll-area`
17. `@radix-ui/react-select@2.1.6` → `@radix-ui/react-select`
18. `@radix-ui/react-separator@1.1.2` → `@radix-ui/react-separator`
19. `@radix-ui/react-slider@1.2.3` → `@radix-ui/react-slider`
20. `@radix-ui/react-slot@1.1.2` → `@radix-ui/react-slot`
21. `@radix-ui/react-switch@1.1.3` → `@radix-ui/react-switch`
22. `@radix-ui/react-tabs@1.1.3` → `@radix-ui/react-tabs`
23. `@radix-ui/react-toast@1.2.6` → `@radix-ui/react-toast`
24. `@radix-ui/react-toggle@1.1.3` → `@radix-ui/react-toggle`
25. `@radix-ui/react-toggle-group@1.1.3` → `@radix-ui/react-toggle-group`
26. `@radix-ui/react-tooltip@1.1.6` → `@radix-ui/react-tooltip`
27. `lucide-react@0.487.0` → `lucide-react`
28. `class-variance-authority@0.7.1` → `class-variance-authority`
29. `react-day-picker@8.10.1` → `react-day-picker`
30. `embla-carousel-react@8.6.0` → `embla-carousel-react`
31. `recharts@2.15.2` → `recharts`
32. `cmdk@1.1.1` → `cmdk`
33. `vaul@1.1.2` → `vaul`
34. `input-otp@1.4.2` → `input-otp`
35. `react-resizable-panels@2.1.7` → `react-resizable-panels`
36. `next-themes@0.4.6` → `next-themes`

### Step 2: Using Regex (Recommended)

Use this single regex pattern to fix everything:

**Find:** `(@radix-ui/[a-z-]+|lucide-react|class-variance-authority|react-day-picker|embla-carousel-react|recharts|cmdk|vaul|input-otp|react-resizable-panels|next-themes)@[\d.]+`

**Replace:** `$1`

**Options:** Enable "Regex" mode in your IDE

### VS Code Instructions:
1. Press `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac)
2. Click the `.*` icon to enable regex mode
3. Paste the Find pattern above
4. Paste the Replace pattern above
5. Click "Replace All"

### IntelliJ/WebStorm Instructions:
1. Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Check "Regex" checkbox
3. Paste the Find pattern above
4. Paste the Replace pattern above
5. Click "Replace All"

## Step 3: After Fixing

```bash
# Clear the cache
rm -rf node_modules/.vite

# Reinstall
npm install

# Start dev server
npm run dev
```

## Files That Need Fixing

All files in `/components/ui/`:
- accordion.tsx
- alert-dialog.tsx ✅ (FIXED)
- alert.tsx
- aspect-ratio.tsx
- avatar.tsx
- badge.tsx
- breadcrumb.tsx
- button.tsx ✅ (FIXED)
- calendar.tsx
- card.tsx
- carousel.tsx
- chart.tsx
- checkbox.tsx
- collapsible.tsx
- command.tsx
- context-menu.tsx
- dialog.tsx ✅ (FIXED)
- drawer.tsx
- dropdown-menu.tsx
- form.tsx
- hover-card.tsx
- input-otp.tsx
- label.tsx
- menubar.tsx
- navigation-menu.tsx
- pagination.tsx
- popover.tsx
- progress.tsx
- radio-group.tsx
- resizable.tsx
- scroll-area.tsx
- select.tsx ✅ (FIXED)
- separator.tsx
- sheet.tsx
- slider.tsx
- sonner.tsx ✅ (FIXED)
- switch.tsx
- tabs.tsx
- toggle-group.tsx
- toggle.tsx
- tooltip.tsx

## Why This Happened

The `@version` syntax (like `package@version`) is for:
- ✅ CDN imports (Skypack, unpkg)
- ✅ Deno

But NOT for:
- ❌ npm + Vite
- ❌ Standard Node.js imports

## Expected Result

After fixing all files:
- ✅ No WebAssembly compilation errors
- ✅ App compiles and runs successfully
- ✅ All UI components work correctly
- ✅ No module resolution errors

---

**Status:** Ready to fix - Run the script or use find-and-replace!
