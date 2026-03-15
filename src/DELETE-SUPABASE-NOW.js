#!/usr/bin/env node

/**
 * NUCLEAR OPTION - Delete @supabase from node_modules
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🔥 NUCLEAR SUPABASE DELETION SCRIPT 🔥\n');
console.log('This will completely remove @supabase from node_modules\n');

const supabasePath = path.join(__dirname, 'node_modules', '@supabase');

// Step 1: Delete @supabase folder
if (fs.existsSync(supabasePath)) {
  console.log('❌ Found @supabase in node_modules - DELETING...');
  try {
    fs.rmSync(supabasePath, { recursive: true, force: true });
    console.log('✅ Deleted node_modules/@supabase\n');
  } catch (err) {
    console.log('⚠️  Could not delete:', err.message);
  }
} else {
  console.log('✅ No @supabase folder in node_modules\n');
}

// Step 2: Check package-lock.json
const lockPath = path.join(__dirname, 'package-lock.json');
if (fs.existsSync(lockPath)) {
  console.log('🔍 Checking package-lock.json...');
  const lockContent = fs.readFileSync(lockPath, 'utf8');
  if (lockContent.includes('@supabase')) {
    console.log('❌ Found @supabase in package-lock.json - DELETING lock file...');
    fs.unlinkSync(lockPath);
    console.log('✅ Deleted package-lock.json\n');
  } else {
    console.log('✅ No @supabase in package-lock.json\n');
  }
}

// Step 3: Delete .vite cache
console.log('🗑️  Deleting .vite cache folders...');
const files = fs.readdirSync(__dirname);
let deleted = 0;
files.forEach(file => {
  if (file.startsWith('.vite')) {
    try {
      const fullPath = path.join(__dirname, file);
      fs.rmSync(fullPath, { recursive: true, force: true });
      deleted++;
    } catch (err) {}
  }
});
console.log(`✅ Deleted ${deleted} .vite cache folders\n`);

// Step 4: Delete dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('🗑️  Deleting dist folder...');
  try {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('✅ Deleted dist\n');
  } catch (err) {}
}

console.log('═══════════════════════════════════════════════════════════\n');
console.log('✅ CLEANUP COMPLETE!\n');
console.log('Now do these steps:\n');
console.log('1. Stop the dev server (Ctrl+C)');
console.log('2. Run: npm install');
console.log('3. Run: npm run dev');
console.log('4. Open browser in INCOGNITO mode (Ctrl+Shift+N)');
console.log('5. Go to: http://localhost:5174/app.html\n');
console.log('═══════════════════════════════════════════════════════════\n');
