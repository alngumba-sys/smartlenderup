import React, { useState } from 'react';
import { Pencil, Trash2, TrendingUp, Users, DollarSign, AlertTriangle, Link2, Package, Sparkles } from 'lucide-react';
import { AddLoanProductModal } from '../modals/AddLoanProductModal';
import { DeleteLoanProductModal } from '../modals/DeleteLoanProductModal';
import { EditLoanProductModal } from '../modals/EditLoanProductModal';
import { LinkLoansToProductModal } from '../modals/LinkLoansToProductModal';
import { ProductLoansModal } from '../modals/ProductLoansModal';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { canCreateInTab, canEditInTab, canDeleteInTab, showPermissionError } from '../../utils/staffPermissions';

export function LoanProductsTab() {
  const { isDark } = useTheme();
  const { loanProducts, loans } = useData();
  const { currentOrganization } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [productToEdit, setProductToEdit] = useState<any>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Get currency symbol based on organization currency
  const getCurrencySymbol = (currency: string): string => {
    const symbols: { [key: string]: string } = {
      'KES': 'KSh',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'ZAR': 'R',
      'NGN': '₦',
      'TZS': 'TSh',
      'UGX': 'USh',
      'RWF': 'FRw',
      'ETB': 'Br',
      'GHS': 'GH₵',
      'XOF': 'CFA',
      'XAF': 'FCFA',
      'MWK': 'MK'
    };
    return symbols[currency] || currency;
  };

  // Format currency with commas
  const formatCurrency = (amount: number): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return `${getCurrencySymbol(currentOrganization?.currency || 'KES')} 0`;
    }
    
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return `${getCurrencySymbol(currentOrganization?.currency || 'KES')} ${formatted}`;
  };

  // Ensure we have valid arrays
  const validLoanProducts = loanProducts || [];
  const validLoans = loans || [];

  // Debug: Log the data structure to understand the issue
  console.log('=== LOAN PRODUCTS DEBUG ===');
  console.log('Total products:', validLoanProducts.length);
  console.log('Total loans:', validLoans.length);
  
  if (validLoanProducts.length > 0) {
    console.log('Sample product:', validLoanProducts[0]);
    console.log('All product IDs:', validLoanProducts.map(p => ({ id: p.id, name: p.name, code: p.productCode })));
  }
  
  if (validLoans.length > 0) {
    console.log('Sample loan:', validLoans[0]);
    console.log('Loan fields:', Object.keys(validLoans[0]));
    
    // Show FULL loan object to see all fields
    console.log('Full first loan object:', JSON.stringify(validLoans[0], null, 2));
    
    // Check productId distribution
    const productIdCounts: { [key: string]: number } = {};
    validLoans.forEach(loan => {
      const id = loan.productId || loan.product_id || (loan.product && typeof loan.product === 'object' ? loan.product.id : null) || 'NO_PRODUCT_ID';
      productIdCounts[id] = (productIdCounts[id] || 0) + 1;
    });
    console.log('Loan distribution by productId:', productIdCounts);
    
    // Show first 3 loans with their product references
    console.log('First 3 loans product references:', validLoans.slice(0, 3).map(l => ({
      loanId: l.id,
      loanNumber: l.loanNumber,
      productId: l.productId,
      product_id: l.product_id,
      productName: l.productName,
      product_name: l.product_name,
      product: l.product,
      productCode: l.productCode,
      loanType: l.loanType,
      type: l.type,
      category: l.category
    })));
  }
  
  // Show productName distribution
  const productNameCounts: { [key: string]: number } = {};
  validLoans.forEach(loan => {
    const name = loan.productName || loan.product_name || 'NO_PRODUCT_NAME';
    productNameCounts[name] = (productNameCounts[name] || 0) + 1;
  });
  console.log('Loan distribution by productName:', productNameCounts);

  // 🔍 DIAGNOSTIC: Find orphaned loans and missing products
  const diagnostics = {
    orphanedLoans: [] as any[],
    missingProducts: new Set<string>(),
    properlyLinkedLoans: 0
  };

  validLoans.forEach(loan => {
    const hasProductId = !!(loan.productId || loan.product_id);
    const productName = (loan.productName || loan.product_name || '').trim();
    
    if (!hasProductId) {
      diagnostics.orphanedLoans.push({
        loanNumber: loan.loanNumber,
        productName: productName || 'NO_NAME',
        status: loan.status
      });
      
      if (productName && !validLoanProducts.some(p => 
        p.name.trim().toUpperCase() === productName.toUpperCase()
      )) {
        diagnostics.missingProducts.add(productName);
      }
    } else {
      diagnostics.properlyLinkedLoans++;
    }
  });

  if (diagnostics.orphanedLoans.length > 0) {
    console.log('⚠️ ORPHANED LOANS (no product_id):', diagnostics.orphanedLoans);
  }
  if (diagnostics.missingProducts.size > 0) {
    console.log('🚨 MISSING PRODUCTS:', Array.from(diagnostics.missingProducts));
  }
  console.log(`✅ Properly linked loans: ${diagnostics.properlyLinkedLoans}/${validLoans.length}`);

  // Calculate product metrics
  const getProductMetrics = (productId: string) => {
    // Find the product to get its name
    const product = validLoanProducts.find(p => p.id === productId);
    const productName = product?.name;
    
    console.log(`📊 [PRODUCT METRICS] Calculating for product:`, {
      productId,
      productName,
      totalLoansInSystem: validLoans.length
    });
    
    // Match loans to products - STRICT UUID matching first
    const productLoans = validLoans.filter(l => {
      // Strategy 1: Match by product_id (UUID foreign key) - PRIMARY and MOST RELIABLE
      if (l.productId === productId || l.product_id === productId) {
        console.log(`  ✅ Matched loan ${l.loanNumber} by product_id`);
        return true;
      }
      
      // Strategy 2: Match by product.id from Supabase JOIN
      if (l.product && typeof l.product === 'object' && l.product.id === productId) {
        console.log(`  ✅ Matched loan ${l.loanNumber} by product.id`);
        return true;
      }
      
      // ⚠️ FALLBACK: Only use name matching if product_id is missing/null
      // This handles legacy data or incomplete records
      if (!l.productId && !l.product_id) {
        const loanProductName = (l.productName || l.product_name || '').trim();
        const targetProductName = (productName || '').trim();
        
        // Exact match only (case-insensitive)
        if (loanProductName && targetProductName && 
            loanProductName.toUpperCase() === targetProductName.toUpperCase()) {
          console.log(`  ⚠️ Matched loan ${l.loanNumber} by name (no product_id)`);
          return true;
        }
      }
      
      return false;
    });
    
    console.log(`  📊 Found ${productLoans.length} loans for product ${productName}`);
    if (productLoans.length > 0) {
      console.log(`  Loan numbers:`, productLoans.map(l => l.loanNumber).join(', '));
    }
    
    const activeLoans = productLoans.filter(l => l.status === 'Active' || l.status === 'Disbursed' || l.status === 'In Arrears');
    
    // Total disbursed: sum of principal amounts for all loans that were disbursed
    const disbursedLoans = productLoans.filter(l => l.disbursementDate || l.status === 'Active' || l.status === 'Disbursed' || l.status === 'In Arrears' || l.status === 'Paid');
    const totalDisbursed = disbursedLoans.reduce((sum, l) => sum + (l.principalAmount || 0), 0);
    
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
    const avgLoanSize = disbursedLoans.length > 0 ? totalDisbursed / disbursedLoans.length : 0;
    
    // PAR calculation: loans that are more than 30 days overdue
    const today = new Date();
    const parLoans = productLoans.filter(l => {
      if (!l.nextPaymentDate) return false;
      const nextPaymentDate = new Date(l.nextPaymentDate);
      const daysOverdue = Math.floor((today.getTime() - nextPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysOverdue > 30 && (l.outstandingBalance || 0) > 0;
    });
    const totalParAmount = parLoans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
    const parRate = totalOutstanding > 0 ? (totalParAmount / totalOutstanding) * 100 : 0;

    return {
      totalLoans: productLoans.length,
      activeLoans: activeLoans.length,
      totalDisbursed,
      totalOutstanding,
      avgLoanSize,
      parRate
    };
  };

  // Generate AI insights for each product
  const generateProductInsights = (product: any, metrics: any) => {
    const insights = [];
    
    // Performance insight
    if (metrics.totalLoans > 10) {
      insights.push({
        type: 'success',
        text: `Strong demand with ${metrics.totalLoans} loans disbursed, showing this product meets market needs`
      });
    } else if (metrics.totalLoans > 0) {
      insights.push({
        type: 'info',
        text: `Moderate adoption with ${metrics.totalLoans} loan${metrics.totalLoans === 1 ? '' : 's'}. Consider targeted marketing to increase uptake`
      });
    } else {
      insights.push({
        type: 'warning',
        text: 'No loans disbursed yet. Consider pilot testing with select clients'
      });
    }
    
    // PAR insight
    if (metrics.parRate === 0 && metrics.totalLoans > 0) {
      insights.push({
        type: 'success',
        text: 'Excellent portfolio quality with 0% PAR - clients are repaying on time'
      });
    } else if (metrics.parRate > 10) {
      insights.push({
        type: 'warning',
        text: `High PAR of ${metrics.parRate.toFixed(1)}% indicates collection challenges. Review lending criteria`
      });
    } else if (metrics.parRate > 5) {
      insights.push({
        type: 'info',
        text: `PAR of ${metrics.parRate.toFixed(1)}% is within acceptable range but monitor closely`
      });
    }
    
    // Average loan size insight
    const midPoint = ((product.minAmount || 0) + (product.maxAmount || 0)) / 2;
    if (metrics.avgLoanSize > 0) {
      if (metrics.avgLoanSize < midPoint * 0.5) {
        insights.push({
          type: 'info',
          text: `Average loan size of ${formatCurrency(metrics.avgLoanSize)} is in the lower range. Clients may need larger amounts`
        });
      } else if (metrics.avgLoanSize > midPoint * 1.5) {
        insights.push({
          type: 'success',
          text: `Average loan size of ${formatCurrency(metrics.avgLoanSize)} shows strong client capacity and trust`
        });
      }
    }
    
    // Interest rate competitiveness (basic insight)
    if (product.interestRate > 20) {
      insights.push({
        type: 'warning',
        text: `Interest rate of ${product.interestRate}% is high. Ensure it aligns with market rates and client capacity`
      });
    }
    
    return insights.slice(0, 3); // Return max 3 insights
  };

  const handleDeleteProduct = (product: any) => {
    if (!canDeleteInTab('operations_products')) {
      showPermissionError();
      return;
    }
    const productLoans = validLoans.filter(l => l.productId === product.id);
    if (productLoans.length > 0) {
      alert(`Cannot delete "${product.name}" because it has ${productLoans.length} loan(s) attached to it.`);
      return;
    }
    setProductToDelete(product);
  };

  return (
    <>
      <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm p-6`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Loan Products
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Manage your loan products with AI-powered insights
            </p>
          </div>
          <button
            onClick={() => {
              if (!canCreateInTab('operations_products')) {
                showPermissionError();
                return;
              }
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Add Product
          </button>
        </div>

        {/* 🚨 DATA INTEGRITY WARNING */}
        {diagnostics.orphanedLoans.length > 0 && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${isDark ? 'bg-amber-900/20 border-amber-600/50' : 'bg-amber-50 border-amber-300'}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`size-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              <div className="flex-1">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-amber-300' : 'text-amber-900'} mb-1`}>
                  Data Integrity Issue Detected
                </h3>
                <p className={`text-xs ${isDark ? 'text-amber-200' : 'text-amber-800'} mb-3`}>
                  Found <strong>{diagnostics.orphanedLoans.length} loan{diagnostics.orphanedLoans.length === 1 ? '' : 's'}</strong> without proper product linkage.
                  {diagnostics.missingProducts.size > 0 && (
                    <> Also detected <strong>{diagnostics.missingProducts.size} missing product{diagnostics.missingProducts.size === 1 ? '' : 's'}</strong>: {Array.from(diagnostics.missingProducts).join(', ')}.</>
                  )}
                </p>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isDark 
                      ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <Link2 className="size-3.5" />
                  Fix Product Links
                </button>
              </div>
            </div>
          </div>
        )}

        {validLoanProducts.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Package className="size-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No loan products yet</p>
            <p className="text-sm">Create your first loan product to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {validLoanProducts.map(product => {
              const metrics = getProductMetrics(product.id);
              const insights = generateProductInsights(product, metrics);
              
              return (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`border ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer`}
                >
                  {/* Header with gradient */}
                  <div className={`p-6 ${
                    isDark 
                      ? 'bg-gradient-to-br from-gray-700 to-gray-800'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                            {product.productCode || 'Product'}
                          </span>
                        </div>
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                          {product.name}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                          {product.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (!canEditInTab('operations_products')) {
                              showPermissionError();
                              return;
                            }
                            setProductToEdit(product); 
                          }}
                          className={`p-2 ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} ${isDark ? 'text-gray-300' : 'text-gray-700'} rounded-lg transition-colors`}
                          title="Edit product"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product); }}
                          className={`p-2 ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} ${isDark ? 'text-gray-300' : 'text-gray-700'} rounded-lg transition-colors`}
                          title="Delete product"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Key Terms */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className={`${isDark ? 'bg-gray-600/30' : 'bg-white'} backdrop-blur-sm rounded-lg p-2.5 text-center border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-0.5`}>Interest</p>
                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.interestRate}%</p>
                      </div>
                      <div className={`${isDark ? 'bg-gray-600/30' : 'bg-white'} backdrop-blur-sm rounded-lg p-2.5 text-center border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-0.5`}>Range</p>
                        <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'} leading-tight`}>
                          {formatCurrency(product.minAmount || 0).replace(getCurrencySymbol(currentOrganization?.currency || 'KES'), '').trim()}
                          <br />
                          - {formatCurrency(product.maxAmount || 0)}
                        </p>
                      </div>
                      <div className={`${isDark ? 'bg-gray-600/30' : 'bg-white'} backdrop-blur-sm rounded-lg p-2.5 text-center border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-0.5`}>Term</p>
                        <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'} leading-tight`}>
                          {product.minTerm}-{product.maxTerm}
                          <br />
                          months
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className={`p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className={`size-3.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total</span>
                        </div>
                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {metrics.totalLoans}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className={`size-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active</span>
                        </div>
                        <p className={`text-2xl font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                          {metrics.activeLoans}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <AlertTriangle className={`size-3.5 ${metrics.parRate > 5 ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-cyan-400' : 'text-cyan-600')}`} />
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>PAR</span>
                        </div>
                        <p className={`text-2xl font-bold ${metrics.parRate > 5 ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-cyan-400' : 'text-cyan-600')}`}>
                          {metrics.parRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-0.5`}>Disbursed</p>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(metrics.totalDisbursed)}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-0.5`}>Outstanding</p>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(metrics.totalOutstanding)}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-0.5`}>Avg Size</p>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(metrics.avgLoanSize)}
                        </p>
                      </div>
                    </div>

                    {/* AI Insights */}
                    {insights.length > 0 && (
                      <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm opacity-75"></div>
                            <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              AI
                            </div>
                          </div>
                          <h4 className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            AI Insights
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {insights.map((insight, idx) => (
                            <div
                              key={idx}
                              className={`flex gap-2 p-2.5 rounded-lg text-xs ${
                                insight.type === 'success'
                                  ? isDark ? 'bg-cyan-900/20 border border-cyan-700/30' : 'bg-cyan-50 border border-cyan-200'
                                  : insight.type === 'warning'
                                  ? isDark ? 'bg-amber-900/20 border border-amber-700/30' : 'bg-amber-50 border border-amber-200'
                                  : isDark ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200'
                              }`}
                            >
                              <span className="text-sm">
                                {insight.type === 'success' ? '✅' : insight.type === 'warning' ? '⚠️' : 'ℹ️'}
                              </span>
                              <p className={
                                insight.type === 'success'
                                  ? isDark ? 'text-cyan-300' : 'text-cyan-700'
                                  : insight.type === 'warning'
                                  ? isDark ? 'text-amber-300' : 'text-amber-700'
                                  : isDark ? 'text-blue-200' : 'text-blue-800'
                              }>
                                {insight.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddLoanProductModal
          isDark={isDark}
          onClose={() => setShowAddModal(false)}
          onAdd={() => {
            // Product is added via DataContext, no need to update local state
            setShowAddModal(false);
          }}
        />
      )}

      {productToDelete && (
        <DeleteLoanProductModal
          isDark={isDark}
          product={productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={() => {
            // Product is deleted via DataContext, no need to update local state
            setProductToDelete(null);
          }}
        />
      )}

      {productToEdit && (
        <EditLoanProductModal
          isDark={isDark}
          product={productToEdit}
          onClose={() => setProductToEdit(null)}
          onSave={() => {
            // Product is updated via DataContext, no need to update local state
            setProductToEdit(null);
          }}
        />
      )}

      {showLinkModal && (
        <LinkLoansToProductModal
          isDark={isDark}
          onClose={() => setShowLinkModal(false)}
          onComplete={() => {
            // Linking is handled via DataContext, no need to update local state
            setShowLinkModal(false);
          }}
        />
      )}

      {selectedProduct && (
        <ProductLoansModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}