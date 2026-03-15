#!/usr/bin/env node

/**
 * Fix ALL UI component imports to remove @version syntax
 * This script fixes the WebAssembly compilation error by removing version specifiers
 */

const fs = require('fs');
const path = require('path');

// All the problematic package patterns to fix
const PACKAGE_FIXES = [
  { pattern: /@radix-ui\/react-alert-dialog@[\d.]+/g, replacement: '@radix-ui/react-alert-dialog' },
  { pattern: /@radix-ui\/react-aspect-ratio@[\d.]+/g, replacement: '@radix-ui/react-aspect-ratio' },
  { pattern: /@radix-ui\/react-avatar@[\d.]+/g, replacement: '@radix-ui/react-avatar' },
  { pattern: /@radix-ui\/react-slot@[\d.]+/g, replacement: '@radix-ui/react-slot' },
  { pattern: /@radix-ui\/react-checkbox@[\d.]+/g, replacement: '@radix-ui/react-checkbox' },
  { pattern: /@radix-ui\/react-collapsible@[\d.]+/g, replacement: '@radix-ui/react-collapsible' },
  { pattern: /@radix-ui\/react-context-menu@[\d.]+/g, replacement: '@radix-ui/react-context-menu' },
  { pattern: /@radix-ui\/react-dialog@[\d.]+/g, replacement: '@radix-ui/react-dialog' },
  { pattern: /@radix-ui\/react-dropdown-menu@[\d.]+/g, replacement: '@radix-ui/react-dropdown-menu' },
  { pattern: /@radix-ui\/react-label@[\d.]+/g, replacement: '@radix-ui/react-label' },
  { pattern: /@radix-ui\/react-hover-card@[\d.]+/g, replacement: '@radix-ui/react-hover-card' },
  { pattern: /@radix-ui\/react-menubar@[\d.]+/g, replacement: '@radix-ui/react-menubar' },
  { pattern: /@radix-ui\/react-navigation-menu@[\d.]+/g, replacement: '@radix-ui/react-navigation-menu' },
  { pattern: /@radix-ui\/react-popover@[\d.]+/g, replacement: '@radix-ui/react-popover' },
  { pattern: /@radix-ui\/react-progress@[\d.]+/g, replacement: '@radix-ui/react-progress' },
  { pattern: /@radix-ui\/react-radio-group@[\d.]+/g, replacement: '@radix-ui/react-radio-group' },
  { pattern: /@radix-ui\/react-scroll-area@[\d.]+/g, replacement: '@radix-ui/react-scroll-area' },
  { pattern: /@radix-ui\/react-select@[\d.]+/g, replacement: '@radix-ui/react-select' },
  { pattern: /@radix-ui\/react-separator@[\d.]+/g, replacement: '@radix-ui/react-separator' },
  { pattern: /@radix-ui\/react-slider@[\d.]+/g, replacement: '@radix-ui/react-slider' },
  { pattern: /@radix-ui\/react-switch@[\d.]+/g, replacement: '@radix-ui/react-switch' },
  { pattern: /@radix-ui\/react-tabs@[\d.]+/g, replacement: '@radix-ui/react-tabs' },
  { pattern: /@radix-ui\/react-toast@[\d.]+/g, replacement: '@radix-ui/react-toast' },
  { pattern: /@radix-ui\/react-toggle@[\d.]+/g, replacement: '@radix-ui/react-toggle' },
  { pattern: /@radix-ui\/react-toggle-group@[\d.]+/g, replacement: '@radix-ui/react-toggle-group' },
  { pattern: /@radix-ui\/react-tooltip@[\d.]+/g, replacement: '@radix-ui/react-tooltip' },
  { pattern: /class-variance-authority@[\d.]+/g, replacement: 'class-variance-authority' },
  { pattern: /lucide-react@[\d.]+/g, replacement: 'lucide-react' },
  { pattern: /react-day-picker@[\d.]+/g, replacement: 'react-day-picker' },
  { pattern: /embla-carousel-react@[\d.]+/g, replacement: 'embla-carousel-react' },
  { pattern: /recharts@[\d.]+/g, replacement: 'recharts' },
  { pattern: /cmdk@[\d.]+/g, replacement: 'cmdk' },
  { pattern: /vaul@[\d.]+/g, replacement: 'vaul' },
  { pattern: /input-otp@[\d.]+/g, replacement: 'input-otp' },
  { pattern: /react-resizable-panels@[\d.]+/g, replacement: 'react-resizable-panels' },
  { pattern: /next-themes@[\d.]+/g, replacement: 'next-themes' },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    PACKAGE_FIXES.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        walkDirectory(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main execution
console.log('🔧 Fixing all UI component imports...\n');

const rootDir = process.cwd();
const allFiles = walkDirectory(rootDir);

let fixedCount = 0;

allFiles.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Complete! Fixed ${fixedCount} files.`);
console.log('\n📋 Next steps:');
console.log('   1. npm install');
console.log('   2. rm -rf node_modules/.vite');
console.log('   3. npm run dev');
