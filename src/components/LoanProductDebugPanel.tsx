import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { runLoanProductDiagnostic } from '../utils/loanProductDiagnostic';

export function LoanProductDebugPanel() {
  const [supabaseProducts, setSupabaseProducts] = useState<any[]>([]);
  const [currentOrg, setCurrentOrg] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadOrgInfo = () => {
    const orgData = localStorage.getItem('current_organization');
    if (orgData) {
      try {
        const org = JSON.parse(orgData);
        setCurrentOrg(org);
      } catch (e) {
        console.error('Error parsing org data:', e);
      }
    }
  };

  const loadSupabaseProducts = async () => {
    setLoading(true);
    try {
      const orgData = localStorage.getItem('current_organization');
      if (!orgData) {
        toast.error('No organization found');
        setLoading(false);
        return;
      }

      const org = JSON.parse(orgData);
      console.log('🔍 Fetching loan products for org:', org.id);

      const { data, error } = await supabase
        .from('loan_products')
        .select('*')
        .eq('organization_id', org.id);

      if (error) {
        console.error('Error fetching loan products:', error);
        toast.error(`Error: ${error.message}`);
      } else {
        console.log('✅ Fetched loan products:', data);
        setSupabaseProducts(data || []);
        toast.success(`Found ${data?.length || 0} loan products in Supabase`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch loan products');
    } finally {
      setLoading(false);
    }
  };

  const testCreateProduct = async () => {
    setLoading(true);
    try {
      const orgData = localStorage.getItem('current_organization');
      if (!orgData) {
        toast.error('No organization found');
        setLoading(false);
        return;
      }

      const org = JSON.parse(orgData);
      
      const testProduct = {
        id: `TEST${Date.now()}`,
        organization_id: org.id,
        name: 'Debug Test Product',
        description: 'Created by debug panel',
        min_amount: 1000,
        max_amount: 50000,
        min_term: 1,
        max_term: 12,
        interest_rate: 10,
        processing_fee_percentage: 2,
        guarantor_required: false,
        collateral_required: false,
        status: 'Active',
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0],
      };

      console.log('📤 Creating test product:', testProduct);

      const { data, error } = await supabase
        .from('loan_products')
        .insert(testProduct)
        .select();

      if (error) {
        console.error('❌ Error creating product:', error);
        toast.error(`Error: ${error.message}`);
      } else {
        console.log('✅ Product created:', data);
        toast.success('Test product created successfully!');
        await loadSupabaseProducts(); // Reload
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const deleteAllProducts = async () => {
    if (!confirm('Are you sure you want to delete ALL loan products from Supabase?')) {
      return;
    }

    setLoading(true);
    try {
      const orgData = localStorage.getItem('current_organization');
      if (!orgData) {
        toast.error('No organization found');
        setLoading(false);
        return;
      }

      const org = JSON.parse(orgData);

      const { error } = await supabase
        .from('loan_products')
        .delete()
        .eq('organization_id', org.id);

      if (error) {
        console.error('Error deleting products:', error);
        toast.error(`Error: ${error.message}`);
      } else {
        toast.success('All products deleted');
        await loadSupabaseProducts();
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to delete products');
    } finally {
      setLoading(false);
    }
  };

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      toast.info('Running diagnostic... check console');
      await runLoanProductDiagnostic();
      toast.success('Diagnostic complete! Check console for details');
    } catch (error: any) {
      toast.error('Diagnostic failed');
      console.error('Diagnostic error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgInfo();
    loadSupabaseProducts();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-[#1a1a2e] border border-blue-500/30 rounded-lg shadow-2xl z-50">
      <div className="p-4 border-b border-blue-500/30">
        <h3 className="text-white font-semibold">🔍 Loan Products Debug Panel</h3>
        {currentOrg && (
          <p className="text-xs text-gray-400 mt-1">
            Org: {currentOrg.name} ({currentOrg.id})
          </p>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={loadSupabaseProducts}
            disabled={loading}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={testCreateProduct}
            disabled={loading}
            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm disabled:opacity-50"
          >
            Test Create
          </button>
        </div>

        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm disabled:opacity-50"
        >
          🔍 Run Full Diagnostic
        </button>

        <button
          onClick={deleteAllProducts}
          disabled={loading}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm disabled:opacity-50"
        >
          Delete All
        </button>

        <div className="bg-black/30 rounded p-3 max-h-60 overflow-y-auto">
          <p className="text-white text-sm mb-2">
            Supabase Products: {supabaseProducts.length}
          </p>
          {supabaseProducts.length === 0 ? (
            <p className="text-gray-400 text-xs">No products found</p>
          ) : (
            <div className="space-y-2">
              {supabaseProducts.map((product) => (
                <div key={product.id} className="bg-blue-900/20 p-2 rounded text-xs">
                  <p className="text-white font-medium">{product.name}</p>
                  <p className="text-gray-400">ID: {product.id}</p>
                  <p className="text-gray-400">Status: {product.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-400">
          <p>✅ Use this panel to:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Check Supabase in real-time</li>
            <li>Test direct inserts</li>
            <li>Debug sync issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
