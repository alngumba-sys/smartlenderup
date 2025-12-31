import { useState, useEffect } from 'react';
import { Package, CheckCircle, AlertCircle, XCircle, RefreshCw, Database, Eye, Search } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface DiagnosticResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export function LoanProductDiagnostic() {
  const { loanProducts } = useData();
  const { currentUser } = useAuth();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [supabaseProducts, setSupabaseProducts] = useState<any[]>([]);
  const [showSupabaseData, setShowSupabaseData] = useState(false);

  const getCurrentOrgId = () => {
    const orgData = localStorage.getItem('current_organization');
    if (orgData) {
      try {
        const org = JSON.parse(orgData);
        return org.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // Check 1: Organization Context
    const orgId = getCurrentOrgId();
    if (orgId) {
      results.push({
        status: 'success',
        message: 'Organization context found',
        details: `Organization ID: ${orgId}`
      });
    } else {
      results.push({
        status: 'error',
        message: 'No organization context',
        details: 'You must be logged in to see loan products'
      });
    }

    // Check 2: Local State
    if (loanProducts.length > 0) {
      results.push({
        status: 'success',
        message: `${loanProducts.length} loan product(s) loaded in local state`,
        details: loanProducts.map(p => `${p.name} (${p.id})`).join(', ')
      });
    } else {
      results.push({
        status: 'warning',
        message: 'No loan products in local state',
        details: 'Products might not have loaded from Supabase yet'
      });
    }

    // Check 3: Supabase Connection
    try {
      const { data, error } = await supabase
        .from('loan_products')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        results.push({
          status: 'error',
          message: 'Supabase query failed',
          details: error.message
        });
      } else {
        setSupabaseProducts(data || []);
        if (data && data.length > 0) {
          results.push({
            status: 'success',
            message: `${data.length} loan product(s) found in Supabase`,
            details: data.map((p: any) => `${p.name} (${p.id})`).join(', ')
          });
        } else {
          results.push({
            status: 'warning',
            message: 'No loan products found in Supabase for this organization',
            details: 'Create a new product to get started'
          });
        }
      }
    } catch (error: any) {
      results.push({
        status: 'error',
        message: 'Failed to connect to Supabase',
        details: error.message
      });
    }

    // Check 4: User Permissions
    if (currentUser) {
      results.push({
        status: 'success',
        message: 'User authenticated',
        details: `User: ${currentUser.name} (${currentUser.role})`
      });
    } else {
      results.push({
        status: 'error',
        message: 'No user authenticated',
        details: 'Login required'
      });
    }

    // Check 5: Data Sync Status
    if (loanProducts.length !== supabaseProducts.length) {
      results.push({
        status: 'warning',
        message: 'Data sync mismatch',
        details: `Local: ${loanProducts.length}, Supabase: ${supabaseProducts.length}`
      });
    } else if (loanProducts.length > 0) {
      results.push({
        status: 'success',
        message: 'Local and Supabase data in sync',
        details: `${loanProducts.length} product(s) synchronized`
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="size-5 text-emerald-600" />;
      case 'warning':
        return <AlertCircle className="size-5 text-amber-600" />;
      case 'error':
        return <XCircle className="size-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="size-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-gray-900 text-xl">Loan Products Diagnostic</h2>
              <p className="text-gray-600 text-sm">Check where your loan products are stored</p>
            </div>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`size-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running...' : 'Recheck'}
          </button>
        </div>
      </div>

      {/* Diagnostic Results */}
      <div className="space-y-3">
        <h3 className="text-gray-900 font-medium">Diagnostic Results</h3>
        {diagnostics.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
          >
            <div className="flex items-start gap-3">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{result.message}</p>
                {result.details && (
                  <p className="text-gray-600 text-sm mt-1">{result.details}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Supabase Data Viewer */}
      {supabaseProducts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <button
            onClick={() => setShowSupabaseData(!showSupabaseData)}
            className="flex items-center gap-2 text-gray-900 font-medium mb-4"
          >
            <Database className="size-5 text-blue-600" />
            View Supabase Data ({supabaseProducts.length} products)
            {showSupabaseData ? (
              <Eye className="size-4 ml-auto" />
            ) : (
              <Search className="size-4 ml-auto" />
            )}
          </button>

          {showSupabaseData && (
            <div className="space-y-3">
              {supabaseProducts.map((product, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">ID:</span>
                      <span className="ml-2 text-gray-900 font-mono">{product.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 text-gray-900">{product.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Interest Rate:</span>
                      <span className="ml-2 text-gray-900">{product.interest_rate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 text-gray-900">{product.interest_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Min Amount:</span>
                      <span className="ml-2 text-gray-900">{product.min_amount?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Amount:</span>
                      <span className="ml-2 text-gray-900">{product.max_amount?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                        product.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 text-gray-900 text-xs">
                        {new Date(product.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-gray-900 font-medium mb-3">Quick Actions</h3>
        <div className="space-y-2 text-sm">
          <button
            onClick={handleRefresh}
            className="w-full text-left px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <span className="text-gray-900">🔄 Refresh the page to reload all data</span>
          </button>
          <button
            onClick={() => {
              const orgData = localStorage.getItem('current_organization');
              if (orgData) {
                const org = JSON.parse(orgData);
                console.log('Organization:', org);
                toast.success('Organization info logged to console (F12)');
              }
            }}
            className="w-full text-left px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <span className="text-gray-900">🔍 View organization details in console</span>
          </button>
          <div className="px-4 py-2 bg-white rounded-lg border border-gray-200">
            <span className="text-gray-900">📍 Navigate to: <strong>Admin → Loan Products</strong></span>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-sm text-gray-600 space-y-2">
        <p><strong>Where to find loan products:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Go to the main navigation menu</li>
          <li>Click "Admin" dropdown</li>
          <li>Select "Loan Products"</li>
          <li>All products for your organization will be displayed</li>
        </ul>
        <p className="mt-4"><strong>If products are in Supabase but not showing:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Try refreshing the page (F5)</li>
          <li>Log out and log back in</li>
          <li>Check browser console (F12) for errors</li>
          <li>Verify you're logged into the correct organization</li>
        </ul>
      </div>
    </div>
  );
}
