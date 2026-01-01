import { createClient } from '@supabase/supabase-js';

// 🔴 LIVE PRODUCTION SUPABASE ACCOUNT 🔴
// Project ID: yrsnylrcgejnrxphjvtf
const supabaseUrl = 'https://yrsnylrcgejnrxphjvtf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc255bHJjZ2VqbnJ4cGhqdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTAxNDIsImV4cCI6MjA4MjU4NjE0Mn0.RCcfK0ObcSCnwqW_bD7c4M7DSN_SCTPT6QK7LXi4R9o';

// ⚠️ WARNING: The key below is currently the ANON key (same as above)
// 🔑 TO FIX: Go to https://supabase.com/dashboard/project/yrsnylrcgejnrxphjvtf/settings/api
// Find the "service_role" key (different from anon key) and paste it here
// Service role key bypasses RLS and should ONLY be used in development
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc255bHJjZ2VqbnJ4cGhqdnRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAxMDE0MiwiZXhwIjoyMDgyNTg2MTQyfQ.LJMp22gqWi_LN82hzxMzN2hDfAlM6v9pbGbELXLc3HM';

// Determine which key to use
let supabaseKey = supabaseAnonKey;
let usingServiceKey = false;

if (supabaseServiceKey && supabaseServiceKey.length > 50) {
  supabaseKey = supabaseServiceKey;
  usingServiceKey = true;
  console.log('✅ Using Supabase SERVICE ROLE key');
  console.log('🔓 RLS is BYPASSED for development');
} else {
  console.error('❌ SERVICE ROLE KEY NOT PASTED!');
  console.error('   Step 1: Go to https://supabase.com/dashboard');
  console.error('   Step 2: Click Settings → API');
  console.error('   Step 3: Find "service_role" key and click eye icon');
  console.error('   Step 4: Click COPY button');
  console.error('   Step 5: In Figma Make, open /lib/supabase.ts');
  console.error('   Step 6: On line 9, paste your key BETWEEN THE QUOTES');
  console.error('   Step 7: It should look like: const supabaseServiceKey = \'eyJhbG...very long key...\'');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});