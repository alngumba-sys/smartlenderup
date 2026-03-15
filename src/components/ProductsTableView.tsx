import { Pencil, Trash2 } from 'lucide-react';

interface ProductsTableViewProps {
  products: any[];
  isDark: boolean;
  formatCurrency: (amount: number) => string;
  getProductMetrics: (productId: string) => any;
  onSelectProduct: (product: any) => void;
  onEditProduct: (product: any) => void;
  onDeleteProduct: (product: any) => void;
}

export function ProductsTableView({
  products,
  isDark,
  formatCurrency,
  getProductMetrics,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
}: ProductsTableViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <th className={`px-4 py-3 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Product
            </th>
            <th className={`px-4 py-3 text-center text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Interest
            </th>
            <th className={`px-4 py-3 text-center text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Term
            </th>
            <th className={`px-4 py-3 text-right text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Range
            </th>
            <th className={`px-4 py-3 text-center text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Total
            </th>
            <th className={`px-4 py-3 text-center text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Active
            </th>
            <th className={`px-4 py-3 text-right text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Disbursed
            </th>
            <th className={`px-4 py-3 text-right text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Outstanding
            </th>
            <th className={`px-4 py-3 text-center text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              PAR
            </th>
            <th className={`px-4 py-3 text-center text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className={`${isDark ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
          {products.map(product => {
            const metrics = getProductMetrics(product.id);
            
            return (
              <tr
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
              >
                {/* Product Name & Code */}
                <td className="px-4 py-4">
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {product.name}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                      {product.productCode}
                    </div>
                  </div>
                </td>

                {/* Interest Rate */}
                <td className="px-4 py-4 text-center">
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {product.interestRate}%
                  </span>
                </td>

                {/* Term */}
                <td className="px-4 py-4 text-center">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {product.minTerm}-{product.maxTerm}m
                  </span>
                </td>

                {/* Amount Range */}
                <td className="px-4 py-4 text-right">
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatCurrency(product.minAmount || 0)}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    - {formatCurrency(product.maxAmount || 0)}
                  </div>
                </td>

                {/* Total Loans */}
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full text-xs font-semibold ${
                    isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {metrics.totalLoans}
                  </span>
                </td>

                {/* Active Loans */}
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full text-xs font-semibold ${
                    isDark ? 'bg-cyan-900/30 text-cyan-300' : 'bg-cyan-100 text-cyan-700'
                  }`}>
                    {metrics.activeLoans}
                  </span>
                </td>

                {/* Total Disbursed */}
                <td className="px-4 py-4 text-right">
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(metrics.totalDisbursed)}
                  </span>
                </td>

                {/* Outstanding */}
                <td className="px-4 py-4 text-right">
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(metrics.totalOutstanding)}
                  </span>
                </td>

                {/* PAR Rate */}
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-full text-xs font-semibold ${
                    metrics.parRate > 5
                      ? isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700'
                      : isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                  }`}>
                    {metrics.parRate.toFixed(1)}%
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProduct(product);
                      }}
                      className={`p-1.5 ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} rounded transition-colors`}
                      title="Edit product"
                    >
                      <Pencil className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProduct(product);
                      }}
                      className={`p-1.5 ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} rounded transition-colors`}
                      title="Delete product"
                    >
                      <Trash2 className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
