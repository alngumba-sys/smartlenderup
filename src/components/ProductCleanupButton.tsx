import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

export function ProductCleanupButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const runCleanup = async () => {
    setIsLoading(true);
    setShowConfirm(false);

    try {
      // Get current user's organization
      const orgData = localStorage.getItem('currentUser');
      if (!orgData) {
        toast.error('No organization found');
        setIsLoading(false);
        return;
      }

      const org = JSON.parse(orgData);
      const organizationId = org.organizationId || org.id;

      console.log('🧹 Starting cleanup for organization:', organizationId);

      // Step 1: Get all products
      const { data: allProducts, error: fetchError } = await supabase
        .from('loan_products')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (!allProducts || allProducts.length === 0) {
        toast.success('No products found. Database is clean!');
        setIsLoading(false);
        return;
      }

      console.log(`📊 Found ${allProducts.length} products`);

      // Step 2: Find duplicates
      const codeMap = new Map<string, any[]>();
      allProducts.forEach(product => {
        const code = product.product_code;
        if (!codeMap.has(code)) {
          codeMap.set(code, []);
        }
        codeMap.get(code)!.push(product);
      });

      // Step 3: Identify products to delete
      const toDelete: string[] = [];
      let duplicateCount = 0;

      codeMap.forEach((products, code) => {
        if (products.length > 1) {
          duplicateCount++;
          // Sort by created_at (newest first)
          products.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          // Keep the first (newest), delete the rest
          const toRemove = products.slice(1);
          toRemove.forEach(p => toDelete.push(p.id));
        }
      });

      if (toDelete.length === 0) {
        toast.success('✅ No duplicates found! Database is clean.');
        console.log('✅ No duplicates found!');
        setIsLoading(false);
        return;
      }

      // Step 4: Delete duplicates
      console.log(`🗑️ Deleting ${toDelete.length} duplicate products...`);

      const { error: deleteError } = await supabase
        .from('loan_products')
        .delete()
        .in('id', toDelete);

      if (deleteError) throw deleteError;

      toast.success(
        `✅ Cleanup complete! Removed ${toDelete.length} duplicate${
          toDelete.length === 1 ? '' : 's'
        }`
      );

      console.log(`✅ Cleanup complete!`);
      console.log(`  • Duplicates removed: ${toDelete.length}`);
      console.log(`  • Remaining products: ${allProducts.length - toDelete.length}`);

      // Reload the page to refresh the product list
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      console.error('❌ Cleanup failed:', error);
      toast.error(`Cleanup failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
        disabled={isLoading}
      >
        🧹 Clean Duplicates
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
      <span className="text-sm text-orange-900">
        Remove duplicate product codes?
      </span>
      <button
        onClick={runCleanup}
        disabled={isLoading}
        className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50"
      >
        {isLoading ? 'Cleaning...' : 'Yes, Clean'}
      </button>
      <button
        onClick={() => setShowConfirm(false)}
        disabled={isLoading}
        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm font-medium"
      >
        Cancel
      </button>
    </div>
  );
}
