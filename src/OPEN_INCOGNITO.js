const { exec } = require('child_process');
const os = require('os');

console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║                                                                  ║');
console.log('║           🚀 OPENING APP IN INCOGNITO MODE                       ║');
console.log('║                                                                  ║');
console.log('║           This BYPASSES all browser cache issues!               ║');
console.log('║                                                                  ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

const platform = os.platform();
const url = 'http://localhost:5174';

let command;

if (platform === 'win32') {
  // Windows - try multiple browsers
  command = `start chrome --incognito "${url}" || start msedge --inprivate "${url}" || start firefox -private-window "${url}"`;
} else if (platform === 'darwin') {
  // macOS
  command = `open -na "Google Chrome" --args --incognito "${url}" || open -na "Safari" --args -private "${url}" || open -na "Firefox" --args -private-window "${url}"`;
} else {
  // Linux
  command = `google-chrome --incognito "${url}" || chromium --incognito "${url}" || firefox --private-window "${url}"`;
}

console.log('📋 INSTRUCTIONS:\n');
console.log('1. Make sure the dev server is running');
console.log('   Run this in another terminal: npm run dev\n');
console.log('2. Opening incognito window now...\n');

exec(command, (error) => {
  if (error) {
    console.log('⚠️  Could not auto-open browser.\n');
    console.log('📝 MANUAL INSTRUCTIONS:\n');
    console.log('1. Open your browser');
    console.log('2. Press Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)');
    console.log('3. Go to: http://localhost:5174\n');
    console.log('✅ This will work 100% because incognito has NO cache!\n');
  } else {
    console.log('✅ Incognito window opened!\n');
    console.log('If it didn\'t open automatically:');
    console.log('  1. Press Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)');
    console.log('  2. Go to: http://localhost:5174\n');
  }
});
