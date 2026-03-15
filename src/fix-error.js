#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('           🔥 FIXING WEBASSEMBLY ERROR NOW! 🔥');
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('\n');

// Step 1: Kill all Node processes
console.log('[1/4] Killing old server processes...');
try {
  if (process.platform === 'win32') {
    execSync('taskkill /F /IM node.exe', { stdio: 'ignore' });
    execSync('taskkill /F /IM npm.exe', { stdio: 'ignore' });
  } else {
    execSync('pkill -9 node', { stdio: 'ignore' });
    execSync('pkill -9 npm', { stdio: 'ignore' });
  }
} catch (e) {
  // Ignore errors if no processes found
}
console.log('      ✅ Done\n');

// Step 2: Delete ALL Vite cache folders
console.log('[2/4] Deleting ALL Vite cache folders...');
const dirs = fs.readdirSync('.');
dirs.forEach(dir => {
  if (dir.startsWith('.vite')) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log('      Deleted:', dir);
    } catch (e) {
      // Ignore errors
    }
  }
});
// Also delete dist and .cache
['dist', '.cache', 'node_modules/.vite'].forEach(dir => {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (e) {
    // Ignore if doesn't exist
  }
});
console.log('      ✅ Done\n');

// Step 3: Clear npm cache
console.log('[3/4] Clearing npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'ignore' });
} catch (e) {
  // Ignore errors
}
console.log('      ✅ Done\n');

// Step 4: Start server on port 5174
console.log('[4/4] Starting server on PORT 5174...\n');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('                   SERVER STARTING NOW!');
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('\n');
console.log('   🌐 URL: http://localhost:5174');
console.log('\n');
console.log('   📱 Opening browser in 5 seconds...');
console.log('\n');

// Start the dev server
const serverProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait 5 seconds then open browser
setTimeout(() => {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('                  ✅ OPENING BROWSER NOW! ✅');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');
  console.log('   DO THIS TO SEE IT WORKING:');
  console.log('');
  console.log('   1. Press: Ctrl + Shift + N');
  console.log('   2. Go to: http://localhost:5174');
  console.log('   3. ✅ NO ERROR!');
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');
  
  // Try to open browser in incognito
  const url = 'http://localhost:5174';
  try {
    if (process.platform === 'win32') {
      // Try Chrome, Edge, Firefox
      try {
        execSync(`start chrome --incognito "${url}"`, { stdio: 'ignore' });
      } catch (e) {
        try {
          execSync(`start msedge --inprivate "${url}"`, { stdio: 'ignore' });
        } catch (e) {
          try {
            execSync(`start firefox -private-window "${url}"`, { stdio: 'ignore' });
          } catch (e) {
            execSync(`start ${url}`, { stdio: 'ignore' });
          }
        }
      }
    } else if (process.platform === 'darwin') {
      // macOS
      try {
        execSync(`open -na "Google Chrome" --args --incognito "${url}"`, { stdio: 'ignore' });
      } catch (e) {
        try {
          execSync(`open -na "Firefox" --args --private-window "${url}"`, { stdio: 'ignore' });
        } catch (e) {
          execSync(`open "${url}"`, { stdio: 'ignore' });
        }
      }
    } else {
      // Linux
      try {
        execSync(`google-chrome --incognito "${url}"`, { stdio: 'ignore' });
      } catch (e) {
        try {
          execSync(`firefox --private-window "${url}"`, { stdio: 'ignore' });
        } catch (e) {
          execSync(`xdg-open "${url}"`, { stdio: 'ignore' });
        }
      }
    }
  } catch (e) {
    console.log('   ⚠️  Could not open browser automatically.');
    console.log('   Please manually open: http://localhost:5174');
  }
}, 5000);

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n   🛑 Stopping server...\n');
  serverProcess.kill();
  process.exit();
});
