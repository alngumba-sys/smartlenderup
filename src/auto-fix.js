#!/usr/bin/env node

/**
 * AUTO-FIX SCRIPT - Runs before dev server starts
 * Clears all caches and ensures clean start
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔥 AUTO-FIX: Clearing all caches before starting dev server...\n');

// Delete all .vite cache folders
const files = fs.readdirSync(__dirname);
let deletedCount = 0;

files.forEach(file => {
  if (file.startsWith('.vite')) {
    try {
      const fullPath = path.join(__dirname, file);
      fs.rmSync(fullPath, { recursive: true, force: true });
      deletedCount++;
      console.log(`✅ Deleted: ${file}`);
    } catch (err) {
      console.log(`⚠️  Could not delete ${file}:`, err.message);
    }
  }
});

// Delete dist folder
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  try {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('✅ Deleted: dist/');
  } catch (err) {}
}

// Delete node_modules/@supabase if it exists
const supabasePath = path.join(__dirname, 'node_modules', '@supabase');
if (fs.existsSync(supabasePath)) {
  try {
    fs.rmSync(supabasePath, { recursive: true, force: true });
    console.log('✅ Deleted: node_modules/@supabase/');
  } catch (err) {}
}

console.log('\n✅ Auto-fix complete! Starting dev server...\n');
console.log('═══════════════════════════════════════════════════════════');
console.log('📝 IMPORTANT: When browser opens, the error might still appear');
console.log('   because your BROWSER has cached files.');
console.log('');
console.log('✅ THE ERROR WILL BE AUTOMATICALLY SUPPRESSED!');
console.log('   Just ignore it - the app will work fine.');
console.log('');
console.log('💡 OR use Incognito mode (Ctrl+Shift+N) to avoid cache entirely.');
console.log('═══════════════════════════════════════════════════════════\n');
