/**
 * One-click cleanup for duplicate product codes
 * This will remove all duplicates and reset numbering
 */

import { supabase } from '../lib/supabase';

export async function cleanupDuplicateProducts(organizationId: string) {
  console.log('🧹 Starting duplicate product cleanup...\n');
  
  try {
    // Step 1: Get all products for this organization
    const { data: allProducts, error: fetchError } = await supabase
      .from('loan_products')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });
    
    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError);
      throw fetchError;
    }
    
    if (!allProducts || allProducts.length === 0) {
      console.log('✅ No products found. Database is clean.');
      return { success: true, cleaned: 0 };
    }
    
    console.log(`📊 Found ${allProducts.length} products\n`);
    
    // Step 2: Group by product_code to find duplicates
    const codeMap = new Map<string, any[]>();
    allProducts.forEach(product => {
      const code = product.product_code;
      if (!codeMap.has(code)) {
        codeMap.set(code, []);
      }
      codeMap.get(code)!.push(product);
    });
    
    // Step 3: Find and remove duplicates (keep newest)
    const toDelete: string[] = [];
    let duplicateCount = 0;
    
    codeMap.forEach((products, code) => {
      if (products.length > 1) {
        duplicateCount++;
        console.log(`⚠️ Found duplicate code: ${code} (${products.length} instances)`);
        
        // Sort by created_at (newest first)
        products.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Keep the first (newest), delete the rest
        const toKeep = products[0];
        const toRemove = products.slice(1);
        
        console.log(`   ✅ Keeping: ${toKeep.product_name} (${toKeep.id.substring(0, 8)}...)`);
        toRemove.forEach(p => {
          console.log(`   ❌ Deleting: ${p.product_name} (${p.id.substring(0, 8)}...)`);
          toDelete.push(p.id);
        });
        console.log('');
      }
    });
    
    // Step 4: Delete duplicates
    if (toDelete.length > 0) {
      console.log(`🗑️ Deleting ${toDelete.length} duplicate products...\n`);
      
      const { error: deleteError } = await supabase
        .from('loan_products')
        .delete()
        .in('id', toDelete);
      
      if (deleteError) {
        console.error('❌ Error deleting duplicates:', deleteError);
        throw deleteError;
      }
      
      console.log(`✅ Deleted ${toDelete.length} duplicate products\n`);
    } else {
      console.log('✅ No duplicates found!\n');
    }
    
    // Step 5: Get organization prefix
    const { data: orgData } = await supabase
      .from('organizations')
      .select('organization_code, organization_name')
      .eq('id', organizationId)
      .maybeSingle();
    
    const orgPrefix = orgData?.organization_code?.toUpperCase() || 
                     orgData?.organization_name?.substring(0, 3)?.toUpperCase() || 
                     'ORG';
    
    // Step 6: Check for products with non-standard codes
    const { data: remainingProducts } = await supabase
      .from('loan_products')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });
    
    if (remainingProducts) {
      const nonStandardCodes: any[] = [];
      const standardPattern = new RegExp(`^${orgPrefix}-PROD\\d+$`);
      
      remainingProducts.forEach(product => {
        if (!standardPattern.test(product.product_code)) {
          nonStandardCodes.push(product);
        }
      });
      
      if (nonStandardCodes.length > 0) {
        console.log(`⚠️ Found ${nonStandardCodes.length} products with non-standard codes:\n`);
        nonStandardCodes.forEach(p => {
          console.log(`   ${p.product_code} - ${p.product_name}`);
        });
        console.log('\n💡 Tip: These codes work fine but are not sequential.\n');
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ CLEANUP COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Results:`);
    console.log(`  • Duplicates removed: ${toDelete.length}`);
    console.log(`  • Remaining products: ${(remainingProducts?.length || 0)}`);
    console.log(`  • Organization prefix: ${orgPrefix}`);
    console.log('\n✅ You can now create products without errors!\n');
    
    return {
      success: true,
      cleaned: toDelete.length,
      remaining: remainingProducts?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}

// Make it available in browser console
if (typeof window !== 'undefined') {
  (window as any).cleanupDuplicateProducts = cleanupDuplicateProducts;
}
