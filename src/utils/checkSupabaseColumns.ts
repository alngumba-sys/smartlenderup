/**
 * Check Supabase Columns - Diagnostic Tool
 * 
 * Run this in browser console to see what columns actually exist
 */

import { supabase } from '../lib/supabase';

export async function checkSupabaseColumns() {
  console.log('🔍 CHECKING SUPABASE TABLE STRUCTURE...\n');
  
  // Check clients table
  console.log('📋 CLIENTS TABLE:');
  const { data: clients, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .limit(1);
  
  if (clientError) {
    console.error('❌ Error querying clients:', clientError);
  } else if (clients && clients.length > 0) {
    const columns = Object.keys(clients[0]);
    console.log(`✅ Found ${columns.length} columns:`, columns);
    console.log('\nSample data:', clients[0]);
  } else {
    console.log('⚠️  No clients exist yet. Trying to query table structure...');
    
    // Try inserting a test record to see what columns are expected
    const testClient = {};
    const { error: insertError } = await supabase
      .from('clients')
      .insert([testClient])
      .select();
    
    if (insertError) {
      console.log('ℹ️  Insert error (this helps us see required columns):');
      console.log(insertError);
    }
  }
  
  console.log('\n---\n');
  
  // Check loan_products table
  console.log('📋 LOAN_PRODUCTS TABLE:');
  const { data: products, error: productError } = await supabase
    .from('loan_products')
    .select('*')
    .limit(1);
  
  if (productError) {
    console.error('❌ Error querying loan_products:', productError);
  } else if (products && products.length > 0) {
    const columns = Object.keys(products[0]);
    console.log(`✅ Found ${columns.length} columns:`, columns);
  } else {
    console.log('⚠️  No loan products exist yet');
  }
  
  console.log('\n---\n');
  
  // Check loans table
  console.log('📋 LOANS TABLE:');
  const { data: loans, error: loanError } = await supabase
    .from('loans')
    .select('*')
    .limit(1);
  
  if (loanError) {
    console.error('❌ Error querying loans:', loanError);
  } else if (loans && loans.length > 0) {
    const columns = Object.keys(loans[0]);
    console.log(`✅ Found ${columns.length} columns:`, columns);
  } else {
    console.log('⚠️  No loans exist yet');
  }
  
  console.log('\n\n✅ DIAGNOSTIC COMPLETE');
  console.log('📝 Please share all the output above!');
}

// Register globally
if (typeof window !== 'undefined') {
  (window as any).checkSupabaseColumns = checkSupabaseColumns;
  console.log('🔍 Run this in console: checkSupabaseColumns()');
}
