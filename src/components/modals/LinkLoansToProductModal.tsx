import React, { useState, useEffect } from 'react';
import { X, Link2, AlertCircle, Sparkles, CheckSquare, Square } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface LinkLoansToProductModalProps {
  isDark: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function LinkLoansToProductModal({ isDark, onClose, onComplete }: LinkLoansToProductModalProps) {
  const { currentUser } = useAuth();
  const { loanProducts, loans, refreshLoans } = useData();
  const [selectedLoanIds, setSelectedLoanIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Find loans without product assignment
  const unlinkedLoans = loans.filter(loan => 
    !loan.productId && 
    !loan.product_id && 
    (!loan.product || loan.product === '')
  );

  // Select all loans by default
  useEffect(() => {
    setSelectedLoanIds(unlinkedLoans.map(l => l.id));
  }, []);

  // Helper function to detect loan product type from loan data
  const detectLoanProductType = (loan: any): string => {
    // Strategy 1: Check for explicit product name/type fields
    const productName = (loan.productName || loan.product_name || '').toUpperCase();
    if (productName.includes('PERSONAL')) return 'PERSONAL LOAN';
    if (productName.includes('BUSINESS')) return 'BUSINESS LOAN';
    
    // Strategy 2: Check for loanType field
    const loanType = (loan.loanType || loan.loan_type || '').toUpperCase();
    if (loanType.includes('PERSONAL')) return 'PERSONAL LOAN';
    if (loanType.includes('BUSINESS')) return 'BUSINESS LOAN';
    
    // Strategy 3: Check for type field
    const type = (loan.type || '').toUpperCase();
    if (type.includes('PERSONAL')) return 'PERSONAL LOAN';
    if (type.includes('BUSINESS')) return 'BUSINESS LOAN';
    
    // Strategy 4: Check for category field
    const category = (loan.category || '').toUpperCase();
    if (category.includes('PERSONAL')) return 'PERSONAL LOAN';
    if (category.includes('BUSINESS')) return 'BUSINESS LOAN';
    
    // Strategy 5: Check product object if it exists
    if (loan.product && typeof loan.product === 'object') {
      const prodName = (loan.product.name || loan.product.product_name || '').toUpperCase();
      if (prodName.includes('PERSONAL')) return 'PERSONAL LOAN';
      if (prodName.includes('BUSINESS')) return 'BUSINESS LOAN';
    }
    
    // Strategy 6: Use heuristics based on loan amount
    // Typically: Personal loans are smaller amounts, Business loans are larger
    const principal = loan.principalAmount || 0;
    if (principal > 0) {
      // If amount is less than 100,000, likely personal loan
      // If amount is 100,000 or more, likely business loan
      if (principal < 100000) return 'PERSONAL LOAN';
      if (principal >= 100000) return 'BUSINESS LOAN';
    }
    
    return 'UNKNOWN';
  };

  // Auto-detect and link loans
  const handleAutoDetectAndLink = async () => {
    try {
      if (!currentUser?.organizationId) {
        alert('No organization found. Please refresh the page and try again.');
        return;
      }

      if (selectedLoanIds.length === 0) {
        alert('Please select at least one loan');
        return;
      }

      // Get selected loans
      const loansToLink = unlinkedLoans.filter(l => selectedLoanIds.includes(l.id));

      // Detect product types for each loan
      const loansByProductType: { [key: string]: any[] } = {};
      loansToLink.forEach(loan => {
        const detectedType = detectLoanProductType(loan);
        if (!loansByProductType[detectedType]) {
          loansByProductType[detectedType] = [];
        }
        loansByProductType[detectedType].push(loan);
      });

      // Find matching products
      const productMatches: { [key: string]: string } = {};
      Object.keys(loansByProductType).forEach(detectedType => {
        const matchingProduct = loanProducts.find(p => {
          const productName = (p.name || '').toUpperCase();
          const productCode = (p.productCode || '').toUpperCase();
          return productName === detectedType || productCode.includes(detectedType.replace(' LOAN', ''));
        });
        
        if (matchingProduct) {
          productMatches[detectedType] = matchingProduct.id;
        }
      });

      // Check if we found products for all detected types
      const unknownLoans = loansByProductType['UNKNOWN'] || [];
      const unmatchedTypes = Object.keys(loansByProductType).filter(
        type => type !== 'UNKNOWN' && !productMatches[type]
      );

      if (unknownLoans.length > 0) {
        alert(`${unknownLoans.length} loan(s) could not be auto-detected. Please check the loan data and ensure they have a product type indicator.`);
        return;
      }

      if (unmatchedTypes.length > 0) {
        alert(`No matching product found for: ${unmatchedTypes.join(', ')}. Please create these products first.`);
        return;
      }

      // Show summary and confirm
      const summary = Object.entries(loansByProductType)
        .filter(([type]) => type !== 'UNKNOWN')
        .map(([type, loans]) => `${loans.length} ${type}(s)`)
        .join(', ');

      if (!confirm(`Auto-detected: ${summary}\n\nProceed with automatic linking?`)) {
        return;
      }

      setIsProcessing(true);
      setProgress({ current: 0, total: loansToLink.length });

      try {
        let successCount = 0;
        let errorCount = 0;

        // Update each loan
        for (let i = 0; i < loansToLink.length; i++) {
          const loan = loansToLink[i];
          const detectedType = detectLoanProductType(loan);
          const productId = productMatches[detectedType];

          if (!productId) {
            errorCount++;
            setProgress({ current: i + 1, total: loansToLink.length });
            continue;
          }

          try {
            const { error } = await supabase
              .from('loans')
              .update({ 
                product_id: productId,
                updated_at: new Date().toISOString()
              })
              .eq('id', loan.id)
              .eq('organization_id', currentUser.organizationId);

            if (error) throw error;
            successCount++;
          } catch (err) {
            console.error('Error updating loan:', loan.id, err);
            errorCount++;
          }
          
          setProgress({ current: i + 1, total: loansToLink.length });
        }

        // Refresh loans from database
        await refreshLoans();

        alert(`Successfully linked ${successCount} loan(s).${errorCount > 0 ? ` ${errorCount} loan(s) failed to update.` : ''}`);
        onComplete();
      } catch (error) {
        console.error('Error linking loans:', error);
        alert('Failed to link loans. Please check your connection and try again.');
      } finally {
        setIsProcessing(false);
        setProgress({ current: 0, total: 0 });
      }
    } catch (error) {
      console.error('Error in handleAutoDetectAndLink:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  // Toggle loan selection
  const toggleLoanSelection = (loanId: string) => {
    setSelectedLoanIds(prev => 
      prev.includes(loanId) 
        ? prev.filter(id => id !== loanId)
        : [...prev, loanId]
    );
  };

  // Toggle all loans
  const toggleAllLoans = () => {
    setSelectedLoanIds(prev => 
      prev.length === unlinkedLoans.length 
        ? []
        : unlinkedLoans.map(l => l.id)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Link2 className="size-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Link Loans to Product
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Auto-detect and assign loans to their correct products
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            } disabled:opacity-50`}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Warning */}
          <div className={`flex gap-3 p-4 rounded-lg mb-6 ${
            isDark ? 'bg-orange-900/20 border border-orange-700/30' : 'bg-orange-50 border border-orange-200'
          }`}>
            <AlertCircle className={`size-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDark ? 'text-orange-200' : 'text-orange-800'}`}>
                Found {unlinkedLoans.length} loan{unlinkedLoans.length === 1 ? '' : 's'} without product assignment
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                Select loans and click "Auto-Detect & Link" to automatically assign them based on their loan type.
              </p>
            </div>
          </div>

          {unlinkedLoans.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 mb-4">
                <Link2 className="size-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                All loans are linked!
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Every loan has been assigned to a product.
              </p>
            </div>
          ) : (
            <>
              {/* Selection Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleAllLoans}
                    disabled={isProcessing}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark
                        ? 'hover:bg-gray-700 text-gray-400'
                        : 'hover:bg-gray-100 text-gray-600'
                    } disabled:opacity-50`}
                  >
                    {selectedLoanIds.length === unlinkedLoans.length ? (
                      <CheckSquare className="size-5 text-blue-600" />
                    ) : (
                      <Square className="size-5" />
                    )}
                  </button>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedLoanIds.length} of {unlinkedLoans.length} selected
                  </span>
                </div>
              </div>

              {/* Loan Table with Checkboxes */}
              <div className={`border rounded-lg max-h-96 overflow-y-auto ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <table className="w-full">
                  <thead className={`sticky top-0 ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-4 py-3 text-left ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <button
                          onClick={toggleAllLoans}
                          disabled={isProcessing}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                          {selectedLoanIds.length === unlinkedLoans.length ? (
                            <CheckSquare className="size-4 text-blue-600" />
                          ) : (
                            <Square className="size-4" />
                          )}
                        </button>
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Loan #
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Product Type
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Client
                      </th>
                      <th className={`px-4 py-3 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Amount
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {unlinkedLoans.map(loan => {
                      const detectedType = detectLoanProductType(loan);
                      const isSelected = selectedLoanIds.includes(loan.id);
                      
                      return (
                        <tr 
                          key={loan.id} 
                          className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} ${isSelected ? (isDark ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}
                        >
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleLoanSelection(loan.id)}
                              disabled={isProcessing}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                            >
                              {isSelected ? (
                                <CheckSquare className="size-4 text-blue-600" />
                              ) : (
                                <Square className="size-4 text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {loan.loanNumber}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              detectedType === 'PERSONAL LOAN'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                : detectedType === 'BUSINESS LOAN'
                                ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {detectedType}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {loan.clientName || 'N/A'}
                          </td>
                          <td className={`px-4 py-3 text-sm text-right font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {(loan.principalAmount || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              loan.status === 'Active' || loan.status === 'Disbursed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                                : loan.status === 'Paid'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {loan.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Progress */}
              {isProcessing && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Processing...</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {progress.current} / {progress.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {unlinkedLoans.length > 0 && (
          <div className={`flex gap-3 justify-end p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              } disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleAutoDetectAndLink}
              disabled={selectedLoanIds.length === 0 || isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="size-4" />
              {isProcessing ? 'Processing...' : `Auto-Detect & Link ${selectedLoanIds.length} Loan${selectedLoanIds.length === 1 ? '' : 's'}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}