import { supabase } from '../lib/supabase';

/**
 * INSTANT DUPLICATE FIX
 * Runs IMMEDIATELY before app loads
 * No React components, no waiting
 */

export async function runInstantDuplicateFix() {
  try {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  ⚡ INSTANT DUPLICATE FIX - RUNNING NOW                          ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');

    // Get current organization from localStorage
    const orgData = localStorage.getItem('current_organization');
    if (!orgData) {
      console.log('⚠️ No organization found - skipping fix');
      return;
    }

    const org = JSON.parse(orgData);
    const organizationId = org.id;

    console.log(`🔍 Checking duplicates for organization: ${org.organization_name}`);

    // Fetch ALL loan products for this organization
    const { data: allProducts, error: fetchError } = await supabase
      .from('loan_products')
      .select('id, product_code, product_name, created_at')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Failed to fetch products:', fetchError);
      return;
    }

    if (!allProducts || allProducts.length === 0) {
      console.log('✅ No products found - nothing to fix');
      console.log('');
      return;
    }

    console.log(`📊 Found ${allProducts.length} product(s)`);

    // Group by product_code
    const codeMap = new Map<string, any[]>();
    allProducts.forEach(p => {
      const code = p.product_code;
      if (!codeMap.has(code)) codeMap.set(code, []);
      codeMap.get(code)!.push(p);
    });

    // Find and delete duplicates
    const toDelete: string[] = [];
    let duplicateCount = 0;

    codeMap.forEach((products, code) => {
      if (products.length > 1) {
        duplicateCount++;
        console.log(`\n⚠️ DUPLICATE: ${code} (${products.length} instances)`);

        // Sort by created_at DESC (newest first)
        products.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const keep = products[0];
        const remove = products.slice(1);

        console.log(`  ✅ KEEPING: "${keep.product_name}"`);
        remove.forEach(p => {
          console.log(`  ❌ DELETING: "${p.product_name}"`);
          toDelete.push(p.id);
        });
      }
    });

    if (toDelete.length === 0) {
      console.log('\n✅ NO DUPLICATES FOUND - DATABASE IS CLEAN!');
      console.log('');
      return;
    }

    // DELETE DUPLICATES
    console.log(`\n🗑️ DELETING ${toDelete.length} DUPLICATE(S)...`);

    const { error: deleteError } = await supabase
      .from('loan_products')
      .delete()
      .in('id', toDelete);

    if (deleteError) {
      console.error('❌ DELETE FAILED:', deleteError);
      return;
    }

    console.log(`✅ SUCCESSFULLY DELETED ${toDelete.length} DUPLICATE(S)!`);
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ FIX COMPLETE!                                                ║');
    console.log(`║  • Duplicate groups: ${duplicateCount}                                           ║`);
    console.log(`║  • Products deleted: ${toDelete.length}                                           ║`);
    console.log(`║  • Products remaining: ${allProducts.length - toDelete.length}                                         ║`);
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');

  } catch (error) {
    console.error('❌ INSTANT FIX ERROR:', error);
  }
}

// Run it immediately when this module loads
if (typeof window !== 'undefined') {
  console.log('⚡ Instant Duplicate Fix loaded - will run on next product creation');
}
