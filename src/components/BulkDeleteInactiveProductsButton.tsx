import { useState } from 'react';
import { Trash, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { canDeleteInTab, showPermissionError } from '../utils/staffPermissions';
import { toast } from 'sonner@2.0.3';

export function BulkDeleteInactiveProductsButton() {
  const { isDark } = useTheme();
  const { loanProducts, loans, deleteLoanProduct } = useData();
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedProducts, setDeletedProducts] = useState<string[]>([]);
  const [productsToDelete, setProductsToDelete] = useState<any[]>([]);

  // Calculate which products are inactive (0 active clients OR 0 disbursed)
  const getInactiveProducts = () => {
    return loanProducts.filter(product => {
      const productLoans = loans.filter(l => 
        l.productId === product.id || 
        l.product_id === product.id || 
        (l.product && typeof l.product === 'object' && l.product.id === product.id)
      );
      
      const activeLoans = productLoans.filter(l => 
        l.status === 'Active' || l.status === 'Disbursed' || l.status === 'In Arrears'
      );
      
      const disbursedLoans = productLoans.filter(l => 
        l.disbursementDate || 
        l.status === 'Active' || 
        l.status === 'Disbursed' || 
        l.status === 'In Arrears' || 
        l.status === 'Paid'
      );
      
      // Product is inactive if it has 0 active clients OR 0 disbursed loans
      return activeLoans.length === 0 || disbursedLoans.length === 0;
    });
  };

  const inactiveProducts = getInactiveProducts();

  const handleBulkDelete = async () => {
    if (!canDeleteInTab('operations_products')) {
      showPermissionError();
      return;
    }

    if (inactiveProducts.length === 0) {
      toast.info('No inactive products to delete');
      return;
    }

    // Store the products to delete BEFORE opening modal
    setProductsToDelete(inactiveProducts);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const deleted: string[] = [];
    const failed: string[] = [];

    // Use Promise.all for parallel deletion
    const deletePromises = productsToDelete.map(async (product) => {
      try {
        await deleteLoanProduct(product.id);
        deleted.push(product.name);
        // Update UI in real-time
        setDeletedProducts(prev => [...prev, product.name]);
        return { success: true, name: product.name };
      } catch (error: any) {
        console.error(`Failed to delete product ${product.name}:`, error);
        failed.push(product.name);
        return { success: false, name: product.name };
      }
    });

    await Promise.all(deletePromises);

    setIsDeleting(false);

    if (deleted.length > 0) {
      toast.success(`Successfully deleted ${deleted.length} inactive product${deleted.length === 1 ? '' : 's'}`);
    }

    if (failed.length > 0) {
      toast.error(`Failed to delete ${failed.length} product${failed.length === 1 ? '' : 's'}: ${failed.join(', ')}`);
    }

    // Auto-close modal after 2 seconds if all were successful
    if (failed.length === 0) {
      setTimeout(() => {
        setShowModal(false);
        setDeletedProducts([]);
        setProductsToDelete([]);
      }, 2000);
    }
  };

  if (inactiveProducts.length === 0) {
    return null; // Don't show button if there are no inactive products
  }

  return (
    <>
      <button
        onClick={handleBulkDelete}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isDark
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={`Delete ${inactiveProducts.length} inactive product${inactiveProducts.length === 1 ? '' : 's'}`}
      >
        <Trash className="size-4" />
        Delete Inactive ({inactiveProducts.length})
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`${
              isDark ? 'bg-gray-800' : 'bg-white'
            } rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden`}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
                    <AlertTriangle className={`size-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Delete Inactive Products
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {productsToDelete.length} product{productsToDelete.length === 1 ? '' : 's'} will be permanently deleted
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setDeletedProducts([]);
                  }}
                  disabled={isDeleting}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className={`px-6 py-4 max-h-96 overflow-y-auto`}>
              <div className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border border-amber-700/30' : 'bg-amber-50 border border-amber-200'}`}>
                <p className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                  <strong>Warning:</strong> The following products have either <strong>0 active clients</strong> or <strong>0 disbursed loans</strong> and will be permanently deleted. This action cannot be undone.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Products to be deleted:
                </h3>
                {productsToDelete.map((product, index) => {
                  const productLoans = loans.filter(l => 
                    l.productId === product.id || 
                    l.product_id === product.id || 
                    (l.product && typeof l.product === 'object' && l.product.id === product.id)
                  );
                  
                  const activeLoans = productLoans.filter(l => 
                    l.status === 'Active' || l.status === 'Disbursed' || l.status === 'In Arrears'
                  );
                  
                  const disbursedLoans = productLoans.filter(l => 
                    l.disbursementDate || 
                    l.status === 'Active' || 
                    l.status === 'Disbursed' || 
                    l.status === 'In Arrears' || 
                    l.status === 'Paid'
                  );

                  const isDeleted = deletedProducts.includes(product.name);

                  return (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isDeleted
                          ? isDark
                            ? 'bg-green-900/20 border-green-700/30'
                            : 'bg-green-50 border-green-200'
                          : isDark
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {isDeleted && (
                            <CheckCircle className={`size-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                          )}
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} ${isDeleted ? 'line-through' : ''}`}>
                            {product.name}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                            {product.productCode}
                          </span>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          {activeLoans.length} active • {disbursedLoans.length} disbursed • {productLoans.length} total loans
                        </p>
                      </div>
                      {isDeleting && !isDeleted && (
                        <Loader2 className={`size-4 animate-spin ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setDeletedProducts([]);
                }}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting || deletedProducts.length === productsToDelete.length}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2`}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Deleting...
                  </>
                ) : deletedProducts.length === productsToDelete.length ? (
                  <>
                    <CheckCircle className="size-4" />
                    All Deleted
                  </>
                ) : (
                  <>
                    <Trash className="size-4" />
                    Delete {productsToDelete.length} Product{productsToDelete.length === 1 ? '' : 's'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}