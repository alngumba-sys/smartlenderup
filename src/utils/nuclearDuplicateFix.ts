import { supabase } from '../lib/supabase';

/**
 * NUCLEAR OPTION: Delete ALL duplicates using SQL
 * This runs a single SQL query that removes duplicates in one shot
 */
export async function nuclearDuplicateFix(organizationId: string) {
  try {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💣 NUCLEAR DUPLICATE FIX - RUNNING NOW');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Use Supabase RPC to run custom SQL
    // This deletes ALL duplicates, keeping only the newest
    const { data, error } = await supabase.rpc('delete_duplicate_products', {
      org_id: organizationId
    });

    if (error) {
      // If RPC doesn't exist, fallback to manual deletion
      console.log('⚠️ RPC not found, using manual method...');
      await manualDuplicateRemoval(organizationId);
    } else {
      console.log('✅ Nuclear fix complete via RPC');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  } catch (error) {
    console.error('❌ Nuclear fix error:', error);
    // Fallback to manual
    await manualDuplicateRemoval(organizationId);
  }
}

async function manualDuplicateRemoval(organizationId: string) {
  console.log('🔧 Manual duplicate removal starting...');
  
  // Fetch all products
  const { data: products, error } = await supabase
    .from('loan_products')
    .select('id, product_code, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false }); // Newest first

  if (error || !products) {
    console.error('❌ Failed to fetch products:', error);
    return;
  }

  const seen = new Set<string>();
  const toDelete: string[] = [];

  // Keep first occurrence (newest), delete rest
  for (const product of products) {
    if (seen.has(product.product_code)) {
      toDelete.push(product.id);
    } else {
      seen.add(product.product_code);
    }
  }

  if (toDelete.length > 0) {
    console.log(`🗑️ Deleting ${toDelete.length} duplicate(s)...`);
    
    // Delete in batches of 100
    for (let i = 0; i < toDelete.length; i += 100) {
      const batch = toDelete.slice(i, i + 100);
      const { error: deleteError } = await supabase
        .from('loan_products')
        .delete()
        .in('id', batch);
      
      if (deleteError) {
        console.error('❌ Batch delete failed:', deleteError);
      } else {
        console.log(`✅ Deleted batch ${i / 100 + 1}`);
      }
    }
    
    console.log(`✅ DELETED ${toDelete.length} DUPLICATES!`);
  } else {
    console.log('✅ No duplicates found');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
