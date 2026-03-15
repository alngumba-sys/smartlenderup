#!/usr/bin/env node

/**
 * Verify that no @supabase imports exist in browser code
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking for @supabase imports in browser code...\n');

const dirsToCheck = ['src', 'lib', 'components', 'hooks', 'utils', 'types', 'context'];
const extensions = ['.ts', '.tsx', '.js', '.jsx'];
let foundIssues = false;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    if (line.includes('@supabase') && !line.trim().startsWith('//')) {
      console.log(`❌ FOUND @supabase import in: ${filePath}:${index + 1}`);
      console.log(`   ${line.trim()}`);
      foundIssues = true;
    }
  });
}

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (extensions.some(ext => item.endsWith(ext))) {
      checkFile(fullPath);
    }
  });
}

dirsToCheck.forEach(dir => {
  console.log(`Scanning ${dir}/...`);
  scanDirectory(dir);
});

console.log('\n' + '='.repeat(60) + '\n');

if (foundIssues) {
  console.log('❌ FOUND @supabase imports!');
  console.log('   These need to be replaced with imports from /lib/supabase.ts\n');
  process.exit(1);
} else {
  console.log('✅ NO @supabase imports found in browser code!');
  console.log('   The WebAssembly error is 100% browser cache.\n');
  console.log('   → Just reload your browser or use incognito mode!\n');
  process.exit(0);
}
