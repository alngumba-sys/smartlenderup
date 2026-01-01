import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all .tsx and .ts files
function findAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and dist
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        findAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to remove version numbers from imports
function removeVersionNumbers(content) {
  // Pattern to match: from "package@version" or from 'package@version'
  // Also handles: } from "package@version"
  const pattern = /from\s+['"]([@a-zA-Z0-9\-\/]+)@[\d\.]+['"]/g;
  return content.replace(pattern, (match, packageName) => {
    return `from "${packageName}"`;
  });
}

// Main execution
console.log('🔧 Fixing versioned imports...\n');

const projectRoot = __dirname;
const allFiles = findAllFiles(projectRoot);

let filesFixed = 0;
let totalReplacements = 0;

allFiles.forEach(filePath => {
  const originalContent = fs.readFileSync(filePath, 'utf8');
  const fixedContent = removeVersionNumbers(originalContent);

  if (originalContent !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    const relativePath = path.relative(projectRoot, filePath);
    
    // Count replacements
    const matches = originalContent.match(/from\s+['"]([@a-zA-Z0-9\-\/]+)@[\d\.]+['"]/g);
    const count = matches ? matches.length : 0;
    
    console.log(`✅ Fixed ${relativePath} (${count} imports)`);
    filesFixed++;
    totalReplacements += count;
  }
});

console.log(`\n✨ Done! Fixed ${totalReplacements} versioned imports in ${filesFixed} files.`);
