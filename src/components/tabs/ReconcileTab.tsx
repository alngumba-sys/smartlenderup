import { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { 
  Download, 
  Settings2, 
  GripVertical, 
  Eye, 
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';

// Column definitions with all fields from the images
const ALL_COLUMNS = [
  // Image 3 columns
  { id: 'ifi_number', label: 'IFI #', enabled: true },
  { id: 'date_of_issue', label: 'DATE OF ISSUE', enabled: true },
  { id: 'borrower_name', label: 'NAME OF BORROWER', enabled: true },
  { id: 'id_number', label: 'ID NUMBER', enabled: true },
  { id: 'tel_no', label: 'TEL NO', enabled: true },
  { id: 'cumulative_amount', label: 'CUMMULATIVE AMOUNT BORROWED', enabled: true },
  { id: 'processing_fees', label: 'PROCESSING FEES', enabled: true },
  { id: 'interest_percent', label: 'INTEREST (%)', enabled: true },
  
  // Image 2 columns
  { id: 'repayment_period', label: 'REPAYMENT PERIOD', enabled: true },
  { id: 'due_date', label: 'DUE DATE', enabled: true },
  { id: 'repayment_duration', label: 'REPAYMENT DURATION IN MONTHS', enabled: true },
  { id: 'potential_interest', label: 'POTENTIAL INTEREST PAYABLE', enabled: true },
  
  // Image 1 columns
  { id: 'total_amt_payable', label: 'TOTAL AMT PAYABLE (PRINCIPAL + INTEREST)', enabled: true },
  { id: 'principal_paid', label: 'PRINCIPAL PAID BACK', enabled: true },
  { id: 'interest_paid', label: 'INTEREST PAID BACK', enabled: true },
  { id: 'total_repaid', label: 'TOTAL AMOUNT REPAID BACK (P + I)', enabled: true },
  { id: 'outstanding_loans', label: 'OUTSTANDING LOANS (P+I)', enabled: true },
  { id: 'guarantor_name', label: 'GURANTOR NAME', enabled: true },
  { id: 'guarantor_id', label: 'GURANTOR ID NO / CHASS NO / CHG NO', enabled: true },
  { id: 'guarantor_tel', label: 'GUARANTOR TEL NUMBER', enabled: true },
  { id: 'loan_status', label: 'LOAN STATUS', enabled: true },
];

export function ReconcileTab() {
  const { loans, clients, repayments, loanProducts } = useData();
  const [columns, setColumns] = useState(ALL_COLUMNS);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

  // Calculate reconciliation data
  const reconciliationData = useMemo(() => {
    // ✅ FIX: Apply same filtering as Cash Flow Analysis
    // Only include loans that have been disbursed (Active, Disbursed, Default, Paid, Closed)
    // Exclude Pending, Rejected, Draft statuses
    const disbursedLoanStatuses = ['Active', 'Disbursed', 'Default', 'Paid', 'Closed'];
    
    // Debug: Log the filtering logic
    console.log('=== FILTERING LOGIC ===');
    const filteredLoans = loans.filter(loan => {
      // Filter to match Cash Flow Analysis criteria EXACTLY
      const status = (loan.status || '').toLowerCase().trim();
      const hasValidStatus = disbursedLoanStatuses.includes(loan.status);
      const hasDisbursementDate = !!loan.disbursementDate;
      const isNotRejected = status !== 'rejected';
      
      // ✅ Match Cash Flow: (status in list OR has disbursement date) AND not rejected
      const includeThisLoan = (hasValidStatus || hasDisbursementDate) && isNotRejected;
      
      if (includeThisLoan) {
        console.log('Including loan:', {
          id: loan.id?.substring(0, 8),
          status: loan.status,
          principal: loan.principalAmount,
          disbursementDate: loan.disbursementDate,
          reason: hasValidStatus ? 'valid status' : 'has disbursement date'
        });
      }
      
      return includeThisLoan;
    });
    
    console.log(`Total loans after filtering: ${filteredLoans.length} out of ${loans.length}`);
    
    return filteredLoans.map(loan => {
      const client = clients.find(c => c.id === loan.clientId);
      const loanRepayments = repayments.filter(r => r.loanId === loan.id);
      const product = loanProducts.find(p => p.id === loan.productId);
      
      // Get the principal amount - try multiple possible field names
      const loanPrincipal = loan.principalAmount || loan.amount || loan.loanAmount || loan.approvedAmount || 0;
      
      // Get interest rate - try multiple possible field names
      const interestRate = loan.interestRate || product?.interestRate || 7.5; // Default to 7.5%
      
      // Get term/duration in months
      let durationMonths = loan.term || loan.loanTerm || loan.termMonths || loan.repaymentTerm || 0;
      if (!durationMonths && loan.disbursementDate && loan.maturityDate) {
        const disbursementDate = new Date(loan.disbursementDate);
        const maturityDate = new Date(loan.maturityDate);
        durationMonths = Math.round((maturityDate.getTime() - disbursementDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
      }
      
      // Calculate total interest
      let loanInterest = loan.totalInterest || loan.interestAmount || 0;
      if (!loanInterest && loanPrincipal > 0 && interestRate > 0) {
        // Calculate based on flat rate interest
        loanInterest = (loanPrincipal * interestRate * durationMonths) / 100;
      }
      
      // Calculate total repayable amount
      const totalLoanAmount = loan.totalRepayable || loan.totalAmount || (loanPrincipal + loanInterest);
      
      // ✅ FIX: Use same repayment source as Cash Flow Analysis
      // Use paidAmount from loans table directly (source of truth)
      const totalRepaid = loan.paidAmount || loan.amountPaid || 0;
      
      // Calculate principal and interest split
      let totalPrincipalPaid = 0;
      let totalInterestPaid = 0;
      
      if (totalRepaid > 0 && totalLoanAmount > 0 && loanPrincipal > 0) {
        // Calculate proportional split based on the loan structure
        const principalRatio = loanPrincipal / totalLoanAmount;
        const interestRatio = loanInterest / totalLoanAmount;
        
        if (totalRepaid <= loanInterest) {
          // If total repaid is less than interest, allocate to interest first
          totalInterestPaid = totalRepaid;
          totalPrincipalPaid = 0;
        } else if (totalRepaid >= totalLoanAmount) {
          // If fully paid, allocate correctly
          totalInterestPaid = loanInterest;
          totalPrincipalPaid = loanPrincipal;
        } else {
          // Partial payment - use proportional allocation
          totalPrincipalPaid = totalRepaid * principalRatio;
          totalInterestPaid = totalRepaid * interestRatio;
        }
      }
      
      // ✅ FIX: Calculate outstanding balance correctly
      // Outstanding should be: Total Disbursed (Principal) - Principal Paid
      // This ensures: Total Disbursed - Total Repaid = Total Outstanding (principal only)
      const outstandingPrincipal = loanPrincipal - totalPrincipalPaid;
      
      // For display purposes, we can show total outstanding including interest
      const totalOutstandingWithInterest = totalLoanAmount - totalRepaid;
      
      // Get processing fee from loan or calculate from product
      const processingFee = loan.processingFee || loan.facilitationFee || loan.processingFeeAmount || 0;
      
      // Get due date - use maturity date or first repayment date
      const dueDate = loan.maturityDate || loan.firstRepaymentDate || loan.dueDate || loan.disbursementDate;
      
      // Get guarantor info (first guarantor if exists)
      const guarantor = loan.guarantors && loan.guarantors.length > 0 ? loan.guarantors[0] : null;
      
      return {
        // Image 3 data
        ifi_number: loan.loanNumber || loan.applicationNumber || loan.id.substring(0, 8),
        date_of_issue: loan.disbursementDate || loan.approvalDate || loan.createdAt,
        borrower_name: client?.name || loan.clientName || 'N/A',
        id_number: client?.idNumber || client?.nationalId || '',
        tel_no: client?.phone || client?.phoneNumber || '',
        cumulative_amount: loanPrincipal,
        processing_fees: processingFee,
        interest_percent: interestRate,
        
        // Image 2 data
        repayment_period: loan.repaymentFrequency || loan.frequency || 'Monthly',
        due_date: dueDate,
        repayment_duration: durationMonths,
        potential_interest: loanInterest,
        
        // Image 1 data
        total_amt_payable: totalLoanAmount,
        principal_paid: totalPrincipalPaid,
        interest_paid: totalInterestPaid,
        total_repaid: totalRepaid,
        outstanding_loans: totalOutstandingWithInterest,
        guarantor_name: guarantor?.name || 'N/A',
        guarantor_id: guarantor?.idNumber || guarantor?.nationalId || 'N/A',
        guarantor_tel: guarantor?.phone || guarantor?.phoneNumber || 'N/A',
        loan_status: loan.status || 'Active',
        
        // Raw loan object for debugging
        _raw: loan,
        _repayments: loanRepayments
      };
    });
  }, [loans, clients, repayments, loanProducts]);

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, enabled: !col.enabled } : col
    ));
  };

  // Handle drag start
  const handleDragStart = (columnId: string) => {
    setDraggedColumnId(columnId);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedColumnId || draggedColumnId === targetColumnId) return;

    const draggedIndex = columns.findIndex(col => col.id === draggedColumnId);
    const targetIndex = columns.findIndex(col => col.id === targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newColumns = [...columns];
    const [draggedColumn] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, draggedColumn);
    
    setColumns(newColumns);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedColumnId(null);
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      // Get enabled columns only
      const enabledColumns = columns.filter(col => col.enabled);
      
      // Prepare data for export with proper formatting
      const exportData = reconciliationData.map(row => {
        const exportRow: any = {};
        enabledColumns.forEach(col => {
          const value = row[col.id as keyof typeof row];
          
          // Format for Excel export
          if (typeof value === 'number') {
            if (col.id.includes('amount') || col.id.includes('paid') || col.id.includes('outstanding') || col.id.includes('fees') || col.id.includes('interest')) {
              // Format currency with 2 decimal places
              exportRow[col.label] = value.toFixed(2);
            } else if (col.id === 'interest_percent') {
              exportRow[col.label] = value.toFixed(2);
            } else if (col.id === 'repayment_duration') {
              exportRow[col.label] = value;
            } else {
              exportRow[col.label] = value.toFixed(2);
            }
          } else if (col.id.includes('date') && typeof value === 'string') {
            exportRow[col.label] = new Date(value).toLocaleDateString();
          } else {
            exportRow[col.label] = value;
          }
        });
        return exportRow;
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      const columnWidths = enabledColumns.map(col => ({
        wch: Math.max(col.label.length, 15)
      }));
      worksheet['!cols'] = columnWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reconciliation Report');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Reconciliation_Report_${timestamp}.xlsx`;

      // Export
      XLSX.writeFile(workbook, filename);
      
      toast.success(`Report exported successfully as ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  // Reset column configuration
  const resetColumns = () => {
    setColumns(ALL_COLUMNS);
    toast.success('Column configuration reset to default');
  };

  const enabledColumns = columns.filter(col => col.enabled);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#111120]">Loan Reconciliation Report</h2>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive loan reconciliation with customizable columns
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowColumnConfig(!showColumnConfig)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Settings2 className="size-4" />
            Configure Columns
          </button>
          
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            disabled={reconciliationData.length === 0}
          >
            <Download className="size-4" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Column Configuration Panel */}
      {showColumnConfig && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-bold text-[#111120]">Customize Report Columns</h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <Eye className="size-3 text-green-600" />
                  <span className="font-semibold text-gray-900">{enabledColumns.length}</span>
                  <span className="text-gray-500">Visible</span>
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1.5">
                  <EyeOff className="size-3 text-gray-400" />
                  <span className="font-semibold text-gray-900">{columns.length - enabledColumns.length}</span>
                  <span className="text-gray-500">Hidden</span>
                </span>
              </div>
            </div>
            <button
              onClick={resetColumns}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 rounded-md border border-gray-300 transition-all"
            >
              <RefreshCw className="size-3" />
              Reset to Default
            </button>
          </div>
          
          {/* Compact Column Grid */}
          <div className="p-3 bg-gray-50/30 space-y-2">
            {/* Borrower Information */}
            <div className="bg-white rounded-md p-2.5 border border-gray-200">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="size-1 bg-blue-600 rounded-full"></div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Borrower Information</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5">
                {columns.filter(col => ['ifi_number', 'date_of_issue', 'borrower_name', 'id_number', 'tel_no'].includes(col.id)).map((column) => (
                  <ColumnConfigCard
                    key={column.id}
                    column={column}
                    draggedColumnId={draggedColumnId}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onToggle={toggleColumn}
                  />
                ))}
              </div>
            </div>

            {/* Loan Details */}
            <div className="bg-white rounded-md p-2.5 border border-gray-200">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="size-1 bg-purple-600 rounded-full"></div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Loan Details</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5">
                {columns.filter(col => ['cumulative_amount', 'processing_fees', 'interest_percent', 'repayment_period', 'due_date', 'repayment_duration', 'potential_interest'].includes(col.id)).map((column) => (
                  <ColumnConfigCard
                    key={column.id}
                    column={column}
                    draggedColumnId={draggedColumnId}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onToggle={toggleColumn}
                  />
                ))}
              </div>
            </div>

            {/* Repayment Tracking */}
            <div className="bg-white rounded-md p-2.5 border border-gray-200">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="size-1 bg-green-600 rounded-full"></div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Repayment Tracking</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5">
                {columns.filter(col => ['total_amt_payable', 'principal_paid', 'interest_paid', 'total_repaid', 'outstanding_loans', 'loan_status'].includes(col.id)).map((column) => (
                  <ColumnConfigCard
                    key={column.id}
                    column={column}
                    draggedColumnId={draggedColumnId}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onToggle={toggleColumn}
                  />
                ))}
              </div>
            </div>

            {/* Guarantor Information */}
            <div className="bg-white rounded-md p-2.5 border border-gray-200">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="size-1 bg-orange-600 rounded-full"></div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Guarantor Information</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5">
                {columns.filter(col => ['guarantor_name', 'guarantor_id', 'guarantor_tel'].includes(col.id)).map((column) => (
                  <ColumnConfigCard
                    key={column.id}
                    column={column}
                    draggedColumnId={draggedColumnId}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onToggle={toggleColumn}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Loans</div>
          <div className="text-2xl font-bold text-[#111120]">{reconciliationData.length}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Disbursed</div>
          <div className="text-2xl font-bold text-green-600">
            KES {reconciliationData.reduce((sum, row) => sum + row.cumulative_amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Repaid</div>
          <div className="text-2xl font-bold text-blue-600">
            KES {reconciliationData.reduce((sum, row) => sum + row.total_repaid, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Outstanding</div>
          <div className="text-2xl font-bold text-orange-600">
            KES {(() => {
              // ✅ FIX: Calculate as simple difference for reconciliation accuracy
              const totalDisbursed = reconciliationData.reduce((sum, row) => sum + row.cumulative_amount, 0);
              const totalRepaid = reconciliationData.reduce((sum, row) => sum + row.total_repaid, 0);
              const outstanding = totalDisbursed - totalRepaid;
              return outstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            })()}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {enabledColumns.map((column) => (
                  <th
                    key={column.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reconciliationData.length === 0 ? (
                <tr>
                  <td
                    colSpan={enabledColumns.length}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No loan data available
                  </td>
                </tr>
              ) : (
                reconciliationData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {enabledColumns.map((column) => {
                      const value = row[column.id as keyof typeof row];
                      
                      // Format value based on column type
                      let displayValue: string | number = value;
                      if (typeof value === 'number') {
                        if (column.id.includes('amount') || column.id.includes('paid') || column.id.includes('outstanding') || column.id.includes('fees') || column.id.includes('interest')) {
                          // Format with 2 decimal places and commas
                          displayValue = `KES ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        } else if (column.id === 'interest_percent') {
                          displayValue = `${value.toFixed(2)}%`;
                        } else if (column.id === 'repayment_duration') {
                          displayValue = `${value}`;
                        } else {
                          displayValue = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        }
                      } else if (column.id.includes('date') && typeof value === 'string') {
                        displayValue = new Date(value).toLocaleDateString();
                      }
                      
                      return (
                        <td
                          key={column.id}
                          className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                        >
                          {displayValue || 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Summary */}
      <div className="text-sm text-gray-600 text-center">
        Showing {reconciliationData.length} loans with {enabledColumns.length} visible columns
      </div>
    </div>
  );
}

// ColumnConfigCard component
function ColumnConfigCard({
  column,
  draggedColumnId,
  onDragStart,
  onDragOver,
  onDragEnd,
  onToggle
}: {
  column: { id: string, label: string, enabled: boolean },
  draggedColumnId: string | null,
  onDragStart: (columnId: string) => void,
  onDragOver: (e: React.DragEvent, targetColumnId: string) => void,
  onDragEnd: () => void,
  onToggle: (columnId: string) => void
}) {
  return (
    <div
      key={column.id}
      draggable
      onDragStart={() => onDragStart(column.id)}
      onDragOver={(e) => onDragOver(e, column.id)}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-1.5 p-2 rounded border transition-all cursor-move ${
        draggedColumnId === column.id
          ? 'border-blue-500 bg-blue-50'
          : column.enabled
          ? 'border-gray-300 bg-white hover:border-gray-400'
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      <GripVertical className="size-3 text-gray-400 flex-shrink-0" />
      
      <span className={`flex-1 text-xs truncate ${column.enabled ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
        {column.label}
      </span>
      
      <button
        onClick={() => onToggle(column.id)}
        className="flex-shrink-0 hover:bg-gray-100 rounded p-0.5 transition-colors"
      >
        {column.enabled ? (
          <Eye className="size-3 text-green-600" />
        ) : (
          <EyeOff className="size-3 text-gray-400" />
        )}
      </button>
    </div>
  );
}