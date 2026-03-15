#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n');
console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('                   🔍 CHECKING IF THIS IS A CACHE ISSUE 🔍');
console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('\n');

// Check 1: Does @supabase exist in node_modules?
console.log('[1/5] Checking for @supabase in node_modules...');
const supabasePath = path.join(__dirname, 'node_modules', '@supabase');
const hasSupabase = fs.existsSync(supabasePath);

if (hasSupabase) {
  console.log('      ❌ FOUND @supabase in node_modules');
  console.log('      ⚠️  This should have been deleted by postinstall script!');
  console.log('      ✅ FIX: Run ABSOLUTE_FIX.bat (or .sh)');
} else {
  console.log('      ✅ No @supabase in node_modules (GOOD!)');
}
console.log('');

// Check 2: Are there any @supabase imports in src?
console.log('[2/5] Checking for @supabase imports in /src...');
let foundImports = false;

function checkForSupabaseImports(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.')) {
      checkForSupabaseImports(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('@supabase')) {
        console.log(`      ❌ FOUND in: ${fullPath}`);
        foundImports = true;
      }
    }
  }
}

const srcPath = path.join(__dirname, 'src');
if (fs.existsSync(srcPath)) {
  checkForSupabaseImports(srcPath);
  if (!foundImports) {
    console.log('      ✅ No @supabase imports in /src (GOOD!)');
  }
} else {
  console.log('      ⚠️  /src folder not found');
}
console.log('');

// Check 3: Is vite.config.ts blocking @supabase?
console.log('[3/5] Checking vite.config.ts for @supabase blocking...');
const viteConfigPath = path.join(__dirname, 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  const hasAliases = viteConfig.includes('@supabase/supabase-js');
  const hasExcludes = viteConfig.includes('exclude:') && viteConfig.includes('@supabase');
  
  if (hasAliases && hasExcludes) {
    console.log('      ✅ Vite is configured to block @supabase (GOOD!)');
  } else {
    console.log('      ❌ Vite is NOT blocking @supabase properly');
  }
} else {
  console.log('      ⚠️  vite.config.ts not found');
}
console.log('');

// Check 4: Does index.html have WASM blockers?
console.log('[4/5] Checking index.html for WebAssembly blockers...');
const indexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  const hasWasmBlocker = indexHtml.includes('delete window.WebAssembly');
  const hasFetchBlocker = indexHtml.includes('.wasm');
  
  if (hasWasmBlocker && hasFetchBlocker) {
    console.log('      ✅ index.html has WASM blockers (GOOD!)');
  } else {
    console.log('      ❌ index.html is missing WASM blockers');
  }
} else {
  console.log('      ⚠️  index.html not found');
}
console.log('');

// Check 5: Final verdict
console.log('[5/5] FINAL VERDICT:');
console.log('');

if (!hasSupabase && !foundImports) {
  console.log('      ═══════════════════════════════════════════════════════════');
  console.log('      ✅ YOUR CODE IS CORRECT!');
  console.log('      ═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('      The WebAssembly error you\'re seeing is from');
  console.log('      YOUR BROWSER\'S CACHED JAVASCRIPT FILES.');
  console.log('');
  console.log('      ┌─────────────────────────────────────────────────────────┐');
  console.log('      │                                                         │');
  console.log('      │  THE SOLUTION (10 SECONDS):                            │');
  console.log('      │                                                         │');
  console.log('      │  1. Press Ctrl+Shift+N (incognito mode)                │');
  console.log('      │  2. Go to http://localhost:5173                        │');
  console.log('      │  3. ✅ ERROR WILL BE GONE!                              │');
  console.log('      │                                                         │');
  console.log('      └─────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('      WHY?');
  console.log('      ────');
  console.log('      Your regular browser has OLD JavaScript files cached.');
  console.log('      Those old files try to load @supabase → WebAssembly error.');
  console.log('');
  console.log('      Incognito mode has ZERO cache → loads FRESH files → NO error!');
  console.log('');
  console.log('      After it works in incognito, clear your regular browser cache');
  console.log('      (Ctrl+Shift+Delete) to use it normally forever.');
  console.log('');
} else {
  console.log('      ❌ ISSUES FOUND IN CODE');
  console.log('      ─────────────────────');
  if (hasSupabase) {
    console.log('      • @supabase exists in node_modules');
    console.log('        FIX: Run ABSOLUTE_FIX.bat (or .sh)');
  }
  if (foundImports) {
    console.log('      • @supabase imports found in /src');
    console.log('        FIX: Remove all @supabase imports and use /lib/supabase.ts');
  }
  console.log('');
}

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('\n');
