// 🔴 MOCK MODULE - BLOCKS ALL @supabase/* IMPORTS 🔴
// This file is used by Vite aliases to intercept ANY import from @supabase packages

console.warn('⚠️ BLOCKED: Attempted to import from @supabase package - using mock instead');

// Mock createClient function (in case any code tries to use it)
export function createClient() {
  console.warn('⚠️ MOCK: createClient called - returning mock client');
  return {
    auth: {
      signUp: async () => ({ data: null, error: null }),
      signInWithPassword: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null })
    })
  };
}

// Export everything as empty to prevent errors
export default createClient;
export const SupabaseClient = createClient;
export const AuthClient = createClient;
