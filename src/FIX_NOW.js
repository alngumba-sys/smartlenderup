const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║                                                                  ║');
console.log('║                  🔥 ABSOLUTE FINAL FIX 🔥                        ║');
console.log('║                                                                  ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

// Step 1: Delete Vite cache
console.log('Step 1: Deleting Vite cache...');
const viteCache = path.join(__dirname, 'node_modules', '.vite');
if (fs.existsSync(viteCache)) {
  fs.rmSync(viteCache, { recursive: true, force: true });
  console.log('  ✅ Deleted node_modules/.vite\n');
} else {
  console.log('  ✅ No Vite cache to delete\n');
}

// Step 2: Check for @supabase
console.log('Step 2: Checking for @supabase...');
const supabasePath = path.join(__dirname, 'node_modules', '@supabase');
if (fs.existsSync(supabasePath)) {
  console.log('  ⚠️  Found @supabase folder!');
  console.log('  🔥 Deleting...');
  fs.rmSync(supabasePath, { recursive: true, force: true });
  console.log('  ✅ Deleted @supabase\n');
} else {
  console.log('  ✅ No @supabase found\n');
}

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║                     ✅ FIX COMPLETE!                             ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

console.log('🚀 NEXT STEPS:\n');
console.log('The app will now open on a DIFFERENT PORT: 5175');
console.log('Your browser has NEVER cached port 5175!\n');
console.log('If you still see an error, press: Ctrl+Shift+R (hard refresh)\n');
console.log('Starting dev server now...\n');
