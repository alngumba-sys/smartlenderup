/**
 * ============================================
 * SUPABASE SCHEMA VALIDATOR
 * ============================================
 * Validates that Supabase tables match our schema
 * Helps catch schema mismatches early
 */

import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

/**
 * Validate Supabase connection and configuration
 */
export async function validateSupabaseConnection(): Promise<boolean> {
  try {
    console.log('🔍 Validating Supabase connection...');
    
    // Test 1: Check if supabase client is initialized
    if (!supabase) {
      console.error('❌ Supabase client not initialized');
      toast.error('Database configuration error');
      return false;
    }
    
    // Test 2: Test basic connectivity with a simple query
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      
      // Check for specific error types
      if (error.code === '42501') {
        console.error('   RLS Error: Row Level Security not configured properly');
        toast.error('Database permission error. Contact administrator.');
      } else if (error.message?.includes('Failed to fetch')) {
        console.error('   Network Error: Cannot reach Supabase');
        toast.error('Database not reachable. Check your internet connection.');
      } else {
        console.error('   Unknown Error:', error.message);
        toast.error('Database error. Please try again.');
      }
      
      return false;
    }
    
    console.log('✅ Supabase connection validated successfully');
    return true;
    
  } catch (error: any) {
    console.error('❌ Exception validating Supabase connection:', error);
    
    if (error.message?.includes('fetch')) {
      toast.error('Database not reachable. Check your internet connection.');
    } else {
      toast.error('Database connection error');
    }
    
    return false;
  }
}

/**
 * Ensure organization exists in Supabase
 * NO localStorage fallback - MUST be in database
 */
export async function validateOrganization(organizationId: string): Promise<boolean> {
  try {
    console.log(`🔍 Validating organization: ${organizationId}`);
    
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .maybeSingle();
    
    if (error) {
      console.error('❌ Error validating organization:', error);
      toast.error('Database not reachable. Check your internet connection.');
      return false;
    }
    
    if (!data) {
      console.error('❌ Organization not found in database');
      toast.error('Organization not found. Please register.');
      return false;
    }
    
    console.log('✅ Organization validated:', data.organization_name);
    return true;
    
  } catch (error) {
    console.error('❌ Exception validating organization:', error);
    toast.error('Database not reachable. Check your internet connection.');
    return false;
  }
}

/**
 * Test CRUD operations on Supabase
 * For development/debugging purposes
 */
export async function testSupabaseCRUD(organizationId: string): Promise<void> {
  console.log('🧪 Testing Supabase CRUD operations...');
  
  try {
    // Test CREATE
    console.log('1️⃣ Testing CREATE...');
    const testClient = {
      id: crypto.randomUUID(),
      organization_id: organizationId,
      client_number: 'TEST-001',
      first_name: 'Test',
      last_name: 'User',
      name: 'Test User',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: created, error: createError } = await supabase
      .from('clients')
      .insert([testClient])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ CREATE failed:', createError);
      toast.error('Database CREATE test failed');
      return;
    }
    
    console.log('✅ CREATE successful');
    
    // Test READ
    console.log('2️⃣ Testing READ...');
    const { data: read, error: readError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', testClient.id)
      .single();
    
    if (readError) {
      console.error('❌ READ failed:', readError);
      toast.error('Database READ test failed');
      return;
    }
    
    console.log('✅ READ successful');
    
    // Test UPDATE
    console.log('3️⃣ Testing UPDATE...');
    const { error: updateError } = await supabase
      .from('clients')
      .update({ first_name: 'Updated' })
      .eq('id', testClient.id);
    
    if (updateError) {
      console.error('❌ UPDATE failed:', updateError);
      toast.error('Database UPDATE test failed');
      return;
    }
    
    console.log('✅ UPDATE successful');
    
    // Test DELETE
    console.log('4️⃣ Testing DELETE...');
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', testClient.id);
    
    if (deleteError) {
      console.error('❌ DELETE failed:', deleteError);
      toast.error('Database DELETE test failed');
      return;
    }
    
    console.log('✅ DELETE successful');
    console.log('🎉 All CRUD operations successful!');
    toast.success('Database connection fully validated');
    
  } catch (error) {
    console.error('❌ CRUD test exception:', error);
    toast.error('Database not reachable. Check your internet connection.');
  }
}

/**
 * Check if offline (no internet connection)
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Show offline error message
 */
export function showOfflineError(): void {
  toast.error('Database not reachable. Check your internet connection.');
  console.error('❌ Cannot perform operation: No internet connection');
}

// Register global test functions
if (typeof window !== 'undefined') {
  (window as any).validateSupabase = validateSupabaseConnection;
  (window as any).testSupabaseCRUD = testSupabaseCRUD;
  (window as any).validateOrg = validateOrganization;
  
  console.log('✅ Supabase Validator loaded');
  console.log('💡 Test connection: window.validateSupabase()');
  console.log('💡 Test CRUD: window.testSupabaseCRUD("your-org-id")');
  console.log('💡 Validate org: window.validateOrg("your-org-id")');
}