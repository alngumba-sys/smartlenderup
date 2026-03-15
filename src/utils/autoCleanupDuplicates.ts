/**
 * Auto-cleanup duplicate product codes on app initialization
 * Runs silently in the background to prevent duplicate key errors
 */

import { supabase } from '../lib/supabase';

export async function autoCleanupDuplicateProducts(organizationId: string): Promise<void> {
  if (!organizationId) return;
  
  try {
    console.log('🧹 [Auto-Cleanup] Checking for duplicate product codes...');
    
    // Get all products for this organization
    const { data: allProducts, error: fetchError } = await supabase
      .from('loan_products')
      .select('id, product_code, product_name, created_at')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });
    
    if (fetchError) {
      // Silently skip if RLS is enabled
      if (fetchError.code !== '42501') {
        console.warn('⚠️ [Auto-Cleanup] Failed to fetch products:', fetchError);
      }
      return;
    }
    
    if (!allProducts || allProducts.length === 0) {
      console.log('✅ [Auto-Cleanup] No products found');
      return;
    }
    
    // Group by product_code to find duplicates
    const codeMap = new Map<string, any[]>();
    allProducts.forEach(product => {
      const code = product.product_code;
      if (!codeMap.has(code)) {
        codeMap.set(code, []);
      }
      codeMap.get(code)!.push(product);
    });
    
    // Find products to delete (keep newest for each duplicate)
    const toDelete: string[] = [];
    let duplicateCount = 0;
    
    codeMap.forEach((products, code) => {
      if (products.length > 1) {
        duplicateCount++;
        console.log(`⚠️ [Auto-Cleanup] Found duplicate code: ${code} (${products.length} instances)`);
        
        // Sort by created_at (newest first)
        products.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Keep the first (newest), mark rest for deletion
        const toRemove = products.slice(1);
        toRemove.forEach(p => {
          console.log(`  🗑️ Marking for deletion: ${p.product_name} (${p.id.substring(0, 8)}...)`);
          toDelete.push(p.id);
        });
      }
    });
    
    // Delete duplicates if found
    if (toDelete.length > 0) {
      console.log(`🗑️ [Auto-Cleanup] Deleting ${toDelete.length} duplicate product(s)...`);
      
      const { error: deleteError } = await supabase
        .from('loan_products')
        .delete()
        .in('id', toDelete);
      
      if (deleteError) {
        console.error('❌ [Auto-Cleanup] Failed to delete duplicates:', deleteError);
        return;
      }
      
      console.log(`✅ [Auto-Cleanup] Successfully cleaned ${toDelete.length} duplicate(s)`);
      console.log(`✅ [Auto-Cleanup] Database is now clean. Remaining products: ${allProducts.length - toDelete.length}`);
    } else {
      console.log('✅ [Auto-Cleanup] No duplicate product codes found. Database is clean.');
    }
    
  } catch (error) {
    // Silent fail - don't block app initialization
    console.warn('⚠️ [Auto-Cleanup] Error during cleanup (non-critical):', error);
  }
}

/**
 * Check if duplicates exist without cleaning them
 */
export async function checkForDuplicates(organizationId: string): Promise<number> {
  if (!organizationId) return 0;
  
  try {
    const { data: allProducts } = await supabase
      .from('loan_products')
      .select('product_code')
      .eq('organization_id', organizationId);
    
    if (!allProducts) return 0;
    
    const codeMap = new Map<string, number>();
    allProducts.forEach(p => {
      const code = p.product_code;
      codeMap.set(code, (codeMap.get(code) || 0) + 1);
    });
    
    let duplicateCount = 0;
    codeMap.forEach(count => {
      if (count > 1) duplicateCount += (count - 1);
    });
    
    return duplicateCount;
    
  } catch (error) {
    console.warn('⚠️ Failed to check for duplicates:', error);
    return 0;
  }
}
