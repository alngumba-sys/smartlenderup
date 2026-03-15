import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { Zap } from 'lucide-react';

export function InstantFixButton() {
  const [isRunning, setIsRunning] = useState(false);

  const runInstantFix = async () => {
    setIsRunning(true);
    
    try {
      console.log('⚡ INSTANT FIX: Starting...\n');
      
      // Get current organization
      const orgData = localStorage.getItem('currentUser');
      if (!orgData) {
        toast.error('No organization found');
        return;
      }
      const org = JSON.parse(orgData);
      const organizationId = org.organizationId || org.id;

      // Step 1: Find duplicates
      console.log('Step 1: Finding duplicates...');
      const { data: allProducts, error: fetchError } = await supabase
        .from('loan_products')
        .select('id, product_code, product_name, created_at')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (!allProducts || allProducts.length === 0) {
        toast.success('No products found!');
        console.log('✅ No products to clean');
        return;
      }

      // Step 2: Group by code
      const codeMap = new Map<string, any[]>();
      allProducts.forEach(product => {
        const code = product.product_code;
        if (!codeMap.has(code)) {
          codeMap.set(code, []);
        }
        codeMap.get(code)!.push(product);
      });

      // Step 3: Find duplicates
      const toDelete: string[] = [];
      let duplicateGroups = 0;

      codeMap.forEach((products, code) => {
        if (products.length > 1) {
          duplicateGroups++;
          // Silent: duplicate code found
          
          // Sort by created_at DESC (newest first)
          products.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          // Keep first (newest), delete rest
          const toKeep = products[0];
          const toRemove = products.slice(1);

          console.log(`  ✅ KEEP: ${toKeep.product_name} (created: ${toKeep.created_at})`);
          toRemove.forEach(p => {
            console.log(`  ❌ DELETE: ${p.product_name} (created: ${p.created_at})`);
            toDelete.push(p.id);
          });
        }
      });

      if (toDelete.length === 0) {
        toast.success('✅ No duplicates found! Database is clean.');
        console.log('\n✅ INSTANT FIX: No duplicates found!\n');
        return;
      }

      // Step 4: Delete duplicates
      console.log(`\n🗑️ Deleting ${toDelete.length} duplicate product(s)...\n`);

      const { error: deleteError } = await supabase
        .from('loan_products')
        .delete()
        .in('id', toDelete);

      if (deleteError) throw deleteError;

      // Success!
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ INSTANT FIX COMPLETE!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Results:`);
      console.log(`  • Duplicate groups found: ${duplicateGroups}`);
      console.log(`  • Products deleted: ${toDelete.length}`);
      console.log(`  • Products remaining: ${allProducts.length - toDelete.length}`);
      console.log('\n✅ You can now create products without warnings!\n');

      toast.success(
        `✅ Fixed! Removed ${toDelete.length} duplicate${toDelete.length === 1 ? '' : 's'}`,
        { duration: 5000 }
      );

      // Reload after 1.5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      console.error('❌ INSTANT FIX FAILED:', error);
      toast.error(`Fix failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <button
      onClick={runInstantFix}
      disabled={isRunning}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title="Instantly remove all duplicate product codes"
    >
      <Zap className="size-4" />
      {isRunning ? 'Fixing...' : '⚡ Instant Fix'}
    </button>
  );
}