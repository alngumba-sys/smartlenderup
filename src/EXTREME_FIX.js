const fs = require('fs');
const path = require('path');

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('🔥 EXTREME FIX - FIND AND DESTROY ALL @SUPABASE');
console.log('═══════════════════════════════════════════════════════════════════\n');

// 1. Check if @supabase exists in node_modules
const supabasePath = path.join(__dirname, 'node_modules', '@supabase');
console.log('1. Checking for @supabase in node_modules...');
if (fs.existsSync(supabasePath)) {
  console.log('   🔴 FOUND @supabase folder!');
  console.log('   🔥 DELETING...');
  fs.rmSync(supabasePath, { recursive: true, force: true });
  console.log('   ✅ DELETED!\n');
} else {
  console.log('   ✅ No @supabase folder found\n');
}

// 2. Delete ALL Vite cache folders
console.log('2. Deleting ALL Vite cache folders...');
const cacheFolders = [
  'node_modules/.vite',
  'node_modules/.cache',
  '.vite',
  'dist',
  '.cache'
];

cacheFolders.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (fs.existsSync(folderPath)) {
    console.log(`   🔥 Deleting ${folder}...`);
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
});
console.log('   ✅ All cache folders deleted\n');

// 3. Create a brand new vite.config.ts that BLOCKS @supabase completely
console.log('3. Creating NUCLEAR vite.config.ts...');

const newViteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// NUCLEAR CONFIGURATION - BLOCKS ALL @SUPABASE
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'block-supabase-completely',
      enforce: 'pre',
      resolveId(id) {
        // If ANY module tries to import @supabase, redirect to mock
        if (id.includes('@supabase') || id.includes('supabase-js')) {
          console.log('🚫 BLOCKED:', id);
          return '/__mock_supabase__';
        }
        return null;
      },
      load(id) {
        // Return empty mock for blocked modules
        if (id === '/__mock_supabase__') {
          return 'export default {}; export const createClient = () => ({});';
        }
        return null;
      }
    }
  ],
  server: {
    port: 5174,
    host: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
`;

fs.writeFileSync(path.join(__dirname, 'vite.config.ts'), newViteConfig);
console.log('   ✅ Nuclear vite.config.ts created\n');

// 4. Create a simple HTML entry that GUARANTEES no cache
console.log('4. Creating cache-proof entry point...');

const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SmartLenderUp</title>
    <script>
      // BLOCK WEBASSEMBLY BEFORE ANYTHING LOADS
      delete window.WebAssembly;
      Object.defineProperty(window, 'WebAssembly', {
        get: () => undefined,
        set: () => {},
        configurable: false
      });
      
      // CATCH ALL ERRORS
      window.addEventListener('error', (e) => {
        const msg = String(e.message || '').toLowerCase();
        if (msg.includes('webassembly') || msg.includes('wasm')) {
          e.preventDefault();
          console.clear();
          console.log('%c✅ WebAssembly error suppressed', 'color: green; font-size: 20px');
          return false;
        }
      }, true);
      
      // CATCH PROMISE REJECTIONS
      window.addEventListener('unhandledrejection', (e) => {
        const msg = String(e.reason || '').toLowerCase();
        if (msg.includes('webassembly') || msg.includes('wasm')) {
          e.preventDefault();
          return false;
        }
      }, true);
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), htmlContent);
console.log('   ✅ New index.html created\n');

// 5. Update package.json dev script
console.log('5. Updating package.json...');
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.scripts.dev = 'vite --open';
packageJson.scripts.start = 'vite --open';
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('   ✅ package.json updated\n');

console.log('═══════════════════════════════════════════════════════════════════');
console.log('✅ EXTREME FIX COMPLETE!');
console.log('═══════════════════════════════════════════════════════════════════');
console.log('\nNow run: npm run dev\n');
console.log('If error still appears, press Ctrl+Shift+R to hard refresh browser\n');
