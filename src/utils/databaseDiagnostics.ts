/**
 * Database Diagnostics Utility
 * 
 * Provides helpful console commands to diagnose database connection issues.
 * 
 * Usage: Type `window.diagnoseDatabaseIssue()` in browser console
 */

import { supabase } from '../lib/supabase';

/**
 * Comprehensive database diagnostics
 * Checks connection, authentication, RLS, and tables
 */
export async function diagnoseDatabaseIssue() {
  console.clear();
  console.log('🔍 DATABASE DIAGNOSTICS STARTING...');
  console.log('═'.repeat(60));
  console.log('');

  // Step 1: Check Supabase configuration
  console.log('📋 STEP 1: Checking Supabase Configuration');
  console.log('─'.repeat(60));
  
  const config = {
    url: supabase['supabaseUrl'] || 'Not found',
    hasKey: !!supabase['supabaseKey'],
  };
  
  console.log('   Supabase URL:', config.url);
  console.log('   Has API Key:', config.hasKey ? '✅ Yes' : '❌ No');
  console.log('');

  // Step 2: Test basic connection
  console.log('📋 STEP 2: Testing Basic Connection');
  console.log('─'.repeat(60));
  
  try {
    const startTime = performance.now();
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    if (error) {
      console.log('   ❌ Connection FAILED');
      console.log('   Error Code:', error.code || 'Unknown');
      console.log('   Error Message:', error.message || 'Unknown');
      console.log('');
      
      // Diagnose the error
      diagnoseError(error);
    } else {
      console.log('   ✅ Connection SUCCESSFUL');
      console.log('   Response Time:', responseTime + 'ms');
      console.log('');
    }
  } catch (err: any) {
    console.log('   ❌ Connection EXCEPTION');
    console.log('   Error:', err.message || 'Unknown');
    console.log('');
    diagnoseError(err);
  }

  // Step 3: Check authentication
  console.log('📋 STEP 3: Checking Authentication');
  console.log('─'.repeat(60));
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('   ⚠️  Error getting session:', error.message);
    } else if (session) {
      console.log('   ✅ Authenticated via Supabase Auth');
      console.log('   User ID:', session.user.id);
      console.log('   User Email:', session.user.email || 'Not set');
      console.log('   Token Expires:', new Date(session.expires_at! * 1000).toLocaleString());
    } else {
      console.log('   ⚠️  No Supabase Auth session found');
      console.log('   This is normal if using localStorage-based auth');
      console.log('   However, RLS policies may block access without a session');
    }
  } catch (err: any) {
    console.log('   ⚠️  Could not check session:', err.message);
  }
  console.log('');

  // Step 4: Check localStorage auth
  console.log('📋 STEP 4: Checking localStorage Authentication');
  console.log('─'.repeat(60));
  
  const localUser = localStorage.getItem('bvfunguo_user');
  const localOrg = localStorage.getItem('current_organization');
  
  if (localUser) {
    try {
      const user = JSON.parse(localUser);
      console.log('   ✅ User found in localStorage');
      console.log('   Name:', user.name || 'Not set');
      console.log('   Email:', user.email || 'Not set');
      console.log('   Role:', user.role || 'Not set');
      console.log('   Organization ID:', user.organizationId || 'Not set');
    } catch {
      console.log('   ⚠️  User data in localStorage is corrupted');
    }
  } else {
    console.log('   ⚠️  No user found in localStorage');
  }
  
  if (localOrg) {
    try {
      const org = JSON.parse(localOrg);
      console.log('   ✅ Organization found in localStorage');
      console.log('   Name:', org.organization_name || 'Not set');
      console.log('   ID:', org.id || 'Not set');
    } catch {
      console.log('   ⚠️  Organization data in localStorage is corrupted');
    }
  } else {
    console.log('   ⚠️  No organization found in localStorage');
  }
  console.log('');

  // Step 5: Test table access
  console.log('📋 STEP 5: Testing Table Access');
  console.log('─'.repeat(60));
  
  const tablesToTest = [
    'organizations',
    'clients',
    'loans',
    'loan_products',
    'bank_accounts',
    'repayments'
  ];
  
  for (const table of tablesToTest) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.code || error.message}`);
      } else {
        console.log(`   ✅ ${table}: Accessible`);
      }
    } catch (err: any) {
      console.log(`   ❌ ${table}: ${err.message}`);
    }
  }
  console.log('');

  // Final summary and recommendations
  console.log('═'.repeat(60));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('═'.repeat(60));
  console.log('');
  console.log('Based on the tests above, here are the recommended actions:');
  console.log('');
  console.log('1️⃣  If you see connection errors with code 42501 or "permission denied":');
  console.log('   → RLS is blocking access');
  console.log('   → Run: /supabase/DISABLE_RLS_FOR_TESTING.sql');
  console.log('');
  console.log('2️⃣  If you see connection errors with code 42P01 or "does not exist":');
  console.log('   → Tables are missing');
  console.log('   → Run: /supabase/COMPLETE_DATABASE_SETUP.sql');
  console.log('');
  console.log('3️⃣  If you see "Failed to fetch" or "NetworkError":');
  console.log('   → Real network connectivity issue');
  console.log('   → Check internet connection and Supabase status');
  console.log('');
  console.log('4️⃣  If you see "JWT" or "PGRST301" errors:');
  console.log('   → Authentication issue');
  console.log('   → Set up proper Supabase Auth or disable RLS');
  console.log('');
  console.log('For detailed guidance, see:');
  console.log('   📖 /TROUBLESHOOTING_DATABASE_ERRORS.md');
  console.log('   📖 /FIX_DATABASE_NOT_REACHABLE_ERROR.md');
  console.log('');
  console.log('═'.repeat(60));
}

/**
 * Diagnose specific error types and provide actionable advice
 */
function diagnoseError(error: any) {
  const errorMessage = error?.message || '';
  const errorCode = error?.code || '';
  const errorDetails = error?.details || '';
  
  console.log('');
  console.log('🔍 ERROR DIAGNOSIS:');
  console.log('─'.repeat(60));
  
  // Network errors
  if (errorMessage.includes('Failed to fetch') || 
      errorMessage.includes('NetworkError') ||
      errorCode === 'ECONNREFUSED') {
    console.log('🌐 Issue Type: NETWORK ERROR');
    console.log('');
    console.log('Possible causes:');
    console.log('  • Internet connection is down');
    console.log('  • Supabase service is down (check status.supabase.com)');
    console.log('  • Firewall is blocking the connection');
    console.log('  • VPN or proxy interference');
    console.log('');
    console.log('Solutions:');
    console.log('  1. Check your internet connection');
    console.log('  2. Visit https://status.supabase.com/');
    console.log('  3. Try disabling VPN/proxy');
    console.log('  4. Check firewall settings');
    return;
  }
  
  // Table doesn't exist
  if (errorCode === '42P01' || 
      errorMessage.includes('does not exist') ||
      errorMessage.includes('relation') && errorMessage.includes('not found')) {
    console.log('📦 Issue Type: MISSING TABLE/SCHEMA');
    console.log('');
    console.log('The database table does not exist or schema is incorrect.');
    console.log('');
    console.log('Solutions:');
    console.log('  1. Go to Supabase Dashboard → SQL Editor');
    console.log('  2. Copy contents of /supabase/COMPLETE_DATABASE_SETUP.sql');
    console.log('  3. Paste and run in SQL Editor');
    console.log('  4. Refresh your app');
    return;
  }
  
  // Permission/RLS errors
  if (errorCode === '42501' || 
      errorMessage.includes('permission denied') ||
      errorMessage.includes('RLS') ||
      errorMessage.includes('row-level security')) {
    console.log('🔒 Issue Type: PERMISSION DENIED (RLS)');
    console.log('');
    console.log('Row Level Security is blocking access to the table.');
    console.log('');
    console.log('This happens because:');
    console.log('  • RLS is enabled on the table');
    console.log('  • You are not authenticated via Supabase Auth');
    console.log('  • Auto-login does not create a Supabase session');
    console.log('');
    console.log('Solutions:');
    console.log('  QUICK FIX (Testing):');
    console.log('    1. Go to Supabase Dashboard → SQL Editor');
    console.log('    2. Copy contents of /supabase/DISABLE_RLS_FOR_TESTING.sql');
    console.log('    3. Paste and run');
    console.log('    4. Refresh your app');
    console.log('');
    console.log('  PROPER FIX (Production):');
    console.log('    • Set up proper Supabase authentication');
    console.log('    • Use /supabase/ENABLE_RLS_WITH_POLICIES.sql');
    return;
  }
  
  // JWT/Auth errors
  if (errorCode === 'PGRST301' || 
      errorMessage.includes('JWT') ||
      errorMessage.includes('token') ||
      errorMessage.includes('authentication')) {
    console.log('🔐 Issue Type: AUTHENTICATION ERROR');
    console.log('');
    console.log('Supabase requires a valid JWT token but none was provided.');
    console.log('');
    console.log('This happens because:');
    console.log('  • RLS is enabled and requires authentication');
    console.log('  • No Supabase Auth session exists');
    console.log('  • localStorage auth does not create JWT tokens');
    console.log('');
    console.log('Solutions:');
    console.log('  1. Disable RLS (run /supabase/DISABLE_RLS_FOR_TESTING.sql)');
    console.log('  2. OR set up proper Supabase authentication');
    return;
  }
  
  // Unknown error
  console.log('❓ Issue Type: UNKNOWN ERROR');
  console.log('');
  console.log('Error details:');
  console.log('  Code:', errorCode || 'None');
  console.log('  Message:', errorMessage || 'None');
  console.log('  Details:', errorDetails || 'None');
  console.log('');
  console.log('Recommended actions:');
  console.log('  1. Check the full error in browser console');
  console.log('  2. See /TROUBLESHOOTING_DATABASE_ERRORS.md');
  console.log('  3. Check Supabase logs in dashboard');
}

/**
 * Quick test of specific table
 */
export async function testTable(tableName: string) {
  console.log(`🔍 Testing table: ${tableName}`);
  console.log('─'.repeat(60));
  
  try {
    // Test SELECT
    console.log('Testing SELECT...');
    const { data: selectData, error: selectError } = await supabase
      .from(tableName)
      .select('*')
      .limit(5);
    
    if (selectError) {
      console.log('  ❌ SELECT failed:', selectError.message);
      diagnoseError(selectError);
    } else {
      console.log('  ✅ SELECT works');
      console.log('  Records found:', selectData?.length || 0);
      if (selectData && selectData.length > 0) {
        console.log('  Sample record:', selectData[0]);
      }
    }
  } catch (err: any) {
    console.log('  ❌ Exception:', err.message);
    diagnoseError(err);
  }
}

// Make functions available globally for console use
if (typeof window !== 'undefined') {
  (window as any).diagnoseDatabaseIssue = diagnoseDatabaseIssue;
  (window as any).testTable = testTable;
  
  console.log('');
  console.log('🔧 Database Diagnostics Loaded');
  console.log('   Type: window.diagnoseDatabaseIssue()');
  console.log('   Or:   window.testTable("clients")');
  console.log('');
}
