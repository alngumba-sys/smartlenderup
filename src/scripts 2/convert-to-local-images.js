#!/usr/bin/env node

/**
 * Script to convert figma:asset imports to local /images/ paths
 * Run this AFTER downloading the code from Figma Make and BEFORE npm run build
 * 
 * Usage: node scripts/convert-to-local-images.js
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

// Mapping of figma:asset hashes to local image paths
const imageMap = {
  // SmartLenderUp main logo
  '09c4fb0bee355dd36ef162b16888a598745d0152.png': '/images/smartlenderup-logo.png',
  
  // SmartLenderUp logo (alternate)
  'fd18aa8c77f7b0374c9ef5d44e370cbe0bc4832b.png': '/images/smartlenderup-logo.png',
  
  // Laptop/Dashboard image
  '0bd33989a074d3dca1562004fa3fa4873d63a5f7.png': '/images/laptop-dashboard.png',
  
  // AI Insights image
  'e84e64fe3068a0b12ba739c2961bc2f26a775b78.png': '/images/ai-insights.png',
  
  // Mother company logos
  '49270d62af7b635a9c8e6fd00e8b4473223ce62d.png': '/images/consortium-logo.png',
  '60ce682323d016a6ce4fb3386d6389162cc1985b.png': '/images/scissorup-logo.png',
  '5635f9c39e606e609ee49836faa65f68db3f05cf.png': '/images/salesup-logo.png',
};

// Files to process
const filesToProcess = [
  'App.tsx',
  'components/LoginPage.tsx',
  'components/MotherCompanyHome.tsx',
  'components/reports/CollectionsReport.tsx',
  'components/reports/CashFlowReport.tsx',
  'components/reports/ProfitLossReport.tsx',
  'components/reports/PARReport.tsx',
  'components/reports/BalanceSheetReport.tsx',
  'components/reports/IncomeStatementReport.tsx',
  'components/reports/TrialBalanceReport.tsx',
  'components/reports/RegulatoryReport.tsx',
  'components/reports/ManagementReport.tsx',
];

console.log(`${colors.bright}${colors.blue}╔════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.bright}${colors.blue}║   SmartLenderUp - Local Image Converter           ║${colors.reset}`);
console.log(`${colors.bright}${colors.blue}╚════════════════════════════════════════════════════╝${colors.reset}\n`);

let totalReplacements = 0;
let filesModified = 0;

// Process each file
filesToProcess.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`${colors.yellow}⚠️  Skipping ${filePath} (not found)${colors.reset}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  let fileReplacements = 0;
  
  // Replace each figma:asset import
  Object.entries(imageMap).forEach(([hash, localPath]) => {
    const importRegex = new RegExp(`import\\s+(\\w+)\\s+from\\s+['"]figma:asset/${hash}['"];?`, 'g');
    
    if (importRegex.test(content)) {
      // Extract variable name
      const match = content.match(new RegExp(`import\\s+(\\w+)\\s+from\\s+['"]figma:asset/${hash}['"];?`));
      if (match) {
        const varName = match[1];
        
        // Replace import with const
        content = content.replace(
          new RegExp(`import\\s+${varName}\\s+from\\s+['"]figma:asset/${hash}['"];?`, 'g'),
          `const ${varName} = "${localPath}";`
        );
        
        modified = true;
        fileReplacements++;
      }
    }
  });
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`${colors.green}✅ ${filePath} - ${fileReplacements} replacement(s)${colors.reset}`);
    filesModified++;
    totalReplacements += fileReplacements;
  } else {
    console.log(`${colors.blue}ℹ️  ${filePath} - No changes needed${colors.reset}`);
  }
});

console.log(`\n${colors.bright}${colors.green}═══════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.bright}${colors.green}✨ Conversion Complete!${colors.reset}`);
console.log(`${colors.bright}${colors.green}═══════════════════════════════════════════════════${colors.reset}\n`);

console.log(`${colors.bright}Files modified: ${filesModified}${colors.reset}`);
console.log(`${colors.bright}Total replacements: ${totalReplacements}${colors.reset}\n`);

// Create public/images directory if it doesn't exist
const imagesDir = path.join(process.cwd(), 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log(`${colors.green}✅ Created directory: public/images/${colors.reset}\n`);
}

// Show instructions for next steps
console.log(`${colors.bright}${colors.yellow}📋 NEXT STEPS:${colors.reset}\n`);
console.log(`${colors.yellow}1. Add these image files to the public/images/ folder:${colors.reset}`);
console.log(`   ${colors.blue}├── smartlenderup-logo.png${colors.reset}    (Your SmartLenderUp logo)`);
console.log(`   ${colors.blue}├── laptop-dashboard.png${colors.reset}      (Dashboard preview image)`);
console.log(`   ${colors.blue}├── ai-insights.png${colors.reset}           (AI insights preview)`);
console.log(`   ${colors.blue}├── consortium-logo.png${colors.reset}       (Consortium logo)`);
console.log(`   ${colors.blue}├── scissorup-logo.png${colors.reset}        (ScissorUp logo)`);
console.log(`   ${colors.blue}└── salesup-logo.png${colors.reset}          (SalesUp logo)\n`);

console.log(`${colors.yellow}2. Run the build:${colors.reset}`);
console.log(`   ${colors.bright}npm run build${colors.reset}\n`);

console.log(`${colors.yellow}3. Test locally:${colors.reset}`);
console.log(`   ${colors.bright}npm run preview${colors.reset}\n`);

console.log(`${colors.green}${colors.bright}🚀 Ready for deployment!${colors.reset}\n`);
