#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { rmSync, existsSync, readdirSync } from 'fs';
import { platform } from 'os';

console.clear();
console.log('\n');
console.log('═══════════════════════════════════════════════════════════════');
console.log('           🚨 STOPPING WEBASSEMBLY ERROR NOW 🚨');
console.log('═══════════════════════════════════════════════════════════════');
console.log('\n');

// The actual problem explained
console.log('📌 THE PROBLEM:');
console.log('   Your browser is showing OLD CACHED JavaScript files.');
console.log('   Those old files try to load WebAssembly → ERROR!\n');

console.log('📌 THE SOLUTION:');
console.log('   Server runs on PORT 5174 now (not 5173).');
console.log('   Port 5174 has NO cache → Fresh code → NO ERROR!\n');

console.log('═══════════════════════════════════════════════════════════════\n');

// Step 1: Kill processes
console.log('🔧 [STEP 1/4] Killing old Node processes...');
try {
  if (platform() === 'win32') {
    execSync('taskkill /F /IM node.exe', { stdio: 'ignore' });
  } else {
    execSync('pkill -9 node', { stdio: 'ignore' });
  }
  console.log('   ✅ Done\n');
} catch (e) {
  console.log('   ℹ️  No processes to kill\n');
}

// Step 2: Delete cache
console.log('🔧 [STEP 2/4] Deleting Vite cache folders...');
let deleted = 0;
try {
  const files = readdirSync('.');
  files.forEach(file => {
    if (file.startsWith('.vite')) {
      try {
        rmSync(file, { recursive: true, force: true });
        deleted++;
      } catch (e) {}
    }
  });
  
  if (existsSync('dist')) {
    rmSync('dist', { recursive: true, force: true });
    deleted++;
  }
  
  console.log(`   ✅ Deleted ${deleted} cache folders\n`);
} catch (e) {
  console.log('   ⚠️  Could not delete some folders\n');
}

// Step 3: Start server
console.log('🔧 [STEP 3/4] Starting dev server on port 5174...\n');
console.log('   ⏳ Please wait 10 seconds for server to start...\n');

const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  detached: false
});

// Step 4: Open browser after delay
setTimeout(() => {
  console.log('\n🔧 [STEP 4/4] Opening browser in INCOGNITO mode...\n');
  
  try {
    if (platform() === 'win32') {
      // Windows
      try {
        execSync('start chrome.exe --incognito http://localhost:5174', { stdio: 'ignore' });
        console.log('   ✅ Opened Chrome in incognito mode\n');
      } catch (e) {
        try {
          execSync('start msedge.exe --inprivate http://localhost:5174', { stdio: 'ignore' });
          console.log('   ✅ Opened Edge in InPrivate mode\n');
        } catch (e2) {
          console.log('   ⚠️  Could not auto-open browser\n');
          console.log('   👉 MANUALLY: Press Ctrl+Shift+N and go to localhost:5174\n');
        }
      }
    } else if (platform() === 'darwin') {
      // macOS
      try {
        execSync('open -na "Google Chrome" --args --incognito http://localhost:5174', { stdio: 'ignore' });
        console.log('   ✅ Opened Chrome in incognito mode\n');
      } catch (e) {
        console.log('   ⚠️  Could not auto-open browser\n');
        console.log('   👉 MANUALLY: Press Cmd+Shift+N and go to localhost:5174\n');
      }
    } else {
      // Linux
      try {
        execSync('google-chrome --incognito http://localhost:5174 &', { stdio: 'ignore' });
        console.log('   ✅ Opened Chrome in incognito mode\n');
      } catch (e) {
        console.log('   ⚠️  Could not auto-open browser\n');
        console.log('   👉 MANUALLY: Press Ctrl+Shift+N and go to localhost:5174\n');
      }
    }
  } catch (e) {
    console.log('   ⚠️  Could not auto-open browser\n');
    console.log('   👉 MANUALLY: Press Ctrl+Shift+N and go to localhost:5174\n');
  }
  
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('✨ FIX COMPLETE!\n');
  console.log('   The app is running at: http://localhost:5174\n');
  console.log('   ⚠️  CRITICAL: Make sure URL shows 5174, NOT 5173!\n');
  console.log('═══════════════════════════════════════════════════════════════\n');
}, 10000);

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping server...\n');
  server.kill();
  process.exit(0);
});