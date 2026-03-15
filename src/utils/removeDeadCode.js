/**
 * Remove dead code lines from supabaseDataService.ts
 * This script removes lines 809-812 which contain unreachable code
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../services/supabaseDataService.ts');

// Read the file
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Remove lines 809-812 (array is 0-indexed, so 808-811)
const linesToRemove = [808, 809, 810, 811]; // 0-indexed

const newLines = lines.filter((line, index) => !linesToRemove.includes(index));

// Write back
fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');

console.log('✅ Dead code removed from lines 809-812');
