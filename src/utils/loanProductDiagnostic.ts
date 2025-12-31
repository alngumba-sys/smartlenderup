import { supabase } from '../lib/supabase';

/**
 * Diagnostic utility for loan product persistence issues
 * Run this to check the health of loan product sync
 */
export const runLoanProductDiagnostic = async () => {
  console.log('\n🔍 ========== LOAN PRODUCT DIAGNOSTIC ==========\n');
  
  const results = {
    organizationCheck: false,
    supabaseConnection: false,
    tableAccess: false,
    productCount: 0,
    errors: [] as string[],
  };
  
  try {
    // 1. Check organization
    console.log('1️⃣ Checking organization...');
    const orgData = localStorage.getItem('current_organization');
    if (!orgData) {
      results.errors.push('No organization found in localStorage');
      console.error('   ❌ No organization set');
    } else {
      const org = JSON.parse(orgData);
      if (!org.id) {
        results.errors.push('Organization has no ID');
        console.error('   ❌ Organization missing ID');
      } else {
        results.organizationCheck = true;
        console.log(`   ✅ Organization: ${org.name} (${org.id})`);
        
        // 2. Check Supabase connection
        console.log('\n2️⃣ Checking Supabase connection...');
        const { data: authData, error: authError } = await supabase.auth.getSession();
        if (authError) {
          results.errors.push(`Supabase auth error: ${authError.message}`);
          console.error('   ❌ Auth error:', authError);
        } else {
          results.supabaseConnection = true;
          console.log('   ✅ Supabase connected');
          console.log('   Session:', authData.session ? 'Active' : 'Anonymous');
        }
        
        // 3. Check table access
        console.log('\n3️⃣ Checking loan_products table access...');
        const { data: products, error: tableError } = await supabase
          .from('loan_products')
          .select('id, name, status, organization_id')
          .eq('organization_id', org.id);
        
        if (tableError) {
          results.errors.push(`Table access error: ${tableError.message}`);
          console.error('   ❌ Table error:', tableError);
        } else {
          results.tableAccess = true;
          results.productCount = products?.length || 0;
          console.log(`   ✅ Table accessible`);
          console.log(`   ✅ Found ${results.productCount} products`);
          
          if (products && products.length > 0) {
            console.log('\n   Products:');
            products.forEach((p, i) => {
              console.log(`   ${i + 1}. ${p.name} (${p.id}) - ${p.status}`);
            });
          }
        }
        
        // 4. Test write permission
        console.log('\n4️⃣ Testing write permissions...');
        const testId = `DIAG_TEST_${Date.now()}`;
        const testProduct = {
          id: testId,
          organization_id: org.id,
          name: '🧪 Diagnostic Test Product (safe to delete)',
          description: 'Created by diagnostic tool - will be auto-deleted',
          min_amount: 1000,
          max_amount: 50000,
          min_term: 1,
          max_term: 12,
          interest_rate: 10,
          processing_fee_percentage: 0,
          guarantor_required: false,
          collateral_required: false,
          status: 'Active',
          created_at: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString().split('T')[0],
        };
        
        const { error: insertError } = await supabase
          .from('loan_products')
          .insert(testProduct);
        
        if (insertError) {
          results.errors.push(`Write permission denied: ${insertError.message}`);
          console.error('   ❌ Cannot insert:', insertError);
        } else {
          console.log('   ✅ Write permission OK');
          
          // Clean up test product
          const { error: deleteError } = await supabase
            .from('loan_products')
            .delete()
            .eq('id', testId);
          
          if (deleteError) {
            console.warn('   ⚠️ Test product created but could not be deleted:', testId);
          } else {
            console.log('   ✅ Test product cleaned up');
          }
        }
      }
    }
  } catch (error) {
    results.errors.push(`Unexpected error: ${error}`);
    console.error('\n❌ Diagnostic failed with error:', error);
  }
  
  // Summary
  console.log('\n📊 ========== DIAGNOSTIC SUMMARY ==========\n');
  console.log(`Organization Check: ${results.organizationCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Supabase Connection: ${results.supabaseConnection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Table Access: ${results.tableAccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Current Products: ${results.productCount}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors Found:');
    results.errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
  } else {
    console.log('\n✅ All checks passed! Loan products should work correctly.');
  }
  
  console.log('\n===========================================\n');
  
  return results;
};

/**
 * Quick health check - returns true if everything is OK
 */
export const quickHealthCheck = async (): Promise<boolean> => {
  try {
    const orgData = localStorage.getItem('current_organization');
    if (!orgData) return false;
    
    const org = JSON.parse(orgData);
    if (!org.id) return false;
    
    const { error } = await supabase
      .from('loan_products')
      .select('id')
      .eq('organization_id', org.id)
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
};
