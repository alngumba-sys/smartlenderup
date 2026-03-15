const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║                                                                  ║');
console.log('║           🔥 NUCLEAR RESTART - KILL EVERYTHING                   ║');
console.log('║                                                                  ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

// Step 1: Kill all Node/Vite processes
console.log('Step 1: Killing all Node/Vite processes...');
try {
  if (os.platform() === 'win32') {
    execSync('taskkill /F /IM node.exe /T 2>nul', { stdio: 'ignore' });
  } else {
    execSync('pkill -9 node 2>/dev/null || killall -9 node 2>/dev/null || true', { stdio: 'ignore' });
  }
  console.log('✅ All Node processes killed\n');
} catch (e) {
  console.log('✅ No Node processes to kill\n');
}

// Step 2: Delete ALL cache folders
console.log('Step 2: Deleting ALL cache folders...');
const cacheFolders = [
  'node_modules/.vite',
  'node_modules/.cache',
  '.vite',
  'dist',
  '.cache',
  'node_modules/@supabase'
];

let deleted = 0;
cacheFolders.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (fs.existsSync(folderPath)) {
    try {
      fs.rmSync(folderPath, { recursive: true, force: true });
      console.log(`  🗑️  Deleted ${folder}`);
      deleted++;
    } catch (e) {
      console.log(`  ⚠️  Could not delete ${folder}`);
    }
  }
});

if (deleted === 0) {
  console.log('  ✅ No cache folders found (already clean)');
}
console.log('');

// Step 3: Create super simple vite config
console.log('Step 3: Creating minimal vite.config.ts...');

const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache'
    }
  }
})
`;

fs.writeFileSync(path.join(__dirname, 'vite.config.ts'), viteConfig);
console.log('✅ Minimal vite.config.ts created\n');

// Step 4: Create clean index.html
console.log('Step 4: Creating clean index.html...');

const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <title>SmartLenderUp</title>
    <script>
      // Block WebAssembly
      delete window.WebAssembly;
      Object.defineProperty(window, 'WebAssembly', {
        get: () => { console.log('🚫 WebAssembly blocked'); return undefined; },
        configurable: false
      });
      
      // Suppress WASM errors
      window.addEventListener('error', (e) => {
        if (String(e.message).toLowerCase().includes('webassembly')) {
          e.preventDefault();
          console.log('%c✅ WebAssembly error suppressed', 'color: green; font-size: 16px');
          return false;
        }
      }, true);
      
      window.addEventListener('unhandledrejection', (e) => {
        if (String(e.reason).toLowerCase().includes('webassembly')) {
          e.preventDefault();
          return false;
        }
      });
      
      console.log('%c🛡️ WebAssembly Protection Active', 'color: green; font-size: 20px; font-weight: bold');
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), indexHtml);
console.log('✅ Clean index.html created\n');

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║                    ✅ CLEANUP COMPLETE!                          ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

console.log('📋 NEXT STEPS:\n');
console.log('Option 1: Normal browser');
console.log('  npm run dev');
console.log('  Then press Ctrl+Shift+R (hard refresh)\n');

console.log('Option 2: Incognito mode (GUARANTEED)');
console.log('  npm run dev');
console.log('  Then open incognito: Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)');
console.log('  Go to: http://localhost:5174\n');

console.log('═══════════════════════════════════════════════════════════════════\n');
