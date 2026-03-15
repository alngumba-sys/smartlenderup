/**
 * Diagnostic utility to check for duplicate product codes in Supabase
 * Run this from browser console to identify duplicate issues
 */

import { supabase } from '../lib/supabase';

export async function checkDuplicateProducts(organizationId?: string) {
  console.log('🔍 Checking for duplicate product codes...\n');
  
  try {
    // Query all products
    let query = supabase
      .from('loan_products')
      .select('id, product_code, product_name, organization_id, created_at');
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    
    const { data: products, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }
    
    if (!products || products.length === 0) {
      console.log('ℹ️ No products found');
      return;
    }
    
    console.log(`📊 Total products: ${products.length}\n`);
    
    // Group by product_code
    const codeMap = new Map<string, any[]>();
    
    products.forEach(product => {
      const code = product.product_code;
      if (!codeMap.has(code)) {
        codeMap.set(code, []);
      }
      codeMap.get(code)!.push(product);
    });
    
    // Find duplicates
    const duplicates: any[] = [];
    codeMap.forEach((productList, code) => {
      if (productList.length > 1) {
        duplicates.push({
          code,
          count: productList.length,
          products: productList
        });
      }
    });
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate product codes found!');
      console.log('\nAll product codes are unique. The system is healthy.\n');
      return;
    }
    
    // Report duplicates
    console.log(`⚠️ Found ${duplicates.length} duplicate product codes:\n`);
    
    duplicates.forEach(dup => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Code: ${dup.code} (${dup.count} duplicates)`);
      console.log(`Products:`);
      dup.products.forEach((p: any, i: number) => {
        console.log(`  ${i + 1}. ${p.product_name}`);
        console.log(`     ID: ${p.id}`);
        console.log(`     Created: ${p.created_at}`);
        console.log(`     Org ID: ${p.organization_id.substring(0, 8)}...`);
      });
      console.log('');
    });
    
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    // Provide cleanup suggestions
    console.log('🔧 RECOMMENDED ACTIONS:\n');
    console.log('1. Run the SQL cleanup script in Supabase:');
    console.log('   - Open Supabase SQL Editor');
    console.log('   - Copy contents from /CLEANUP_DUPLICATE_PRODUCTS.sql');
    console.log('   - Run Step 3 to keep newest and delete old duplicates\n');
    console.log('2. Or manually delete duplicates:');
    duplicates.forEach(dup => {
      // Suggest keeping the newest one
      const sorted = dup.products.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const toKeep = sorted[0];
      const toDelete = sorted.slice(1);
      
      console.log(`\n   For code "${dup.code}":`);
      console.log(`   KEEP: ${toKeep.id} (${toKeep.product_name}, created ${toKeep.created_at})`);
      toDelete.forEach((p: any) => {
        console.log(`   DELETE: ${p.id} (${p.product_name}, created ${p.created_at})`);
      });
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return duplicates;
    
  } catch (error) {
    console.error('❌ Error during duplicate check:', error);
  }
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  (window as any).checkDuplicateProducts = checkDuplicateProducts;
  console.log('✅ Diagnostic tool loaded! Run: checkDuplicateProducts()');
}
