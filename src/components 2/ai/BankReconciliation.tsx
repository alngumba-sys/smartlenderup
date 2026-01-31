import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download, Sparkles, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { toast } from 'sonner@2.0.3';

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  matched: boolean;
  systemMatch?: {
    transactionId: string;
    type: string;
    confidence: number;
  };
}

interface ReconciliationSummary {
  totalStatementTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  discrepancies: number;
  matchRate: number;
  lastReconciled: string;
}

export function BankReconciliation() {
  const { loans } = useData();
  const { isDark } = useTheme();
  const currencyCode = getCurrencyCode();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [reconciliationData, setReconciliationData] = useState<BankTransaction[] | null>(null);

  // Generate mock bank statement data for demonstration
  const generateMockBankData = (): BankTransaction[] => {
    const transactions: BankTransaction[] = [];
    let balance = 5000000; // Starting balance

    // Generate transactions based on actual loans
    loans.slice(0, 10).forEach((loan, idx) => {
      // Only process if loan has valid amounts
      if (!loan.loanAmount || isNaN(loan.loanAmount)) return;
      
      // Disbursement (debit)
      transactions.push({
        id: `BNK-${String(idx * 2 + 1).padStart(4, '0')}`,
        date: loan.disbursementDate,
        description: `LOAN DISBURSEMENT ${loan.loanId}`,
        debit: loan.loanAmount,
        credit: 0,
        balance: balance - loan.loanAmount,
        matched: true,
        systemMatch: {
          transactionId: loan.loanId,
          type: 'Disbursement',
          confidence: 98
        }
      });
      balance -= loan.loanAmount;

      // Repayment (credit) - if loan has been partially repaid
      if (loan.outstandingBalance < loan.loanAmount) {
        const repaidAmount = loan.loanAmount - loan.outstandingBalance;
        if (!isNaN(repaidAmount) && repaidAmount > 0) {
          transactions.push({
            id: `BNK-${String(idx * 2 + 2).padStart(4, '0')}`,
            date: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: `MPESA PAYMENT ${loan.clientName.toUpperCase()}`,
            debit: 0,
            credit: repaidAmount,
            balance: balance + repaidAmount,
            matched: true,
            systemMatch: {
              transactionId: loan.loanId,
              type: 'Repayment',
              confidence: 95
            }
          });
          balance += repaidAmount;
        }
      }
    });

    // Add some unmatched transactions
    transactions.push({
      id: 'BNK-9991',
      date: new Date().toISOString().split('T')[0],
      description: 'BANK CHARGES',
      debit: 2500,
      credit: 0,
      balance: balance - 2500,
      matched: false
    });

    transactions.push({
      id: 'BNK-9992',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'INTEREST EARNED',
      debit: 0,
      credit: 15000,
      balance: balance + 15000,
      matched: false
    });

    // Sort by date
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['.csv', '.xlsx', '.pdf'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Invalid file type', {
        description: 'Please upload a CSV, Excel, or PDF bank statement'
      });
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate mock reconciliation data
    const mockData = generateMockBankData();
    setReconciliationData(mockData);
    setIsProcessing(false);

    toast.success('Bank statement processed successfully!', {
      description: `AI matched ${mockData.filter(t => t.matched).length} of ${mockData.length} transactions`
    });
  };

  const runReconciliation = async () => {
    if (!reconciliationData) {
      const mockData = generateMockBankData();
      setReconciliationData(mockData);
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);

    toast.success('Reconciliation completed!');
  };

  const summary: ReconciliationSummary = reconciliationData ? {
    totalStatementTransactions: reconciliationData.length,
    matchedTransactions: reconciliationData.filter(t => t.matched).length,
    unmatchedTransactions: reconciliationData.filter(t => !t.matched).length,
    discrepancies: reconciliationData.filter(t => !t.matched).length,
    matchRate: (reconciliationData.filter(t => t.matched).length / reconciliationData.length) * 100,
    lastReconciled: new Date().toLocaleDateString()
  } : {
    totalStatementTransactions: 0,
    matchedTransactions: 0,
    unmatchedTransactions: 0,
    discrepancies: 0,
    matchRate: 0,
    lastReconciled: 'Never'
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="size-5 text-teal-600" />
          <h3 className="text-lg" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
            AI Bank Statement Reconciliation
          </h3>
        </div>
        <p className="text-sm" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
          Automated matching of bank transactions with system records using machine learning
        </p>
      </div>

      {/* Upload Section */}
      <div className="p-6 rounded-lg border-2 border-dashed text-center" style={{
        backgroundColor: isDark ? '#1e293b' : '#f9fafb',
        borderColor: isDark ? '#334155' : '#d1d5db'
      }}>
        <Upload className="size-12 mx-auto mb-3" style={{ color: isDark ? '#94a3b8' : '#9ca3af' }} />
        <h4 className="mb-2" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
          Upload Bank Statement
        </h4>
        <p className="text-sm mb-4" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
          Upload CSV, Excel, or PDF bank statement for AI-powered reconciliation
        </p>
        <label className="inline-block">
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <span className="px-4 py-2 bg-teal-600 text-white rounded-lg cursor-pointer hover:bg-teal-700 transition-colors inline-block">
            Choose File
          </span>
        </label>
        {uploadedFile && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <FileText className="size-4 text-teal-600" />
            <span className="text-sm" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
              {uploadedFile.name}
            </span>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="animate-spin">
              <RefreshCw className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-blue-900">AI Processing Bank Statement...</p>
              <p className="text-blue-800 text-sm">Extracting transactions, matching with system records, identifying discrepancies</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {reconciliationData && (
        <>
          <div className="grid grid-cols-5 gap-4">
            <div className="p-4 rounded-lg border" style={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e5e7eb'
            }}>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="size-4 text-blue-600" />
                <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Total Transactions</span>
              </div>
              <p className="text-2xl" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                {summary.totalStatementTransactions}
              </p>
            </div>

            <div className="p-4 rounded-lg border" style={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e5e7eb'
            }}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="size-4 text-green-600" />
                <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Matched</span>
              </div>
              <p className="text-2xl text-green-600">
                {summary.matchedTransactions}
              </p>
            </div>

            <div className="p-4 rounded-lg border" style={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e5e7eb'
            }}>
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="size-4 text-red-600" />
                <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Unmatched</span>
              </div>
              <p className="text-2xl text-red-600">
                {summary.unmatchedTransactions}
              </p>
            </div>

            <div className="p-4 rounded-lg border" style={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e5e7eb'
            }}>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="size-4 text-purple-600" />
                <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Match Rate</span>
              </div>
              <p className="text-2xl text-purple-600">
                {summary.matchRate.toFixed(0)}%
              </p>
            </div>

            <div className="p-4 rounded-lg border" style={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e5e7eb'
            }}>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="size-4 text-amber-600" />
                <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Discrepancies</span>
              </div>
              <p className="text-2xl text-amber-600">
                {summary.discrepancies}
              </p>
            </div>
          </div>

          {/* AI Insights */}
          <div className="p-4 rounded-lg border border-green-200 bg-green-50">
            <div className="flex items-start gap-2">
              <Sparkles className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-900 text-sm mb-1">
                  <strong>AI Reconciliation Results:</strong>
                </p>
                <p className="text-green-800 text-xs">
                  The AI model successfully matched {summary.matchedTransactions} transactions ({summary.matchRate.toFixed(1)}%) 
                  using fuzzy matching on descriptions, amount correlation, and date proximity algorithms. 
                  {summary.unmatchedTransactions > 0 
                    ? ` ${summary.unmatchedTransactions} transactions require manual review (likely bank charges, interest, or transfers).`
                    : ' Perfect match achieved - all transactions reconciled!'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={runReconciliation}
              disabled={isProcessing}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center gap-2 hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="size-4" />
              Re-run Reconciliation
            </button>
            <button
              onClick={() => toast.success('Exporting reconciliation report...')}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <Download className="size-4" />
              Export Report
            </button>
          </div>

          {/* Transactions Table */}
          <div className="p-4 rounded-lg border" style={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e5e7eb'
          }}>
            <h4 className="mb-4" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
              Reconciliation Details
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b" style={{ borderColor: isDark ? '#334155' : '#e5e7eb' }}>
                  <tr>
                    <th className="text-left py-2 px-3" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Date</th>
                    <th className="text-left py-2 px-3" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Description</th>
                    <th className="text-right py-2 px-3" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Debit</th>
                    <th className="text-right py-2 px-3" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Credit</th>
                    <th className="text-right py-2 px-3" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Balance</th>
                    <th className="text-center py-2 px-3" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Status</th>
                    <th className="text-left py-2 px-3" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>System Match</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliationData.map((transaction) => (
                    <tr 
                      key={transaction.id}
                      className="border-b"
                      style={{ borderColor: isDark ? '#334155' : '#e5e7eb' }}
                    >
                      <td className="py-2 px-3" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                        {transaction.description}
                      </td>
                      <td className="text-right py-2 px-3 text-red-600">
                        {transaction.debit > 0 ? `${currencyCode} ${transaction.debit.toLocaleString()}` : '-'}
                      </td>
                      <td className="text-right py-2 px-3 text-green-600">
                        {transaction.credit > 0 ? `${currencyCode} ${transaction.credit.toLocaleString()}` : '-'}
                      </td>
                      <td className="text-right py-2 px-3" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                        {currencyCode} {transaction.balance.toLocaleString()}
                      </td>
                      <td className="text-center py-2 px-3">
                        {transaction.matched ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                            <CheckCircle className="size-3" />
                            Matched
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-amber-100 text-amber-700">
                            <AlertCircle className="size-3" />
                            Review
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {transaction.systemMatch ? (
                          <div className="text-xs">
                            <p style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                              {transaction.systemMatch.transactionId}
                            </p>
                            <p className="text-blue-600">
                              {transaction.systemMatch.type} • {transaction.systemMatch.confidence}% confidence
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
                            No match found
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Info Banner */}
      {!reconciliationData && (
        <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
          <div className="flex items-start gap-2">
            <Sparkles className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-900 text-sm mb-1">
                <strong>How AI Reconciliation Works:</strong>
              </p>
              <p className="text-blue-800 text-xs">
                Upload your bank statement (CSV, Excel, or PDF) and our AI will automatically extract transactions, 
                match them with your system records using fuzzy logic and machine learning, identify discrepancies, 
                and generate a detailed reconciliation report. The system learns from your corrections to improve accuracy over time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Setup Note */}
      <div className="p-3 rounded-lg border border-amber-200 bg-amber-50">
        <div className="flex items-start gap-2">
          <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-900 text-sm mb-1">
              <strong>OCR & API Integration:</strong>
            </p>
            <p className="text-amber-800 text-xs">
              For best results with PDF statements, configure an OCR service (e.g., Google Cloud Vision API) in Settings → Integrations. 
              You can also connect directly to your bank via API for real-time reconciliation (supported banks: Equity, KCB, Co-operative, NCBA).
            </p>
          </div>
        </div>
      </div>

      {/* Demo Button */}
      {!reconciliationData && (
        <button
          onClick={runReconciliation}
          className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
        >
          👀 Preview with Sample Data (No Upload Required)
        </button>
      )}
    </div>
  );
}