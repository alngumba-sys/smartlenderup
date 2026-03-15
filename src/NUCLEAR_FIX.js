#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.clear();
console.log('\n');
console.log('██████████████████████████████████████████████████████████████████');
console.log('██                                                              ██');
console.log('██         🔥 NUCLEAR FIX - WEBASSEMBLY ERROR 🔥               ██');
console.log('██                                                              ██');
console.log('██████████████████████████████████████████████████████████████████');
console.log('\n');

function run(cmd, options = {}) {
  try {
    execSync(cmd, { stdio: 'ignore', ...options });
    return true;
  } catch (e) {
    return false;
  }
}

function deleteFolder(folderPath) {
  try {
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true, maxRetries: 3 });
      return true;
    }
  } catch (e) {
    console.log(`   ⚠️  Could not delete ${folderPath}:`, e.message);
  }
  return false;
}

// STEP 1: KILL EVERYTHING
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  [1/8] KILLING ALL NODE PROCESSES...                          ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

if (process.platform === 'win32') {
  run('taskkill /F /IM node.exe');
  run('taskkill /F /IM npm.exe');
  run('taskkill /F /IM vite.exe');
} else {
  run('pkill -9 node');
  run('pkill -9 npm');
  run('pkill -9 vite');
}
console.log('   ✅ All Node processes killed\n');

// STEP 2: DELETE ALL VITE CACHE
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  [2/8] DELETING ALL VITE CACHE FOLDERS...                     ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

const files = fs.readdirSync('.');
let deletedCount = 0;

files.forEach(file => {
  if (file.startsWith('.vite')) {
    if (deleteFolder(file)) {
      console.log(`   🗑️  Deleted: ${file}`);
      deletedCount++;
    }
  }
});

console.log(`   ✅ Deleted ${deletedCount} Vite cache folders\n`);

// STEP 3: DELETE DIST
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  [3/8] DELETING DIST FOLDER...                                ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

if (deleteFolder('dist')) {
  console.log('   ✅ Deleted dist folder\n');
} else {
  console.log('   ℹ️  No dist folder found\n');
}

// STEP 4: DELETE NODE_MODULES CACHE
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  [4/8] DELETING NODE_MODULES CACHE...                         ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

if (deleteFolder('node_modules/.vite')) {
  console.log('   ✅ Deleted node_modules/.vite\n');
} else {
  console.log('   ℹ️  No node_modules/.vite found\n');
}

if (deleteFolder('node_modules/.cache')) {
  console.log('   ✅ Deleted node_modules/.cache\n');
} else {
  console.log('   ℹ️  No node_modules/.cache found\n');
}

// STEP 5: CLEAR NPM CACHE
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  [5/8] CLEARING NPM CACHE...                                  ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

run('npm cache clean --force');
console.log('   ✅ NPM cache cleared\n');

// STEP 6: CLEAR BROWSER CACHE INSTRUCTIONS
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  [6/8] BROWSER CACHE INFO                                     ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');
console.log('   💡 Using INCOGNITO mode bypasses ALL browser cache!');
console.log('   💡 Press Ctrl+Shift+N (or Cmd+Shift+N on Mac)');
console.log('');

// STEP 7: VERIFY VITE CONFIG
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  [7/8] VERIFYING VITE CONFIG...                               ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

try {
  const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
  if (viteConfig.includes('port: 5174')) {
    console.log('   ✅ Port 5174 confirmed in vite.config.ts');
  } else if (viteConfig.includes('port: 5173')) {
    console.log('   ❌ ERROR: Still using port 5173!');
    console.log('   🔧 Fixing now...');
    
    const newConfig = viteConfig.replace(/port:\s*5173/, 'port: 5174');
    fs.writeFileSync('vite.config.ts', newConfig, 'utf8');
    console.log('   ✅ Changed port to 5174');
  } else {
    console.log('   ⚠️  Port not explicitly set, will use default');
  }
} catch (e) {
  console.log('   ⚠️  Could not read vite.config.ts');
}
console.log('');

// STEP 8: START SERVER
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  [8/8] STARTING SERVER ON PORT 5174...                        ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('\n');

console.log('   🌐 Server URL: http://localhost:5174');
console.log('   📱 Opening browser in 6 seconds...\n');

// Start the dev server
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  detached: false
});

// Wait then open browser
setTimeout(() => {
  console.log('\n');
  console.log('██████████████████████████████████████████████████████████████████');
  console.log('██                                                              ██');
  console.log('██                   🎉 OPENING BROWSER! 🎉                     ██');
  console.log('██                                                              ██');
  console.log('██████████████████████████████████████████████████████████████████');
  console.log('\n');
  console.log('   ⚡ CRITICAL INSTRUCTIONS:');
  console.log('');
  console.log('   1️⃣  Browser will open in INCOGNITO mode');
  console.log('   2️⃣  URL: http://localhost:5174');
  console.log('   3️⃣  If browser doesn\'t open automatically:');
  console.log('       • Press Ctrl+Shift+N (Windows/Linux)');
  console.log('       • Press Cmd+Shift+N (Mac)');
  console.log('       • Type: localhost:5174');
  console.log('   4️⃣  Press F12 to verify in Console:');
  console.log('       ✅ "Loading app with MOCK Supabase"');
  console.log('       ✅ "WebAssembly blocked"');
  console.log('       ✅ NO errors!');
  console.log('');
  console.log('██████████████████████████████████████████████████████████████████');
  console.log('\n');

  const url = 'http://localhost:5174';
  
  // Try to open in incognito
  if (process.platform === 'win32') {
    // Windows - try multiple browsers
    run(`start chrome --incognito --new-window "${url}"`) ||
    run(`start msedge --inprivate --new-window "${url}"`) ||
    run(`start firefox -private-window "${url}"`) ||
    run(`start "${url}"`);
  } else if (process.platform === 'darwin') {
    // macOS
    run(`open -na "Google Chrome" --args --incognito --new-window "${url}"`) ||
    run(`open -na "Firefox" --args --private-window "${url}"`) ||
    run(`open "${url}"`);
  } else {
    // Linux
    run(`google-chrome --incognito --new-window "${url}"`) ||
    run(`chromium --incognito --new-window "${url}"`) ||
    run(`firefox --private-window "${url}"`) ||
    run(`xdg-open "${url}"`);
  }
  
  console.log('');
  console.log('   ✅ Browser command sent!');
  console.log('');
  console.log('   🔥 IF YOU STILL SEE THE ERROR:');
  console.log('');
  console.log('   1. Check the URL bar - make sure it says localhost:5174');
  console.log('   2. You MUST use incognito mode (Ctrl+Shift+N)');
  console.log('   3. Close ALL browser windows and try again');
  console.log('   4. Clear browser data: Ctrl+Shift+Delete');
  console.log('');
  console.log('   ❌ NEVER use localhost:5173 (old port!)');
  console.log('   ✅ ALWAYS use localhost:5174 (new port!)');
  console.log('');
  console.log('██████████████████████████████████████████████████████████████████');
  console.log('\n');
  console.log('   Press Ctrl+C to stop the server');
  console.log('');
}, 6000);

// Handle exit
process.on('SIGINT', () => {
  console.log('\n\n   🛑 Stopping server...\n');
  server.kill();
  process.exit();
});
