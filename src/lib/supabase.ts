import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yrsnylrcgejnrxphjvtf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc255bHJjZ2VqbnJ4cGhqdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTAxNDIsImV4cCI6MjA4MjU4NjE0Mn0.RCcfK0ObcSCnwqW_bD7c4M7DSN_SCTPT6QK7LXi4R9o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'bv-funguo-microfinance',
    },
  },
});

// Helper functions
export const isPreviewEnvironment = () => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         hostname.includes('.local') ||
         hostname.includes('preview') ||
         hostname.includes('figma.dev');
};

export const isSupabaseAvailable = () => true;
export const isSupabaseCheckComplete = () => true;

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);
    
    if (error) {
      // Silently skip if RLS is blocking access
      const isRLSError = error.code === '42501' || 
                        error.code === 42501 ||
                        error.message?.includes('permission denied');
      
      if (isRLSError) {
        console.log('ℹ️ RLS enabled - Supabase connection available but queries restricted');
        return true; // Connection works, just RLS is enabled
      }
      
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Supabase connection test error:', err);
    return false;
  }
}

// ❌ REMOVED: Auto-test on load causes "send before connect" error
// Connection will be tested lazily when first operation is performed
if (typeof window !== 'undefined') {
  console.log('🚀 Supabase client initialized (connection will be established on first use)');
}