import { rmSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const supabasePath = join(rootDir, 'node_modules', '@supabase');

console.log('🔍 Checking for @supabase packages...');

if (existsSync(supabasePath)) {
  console.log('🔴 FOUND @supabase - Deleting to prevent WebAssembly errors...');
  try {
    rmSync(supabasePath, { recursive: true, force: true });
    console.log('✅ Successfully deleted @supabase packages');
    console.log('✅ Using mock Supabase client from /lib/supabase.ts instead');
  } catch (err) {
    console.error('❌ Error deleting @supabase:', err.message);
  }
} else {
  console.log('✅ No @supabase packages found - all clean!');
}
