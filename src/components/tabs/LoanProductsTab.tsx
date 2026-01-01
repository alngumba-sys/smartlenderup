import { useState } from 'react';
import { Plus, Edit2, X, Package, TrendingUp, DollarSign, Calendar, PercentIcon, Check, AlertCircle, Info, Eye, Power, Trash2, Search } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/numberFormat';

export function LoanProductsTab() {
  const { isDark } = useTheme();
  const { loanProducts, loans, addLoanProduct, updateLoanProduct, deleteLoanProduct } = useData();
  const currencyCode = getCurrencyCode();
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);

  // Calculate product metrics
  const getProductMetrics = (productId: string) => {
    const productLoans = loans.filter(l => l.productId === productId);
    const activeLoans = productLoans.filter(l => l.status === 'Active' || l.status === 'In Arrears');
    const totalDisbursed = productLoans.reduce((sum, l) => sum + (l.principalAmount || 0), 0);
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
    const avgLoanSize = productLoans.length > 0 ? totalDisbursed / productLoans.length : 0;
    const parLoans = productLoans.filter(l => l.status === 'In Arrears').length;
    const parRate = productLoans.length > 0 ? (parLoans / productLoans.length) * 100 : 0;

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
    } else if (metrics.parRate > 0 && metrics.parRate <= 5) {
      insights.push({
        type: 'info',
        text: `PAR at ${metrics.parRate.toFixed(1)}% is within acceptable range but monitor closely`
      });
    } else if (metrics.parRate > 5) {
      insights.push({
        type: 'warning',
        text: `PAR at ${metrics.parRate.toFixed(1)}% is above 5% threshold. Review credit assessment criteria`
      });
    }
    
    // Rate competitiveness
    if (product.interestRate < 8) {
      insights.push({
        type: 'info',
        text: 'Highly competitive rate that attracts quality borrowers but monitor profitability margins'
      });
    } else if (product.interestRate > 15) {
      insights.push({
        type: 'warning',
        text: 'Interest rate above market average. Consider if this affects loan demand'
      });
    }
    
    // Utilization insight
    const utilizationRate = (metrics.activeLoans / Math.max(metrics.totalLoans, 1)) * 100;
    if (utilizationRate > 70 && metrics.totalLoans > 0) {
      insights.push({
        type: 'success',
        text: `${utilizationRate.toFixed(0)}% of loans remain active, indicating good client retention`
      });
    }
    
    return insights;
  };

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900 bg-[rgb(17,17,32)]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-900 dark:text-white">Loan Products</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage loan products and configure interest rates</p>
        </div>
        <button 
          onClick={() => setShowNewProductModal(true)}
          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
        >
          <Plus className="size-4" />
          New Product
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Products</span>
            <Package className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{loanProducts.length}</p>
          <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-1">
            {loanProducts.filter(p => p.status === 'Active').length} active
          </p>
        </div>

        <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Loans</span>
            <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{loans.length}</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Across all products</p>
        </div>

        <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Disbursed</span>
            <DollarSign className="size-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {currencyCode} {(loans.reduce((sum, l) => sum + (l.principalAmount || 0), 0) / 1000000).toFixed(1)}M
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Lifetime disbursements</p>
        </div>

        <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Interest Rate</span>
            <PercentIcon className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {loanProducts.length > 0 
              ? (loanProducts.reduce((sum, p) => sum + (p.interestRate || 0), 0) / loanProducts.length).toFixed(1)
              : 0}%
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Monthly rate</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loanProducts.map(product => {
          const metrics = getProductMetrics(product.id);
          const insights = generateProductInsights(product, metrics);
          return (
            <div key={product.id} className="space-y-3">
              {/* Product Card - Reduced Size */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow flex flex-col min-h-[420px]">
                {/* Product Header */}
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600 px-[12px] py-[0px]">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <h3 className="text-gray-900 dark:text-white text-sm text-[16px] px-[0px] py-[5px]">{product.name}</h3>
                      <div className="min-h-[2rem]">
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5 line-clamp-2">{product.description}</p>
                      </div>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ml-2 ${
                      product.status === 'Active' 
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </div>

                {/* Interest Rate - Compact Display */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 p-[12px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 text-[10px] uppercase tracking-wide">Interest Rate</p>
                      <p className="text-blue-900 dark:text-blue-100 text-2xl">{product.interestRate || 0}%</p>
                      <p className="text-blue-700 dark:text-blue-300 text-[10px] mt-0.5">{product.interestType || 'N/A'} / {product.repaymentFrequency || 'N/A'}</p>
                    </div>
                    <PercentIcon className="size-6 text-blue-400 dark:text-blue-500" />
                  </div>
                </div>

                {/* Product Details - Compact */}
                <div className="p-3 space-y-2 bg-white dark:bg-gray-800">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded">
                      <p className="text-gray-600 dark:text-gray-400 text-[10px]">Min Amount</p>
                      <p className="text-gray-900 dark:text-white text-xs">
                        {product.minAmount > 0 ? `${currencyCode} ${((product.minAmount || 0) / 1000).toFixed(0)}K` : `${currencyCode} 0`}
                      </p>
                    </div>
                    <div className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded">
                      <p className="text-gray-600 dark:text-gray-400 text-[10px]">Max Amount</p>
                      <p className="text-gray-900 dark:text-white text-xs">
                        {product.maxAmount > 0 ? `${currencyCode} ${((product.maxAmount || 0) / 1000).toFixed(0)}K` : `${currencyCode} 0`}
                      </p>
                    </div>
                    <div className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded">
                      <p className="text-gray-600 dark:text-gray-400 text-[10px]">Tenor</p>
                      <p className="text-gray-900 dark:text-white text-xs">
                        {product.minTenor && product.maxTenor ? `${product.minTenor}-${product.maxTenor}m` : 'N/A'}
                      </p>
                    </div>
                    <div className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded">
                      <p className="text-gray-600 dark:text-gray-400 text-[10px]">Fee</p>
                      <p className="text-gray-900 dark:text-white text-xs">{currencyCode} {(product.processingFee || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Performance Metrics - Compact */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-600 dark:text-gray-400">Total Loans:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{metrics.totalLoans}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-600 dark:text-gray-400">Active:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{metrics.activeLoans}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-600 dark:text-gray-400">Disbursed:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {metrics.totalDisbursed > 0 ? `${currencyCode} ${(metrics.totalDisbursed / 1000).toFixed(0)}K` : `${currencyCode} 0`}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-600 dark:text-gray-400">Avg Size:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {metrics.avgLoanSize > 0 ? `${currencyCode} ${(metrics.avgLoanSize / 1000).toFixed(0)}K` : `${currencyCode} 0`}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-600 dark:text-gray-400">PAR:</span>
                        <span className={metrics.parRate > 5 ? 'text-red-600 dark:text-red-400 font-medium' : 'text-emerald-600 dark:text-emerald-400 font-medium'}>
                          {metrics.parRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Compact */}
                <div className="p-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex gap-1.5">
                  <button
                    onClick={() => setViewingProduct(product.id)}
                    className="flex-1 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-gray-500 flex items-center justify-center gap-1 text-xs"
                  >
                    <Eye className="size-3" />
                    View
                  </button>
                  <button
                    onClick={() => setEditingProduct(product.id)}
                    className="flex-1 px-2 py-1 bg-[rgb(34,137,63)] text-white rounded hover:bg-emerald-700 flex items-center justify-center gap-1 text-xs"
                  >
                    <Edit2 className="size-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingProduct(product.id)}
                    className="flex-1 px-2 py-1 bg-[rgb(95,20,24)] text-white rounded hover:bg-red-700 flex items-center justify-center gap-1 text-xs"
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </button>
                </div>
              </div>

              {/* AI Insights Card */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-purple-100 dark:bg-purple-900/40 rounded">
                    <Info className="size-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="text-purple-900 dark:text-purple-200 text-xs font-medium">AI Insights</h4>
                </div>
                <div className="space-y-1.5">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <div className={`mt-0.5 size-1.5 rounded-full flex-shrink-0 ${
                        insight.type === 'success' ? 'bg-emerald-500' :
                        insight.type === 'warning' ? 'bg-amber-500' :
                        'bg-blue-500'
                      }`} />
                      <p className={`text-[11px] leading-relaxed ${
                        insight.type === 'success' ? 'text-emerald-900 dark:text-emerald-200' :
                        insight.type === 'warning' ? 'text-amber-900 dark:text-amber-200' :
                        'text-blue-900 dark:text-blue-200'
                      }`}>
                        {insight.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Product Modal */}
      {showNewProductModal && (
        <ProductFormModal
          isOpen={showNewProductModal}
          onClose={() => setShowNewProductModal(false)}
          onSubmit={async (productData) => {
            await addLoanProduct(productData);
            setShowNewProductModal(false);
          }}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <ProductFormModal
          isOpen={!!editingProduct}
          product={loanProducts.find(p => p.id === editingProduct)}
          onClose={() => setEditingProduct(null)}
          onSubmit={async (productData) => {
            await updateLoanProduct(editingProduct, productData);
            setEditingProduct(null);
          }}
        />
      )}

      {/* View Product Details Modal */}
      {viewingProduct && (
        <ProductDetailsModal
          product={loanProducts.find(p => p.id === viewingProduct)!}
          metrics={getProductMetrics(viewingProduct)}
          onClose={() => setViewingProduct(null)}
          onEdit={() => {
            setViewingProduct(null);
            setEditingProduct(viewingProduct);
          }}
        />
      )}

      {/* Delete Product Confirmation Modal */}
      {deletingProduct && (
        <DeleteProductModal
          product={loanProducts.find(p => p.id === deletingProduct)!}
          onClose={() => setDeletingProduct(null)}
          onDelete={() => {
            deleteLoanProduct(deletingProduct);
            setDeletingProduct(null);
          }}
        />
      )}
    </div>
  );
}

// Product Form Modal Component
interface ProductFormModalProps {
  isOpen: boolean;
  product?: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function ProductFormModal({ isOpen, product, onClose, onSubmit }: ProductFormModalProps) {
  const { isDark } = useTheme();
  const currencyCode = getCurrencyCode();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    interestRate: product?.interestRate || '',
    interestType: product?.interestType || 'Flat',
    minAmount: product?.minAmount || '',
    maxAmount: product?.maxAmount || '',
    minTenor: product?.minTenor || '',
    maxTenor: product?.maxTenor || '',
    repaymentFrequency: product?.repaymentFrequency || 'Monthly',
    processingFee: product?.processingFee || '',
    insuranceFee: product?.insuranceFee || '',
    status: product?.status || 'Active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tenorMonths: formData.maxTenor // Default tenor
    });
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-gray-900 text-[20px]">{product ? 'Edit Loan Product' : 'Create New Loan Product'}</h3>
              <p className="text-gray-600 text-sm">Configure product parameters and interest rates</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Basic Information */}
            <div className="space-y-2">
              <h4 className="text-gray-900 text-sm">Basic Information</h4>
              
              {/* Product Name and Status on same row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., BV Business Loan"
                    required
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <p className="text-gray-500 text-xs mt-0.5">Inactive products cannot be used for new loans</p>
                </div>
              </div>

              {/* Description - single line */}
              <div>
                <label className="block text-gray-700 text-sm mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the loan product"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            {/* Interest Rate Configuration */}
            <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <PercentIcon className="size-4 text-blue-600" />
                <h4 className="text-gray-900 text-sm">Interest Rate Configuration</h4>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Interest Rate (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    required
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-1">Interest Type *</label>
                  <select
                    value={formData.interestType}
                    onChange={(e) => setFormData({ ...formData, interestType: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="Flat">Flat Rate</option>
                    <option value="Declining">Declining Balance</option>
                    <option value="Simple">Simple Interest</option>
                    <option value="Compound">Compound Interest</option>
                    <option value="Reducing Balance">Reducing Balance</option>
                    <option value="Amortized">Amortized</option>
                    <option value="Bullet">Bullet Payment (Principal at End)</option>
                    <option value="Interest Only">Interest Only (Periodic)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-1">Repayment Frequency *</label>
                  <select
                    value={formData.repaymentFrequency}
                    onChange={(e) => setFormData({ ...formData, repaymentFrequency: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
              </div>
              
              <p className="text-gray-500 text-xs">This is the global rate for this product</p>
            </div>

            {/* Loan Limits */}
            <div className="space-y-2">
              <h4 className="text-gray-900 text-sm">Loan Limits, Fees & Charges</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Minimum Amount ({currencyCode}) *</label>
                  <input
                    type="text"
                    step="1000"
                    min="0"
                    value={formatNumberWithCommas(formData.minAmount)}
                    onChange={(e) => setFormData({ ...formData, minAmount: parseFormattedNumber(e.target.value) })}
                    required
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-1">Maximum Amount ({currencyCode}) *</label>
                  <input
                    type="text"
                    step="1000"
                    min="0"
                    value={formatNumberWithCommas(formData.maxAmount)}
                    onChange={(e) => setFormData({ ...formData, maxAmount: parseFormattedNumber(e.target.value) })}
                    required
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-1">Minimum Tenor (months) *</label>
                  <input
                    type="text"
                    min="1"
                    max="60"
                    value={formatNumberWithCommas(formData.minTenor)}
                    onChange={(e) => setFormData({ ...formData, minTenor: parseFormattedNumber(e.target.value) })}
                    required
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-1">Maximum Tenor (months) *</label>
                  <input
                    type="text"
                    min="1"
                    max="60"
                    value={formatNumberWithCommas(formData.maxTenor)}
                    onChange={(e) => setFormData({ ...formData, maxTenor: parseFormattedNumber(e.target.value) })}
                    required
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-1">Processing Fee ({currencyCode})</label>
                  <input
                    type="text"
                    step="100"
                    min="0"
                    value={formatNumberWithCommas(formData.processingFee)}
                    onChange={(e) => setFormData({ ...formData, processingFee: parseFormattedNumber(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-1">Insurance Fee ({currencyCode})</label>
                  <input
                    type="text"
                    step="100"
                    min="0"
                    value={formatNumberWithCommas(formData.insuranceFee)}
                    onChange={(e) => setFormData({ ...formData, insuranceFee: parseFormattedNumber(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                {product ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Product Details Modal Component
interface ProductDetailsModalProps {
  product: any;
  metrics: any;
  onClose: () => void;
  onEdit: () => void;
}

function ProductDetailsModal({ product, metrics, onClose, onEdit }: ProductDetailsModalProps) {
  const { isDark } = useTheme();
  const { loans, clients } = useData();
  const currencyCode = getCurrencyCode();
  const productLoans = loans.filter(l => l.productId === product.id);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-gray-900 dark:text-white text-lg">{product.name}</h3>
                <span className={`px-2 py-0.5 rounded text-xs ${ 
                  product.status === 'Active' 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {product.status}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">{product.description}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="size-5" />
            </button>
          </div>

          {/* Key Metrics - Compact Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Interest Rate</p>
              <p className="text-blue-900 dark:text-blue-300 text-2xl">{product.interestRate}%</p>
              <p className="text-blue-700 dark:text-blue-400 text-xs mt-0.5">{product.interestType}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800/40 dark:to-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Repayment</p>
              <p className="text-gray-900 dark:text-white text-xl">{product.repaymentFrequency}</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">Payment frequency</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800/40 dark:to-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Tenor Range</p>
              <p className="text-gray-900 dark:text-white text-xl">{product.minTenor} - {product.maxTenor}</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">Months</p>
            </div>
          </div>

          {/* Product Configuration */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-gray-900 dark:text-white text-sm mb-2">Loan Limits</h4>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Minimum:</span>
                  <span className="text-gray-900 dark:text-white">{currencyCode} {product.minAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Maximum:</span>
                  <span className="text-gray-900 dark:text-white">{currencyCode} {product.maxAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-gray-900 dark:text-white text-sm mb-2">Fees & Charges</h4>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Processing:</span>
                  <span className="text-gray-900 dark:text-white">{currencyCode} {product.processingFee?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Insurance:</span>
                  <span className="text-gray-900 dark:text-white">{currencyCode} {product.insuranceFee?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics - Refined */}
          <div className="mb-4">
            <h4 className="text-gray-900 dark:text-white text-sm mb-2">Performance Metrics</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-700 dark:text-blue-400 text-xs mb-0.5">Total Loans</p>
                <p className="text-blue-900 dark:text-blue-300 text-lg">{metrics.totalLoans}</p>
              </div>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <p className="text-emerald-700 dark:text-emerald-400 text-xs mb-0.5">Active Loans</p>
                <p className="text-emerald-900 dark:text-emerald-300 text-lg">{metrics.activeLoans}</p>
              </div>
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <p className="text-indigo-700 dark:text-indigo-400 text-xs mb-0.5">Total Disbursed</p>
                <p className="text-indigo-900 dark:text-indigo-300 text-lg">{currencyCode} {(metrics.totalDisbursed / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-purple-700 dark:text-purple-400 text-xs mb-0.5">Avg Loan Size</p>
                <p className="text-purple-900 dark:text-purple-300 text-lg">{currencyCode} {(metrics.avgLoanSize / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-2.5 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                <p className="text-cyan-700 dark:text-cyan-400 text-xs mb-0.5">Outstanding</p>
                <p className="text-cyan-900 dark:text-cyan-300 text-lg">{currencyCode} {(metrics.totalOutstanding / 1000000).toFixed(1)}M</p>
              </div>
              <div className={`p-2.5 rounded-lg border ${ 
                metrics.parRate > 5 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                  : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
              }`}>
                <p className={`text-xs mb-0.5 ${metrics.parRate > 5 ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>PAR Rate</p>
                <p className={`text-lg ${metrics.parRate > 5 ? 'text-red-900 dark:text-red-300' : 'text-emerald-900 dark:text-emerald-300'}`}>
                  {metrics.parRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Recent Loans - Compact */}
          {productLoans.length > 0 && (
            <div className="mb-4">
              <h4 className="text-gray-900 dark:text-white text-sm mb-2">Recent Loans ({productLoans.length} total)</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {productLoans.slice(0, 5).map(loan => {
                  const client = clients.find(c => c.id === loan.clientId);
                  return (
                    <div key={loan.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-gray-900 dark:text-white text-sm">{loan.clientName}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{loan.disbursementDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900 dark:text-white text-sm">{currencyCode} {loan.principalAmount.toLocaleString()}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          {loan.interestRate}% • {loan.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm"
            >
              <Edit2 className="size-4" />
              Edit Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Delete Product Confirmation Modal Component
interface DeleteProductModalProps {
  product: any;
  onClose: () => void;
  onDelete: () => void;
}

function DeleteProductModal({ product, onClose, onDelete }: DeleteProductModalProps) {
  const { isDark } = useTheme();
  const { loans } = useData();
  const currencyCode = getCurrencyCode();
  
  // Count loans associated with this product
  const productLoans = loans.filter(l => l.productId === product.id);
  const activeLoans = productLoans.filter(l => l.status === 'Active' || l.status === 'In Arrears');

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[rgb(95,20,24)] dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-gray-900 dark:text-white">Delete Product</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="size-5" />
            </button>
          </div>

          {/* Product Info */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-gray-900 dark:text-white">{product.name}</h4>
              <span className={`px-2 py-0.5 rounded text-xs ${ 
                product.status === 'Active' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {product.status}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{product.description}</p>
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Interest Rate:</span>
                <span className="text-gray-900 dark:text-white">{product.interestRate}% {product.interestType}</span>
              </div>
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
              Are you sure you want to delete <strong>"{product.name}"</strong>?
            </p>
            
            {/* Loan Impact Information */}
            {productLoans.length > 0 ? (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-2">
                  <Info className="size-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-blue-900 dark:text-blue-300 text-sm">
                      <strong>{productLoans.length} loan{productLoans.length === 1 ? '' : 's'}</strong> {productLoans.length === 1 ? 'was' : 'were'} issued against this product.
                    </p>
                    <p className="text-blue-800 dark:text-blue-400 text-xs">
                      ✓ Existing loans will <strong>NOT</strong> be affected<br />
                      ✓ {activeLoans.length} active loan{activeLoans.length === 1 ? '' : 's'} will continue normally<br />
                      ✗ No new loans can be created with this product
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-2">
                  <Info className="size-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    No loans have been issued against this product. It can be safely deleted.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-amber-900 dark:text-amber-300 text-xs">
                <strong>Warning:</strong> This action cannot be undone. The product will be permanently deleted from the system.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="flex-1 px-4 py-2 bg-[rgb(95,20,24)] text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 text-sm"
            >
              <Trash2 className="size-4" />
              Delete Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}