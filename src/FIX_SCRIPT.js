// Simple Node.js script to fix the file
const fs = require('fs');

const filePath = './services/supabaseDataService.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Find and remove all the warning lines between line 809 and 818
const lines = content.split('\n');

// Find the line with "Retrying product creation"
let startIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Retrying product creation')) {
    startIdx = i;
    break;
  }
}

if (startIdx !== -1) {
  // Remove blank lines and console.warn lines after it
  let endIdx = startIdx + 1;
  while (endIdx < lines.length && 
         (lines[endIdx].trim() === '' || 
          lines[endIdx].includes('console.warn') || 
          lines[endIdx].includes('// Wait a tiny bit'))) {
    endIdx++;
  }
  
  // Insert the await line before continue
  lines.splice(startIdx + 1, endIdx - startIdx - 1, '            await new Promise(resolve => setTimeout(resolve, 200));');
  
  // Write back
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log('✅ Fixed!');
} else {
  console.log('❌ Could not find the line');
}
