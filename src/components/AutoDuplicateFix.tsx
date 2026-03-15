import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * AUTOMATIC DUPLICATE FIX
 * Runs cleanup IMMEDIATELY on app load
 * No user interaction required
 */
export function AutoDuplicateFix() {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');

  useEffect(() => {
    const runAutoFix = async () => {
      if (!currentUser?.organizationId || status !== 'idle') return;
      
      setStatus('running');
      
      // Dispatch start event
      window.dispatchEvent(new CustomEvent('autofix:start'));
      
      try {
        // Silent auto-fix running in background
        
        const organizationId = currentUser.organizationId;
        
        // Fetch ALL products
        const { data: allProducts, error: fetchError } = await supabase
          .from('loan_products')
          .select('id, product_code, product_name, created_at')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: true });
        
        if (fetchError) {
          // Silent: fetch error
          window.dispatchEvent(new CustomEvent('autofix:error'));
          setStatus('done');
          return;
        }
        
        if (!allProducts || allProducts.length === 0) {
          // Silent: no products
          window.dispatchEvent(new CustomEvent('autofix:complete', { 
            detail: { deletedCount: 0 } 
          }));
          setStatus('done');
          return;
        }
        
        // Silent: processing products
        
        // Group by product_code
        const codeMap = new Map<string, any[]>();
        allProducts.forEach(p => {
          const code = p.product_code;
          if (!codeMap.has(code)) codeMap.set(code, []);
          codeMap.get(code)!.push(p);
        });
        
        // Find duplicates
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
            
            const keep = products[0];
            const remove = products.slice(1);
            
            // Silent: keeping newest, deleting older duplicates
            remove.forEach(p => {
              toDelete.push(p.id);
            });
          }
        });
        
        if (toDelete.length === 0) {
          // Silent: no duplicates found
          window.dispatchEvent(new CustomEvent('autofix:complete', { 
            detail: { deletedCount: 0 } 
          }));
          setStatus('done');
          return;
        }
        
        // DELETE DUPLICATES
        // Silent: deleting duplicates
        
        const { error: deleteError } = await supabase
          .from('loan_products')
          .delete()
          .in('id', toDelete);
        
        if (deleteError) {
          // Silent: delete failed
          window.dispatchEvent(new CustomEvent('autofix:error'));
          setStatus('done');
          return;
        }
        
        // Silent: duplicates deleted successfully
        
        // Dispatch complete event
        window.dispatchEvent(new CustomEvent('autofix:complete', { 
          detail: { deletedCount: toDelete.length } 
        }));
        
        setStatus('done');
        
        // Wait 1 second then reload to get fresh data
        setTimeout(() => {
          // Silent: reloading
          window.location.reload();
        }, 1000);
        
      } catch (error) {
        // Silent: auto-fix error
        window.dispatchEvent(new CustomEvent('autofix:error'));
        setStatus('done');
      }
    };
    
    // Run immediately when user is available
    if (currentUser?.organizationId) {
      runAutoFix();
    }
  }, [currentUser?.organizationId, status]);
  
  // This component is invisible - it just runs the cleanup
  return null;
}