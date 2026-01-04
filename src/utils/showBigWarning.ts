// Show a big, impossible-to-miss warning in the console

const redBg = 'background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;';
const greenBg = 'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;';
const yellowBg = 'background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;';
const blueBg = 'background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;';

console.log('\n\n');
console.log('%c ⚠️  DATABASE ERROR - ACTION REQUIRED ⚠️ ', redBg);
console.log('\n');
console.log('%c ❌ Missing Column ', redBg);
console.log('   pricing_config.trial_days');
console.log('\n');
console.log('%c ✅ EASY FIX - 4 STEPS ', greenBg);
console.log('\n');
console.log('%c 1 ', blueBg, ' Open Supabase: https://supabase.com/dashboard');
console.log('%c 2 ', blueBg, ' Go to SQL Editor → New Query');
console.log('%c 3 ', blueBg, ' Copy ALL code from: /RUN-THIS-IN-SUPABASE.sql ⭐⭐⭐');
console.log('%c 4 ', blueBg, ' Paste, click RUN, then refresh (Ctrl+Shift+R)');
console.log('\n');
console.log('%c 💡 A popup will guide you through the process! ', yellowBg);
console.log('\n');
console.log('%c 📚 Need help? Read: /DATABASE-FIX-README.md ', blueBg);
console.log('\n\n');

export {};