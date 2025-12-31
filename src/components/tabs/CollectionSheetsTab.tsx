import { useState } from 'react';
import { FileText, Calendar, AlertTriangle, Clock, Send, Mail, Phone, Download, Filter, Search, X, CheckCircle, XCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner@2.0.3';
import { getCurrencyCode } from '../../utils/currencyUtils';

export function CollectionSheetsTab() {
  const { isDark } = useTheme();
  const { loans, clients, repayments } = useData();
  const currencyCode = getCurrencyCode();
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'missed' | 'maturity' | 'sms' | 'email'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoans, setSelectedLoans] = useState<string[]>([]);

  // Generate collection sheet data from actual repayments and active loans
  // First, get all approved repayments for the selected date
  const repaymentsForDate = repayments.filter(r => 
    r.paymentDate === selectedDate &&
    r.status === 'Approved'
  );

  // Create a map of loan IDs that have repayments today
  const loansWithRepaymentsToday = new Set(repaymentsForDate.map(r => r.loanId));

  // Get all active loans
  const activeLoans = loans.filter(l => l.status === 'Active' || l.status === 'Disbursed');

  // Combine: loans with repayments today + active loans without repayments
  const todaysCollections = [
    // First, add all loans that have repayments today
    ...repaymentsForDate.map(repayment => {
      const loan = loans.find(l => l.id === repayment.loanId);
      const client = clients.find(c => c.id === loan?.clientId);
      
      return {
        loanId: loan?.id || repayment.loanId,
        clientId: loan?.clientId || '',
        clientName: client?.name || '',
        phoneNumber: client?.phone || '',
        loanAmount: loan?.loanAmount || 0,
        dueAmount: repayment.amount,
        dueDate: selectedDate,
        status: 'Paid',
        paidAmount: repayment.amount,
        paymentMethod: repayment.paymentMethod,
        collectedBy: repayment.receivedBy
      };
    }),
    // Then add active loans that don't have repayments today (pending)
    ...activeLoans
      .filter(loan => !loansWithRepaymentsToday.has(loan.id))
      .map(loan => {
        const client = clients.find(c => c.id === loan.clientId);
        const installmentAmount = loan.installmentAmount || 0;
        
        return {
          loanId: loan.id,
          clientId: loan.clientId,
          clientName: client?.name || '',
          phoneNumber: client?.phone || '',
          loanAmount: loan.loanAmount || 0,
          dueAmount: installmentAmount,
          dueDate: selectedDate,
          status: 'Pending',
          paidAmount: 0,
          paymentMethod: null,
          collectedBy: null
        };
      })
  ];

  // Missed repayments
  const missedRepayments = loans.filter(l => l.daysInArrears > 0).map(loan => {
    const client = clients.find(c => c.id === loan.clientId);
    return {
      loanId: loan.id,
      clientId: loan.clientId,
      clientName: client?.name || '',
      phoneNumber: client?.phone || '',
      loanAmount: loan.amount || 0,
      missedAmount: loan.installmentAmount || 0,
      daysOverdue: loan.daysInArrears || 0,
      lastPaymentDate: '2025-11-15',
      totalArrears: loan.arrears || 0
    };
  });

  // Past maturity date loans
  const pastMaturityLoans = loans
    .filter(loan => {
      // Only include active loans that have passed their maturity date
      if (loan.status !== 'Active' && loan.status !== 'In Arrears') return false;
      
      // Calculate maturity date from disbursement date and tenor
      if (!loan.disbursementDate || !loan.tenor) return false;
      
      const disbursementDate = new Date(loan.disbursementDate);
      const maturityDate = new Date(disbursementDate);
      maturityDate.setMonth(maturityDate.getMonth() + loan.tenor);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      maturityDate.setHours(0, 0, 0, 0);
      
      // Only return loans where today is past the maturity date
      return today > maturityDate;
    })
    .map(loan => {
      const client = clients.find(c => c.id === loan.clientId);
      
      // Calculate actual maturity date
      const disbursementDate = new Date(loan.disbursementDate);
      const maturityDate = new Date(disbursementDate);
      maturityDate.setMonth(maturityDate.getMonth() + loan.tenor);
      
      const today = new Date();
      const daysOverdue = Math.floor((today.getTime() - maturityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        loanId: loan.id,
        clientId: loan.clientId,
        clientName: client?.name || '',
        phoneNumber: client?.phone || '',
        loanAmount: loan.principalAmount || 0,
        outstandingBalance: loan.outstandingBalance || 0,
        maturityDate: maturityDate.toISOString().split('T')[0],
        daysOverdue: Math.max(0, daysOverdue),
        totalArrears: loan.outstandingBalance || 0
      };
    });

  const filteredCollections = todaysCollections.filter(item =>
    item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.loanId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMissed = missedRepayments.filter(item =>
    item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.loanId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPastMaturity = pastMaturityLoans.filter(item =>
    item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.loanId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendSMS = (clientIds?: string[]) => {
    const count = clientIds ? clientIds.length : selectedLoans.length;
    toast.success('SMS Sent Successfully', {
      description: `Payment reminders sent to ${count} client(s)`,
      duration: 5000,
    });
    setSelectedLoans([]);
  };

  const handleSendEmail = (clientIds?: string[]) => {
    const count = clientIds ? clientIds.length : selectedLoans.length;
    toast.success('Emails Sent Successfully', {
      description: `Payment reminders sent to ${count} client(s)`,
      duration: 5000,
    });
    setSelectedLoans([]);
  };

  const toggleLoanSelection = (loanId: string) => {
    setSelectedLoans(prev =>
      prev.includes(loanId) ? prev.filter(id => id !== loanId) : [...prev, loanId]
    );
  };

  const toggleAllLoans = () => {
    if (activeSubTab === 'daily') {
      setSelectedLoans(selectedLoans.length === filteredCollections.length ? [] : filteredCollections.map(c => c.loanId));
    } else if (activeSubTab === 'missed') {
      setSelectedLoans(selectedLoans.length === filteredMissed.length ? [] : filteredMissed.map(m => m.loanId));
    } else if (activeSubTab === 'maturity') {
      setSelectedLoans(selectedLoans.length === filteredPastMaturity.length ? [] : filteredPastMaturity.map(p => p.loanId));
    }
  };

  const handleDownloadSheet = () => {
    let csvContent = '';
    let filename = '';
    
    if (activeSubTab === 'daily') {
      // Daily Collection Sheet CSV
      filename = `daily_collection_sheet_${selectedDate}.csv`;
      csvContent = 'Loan ID,Client ID,Client Name,Phone Number,Loan Amount,Due Amount,Due Date,Status,Paid Amount,Payment Method,Collected By\n';
      filteredCollections.forEach(item => {
        csvContent += `${item.loanId},${item.clientId},"${item.clientName}",${item.phoneNumber},${item.loanAmount},${item.dueAmount},${item.dueDate},${item.status},${item.paidAmount},${item.paymentMethod || ''},${item.collectedBy || ''}\n`;
      });
    } else if (activeSubTab === 'missed') {
      // Missed Repayment Sheet CSV
      filename = `missed_repayment_sheet_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Loan ID,Client ID,Client Name,Phone Number,Loan Amount,Missed Amount,Days Overdue,Last Payment Date,Total Arrears\n';
      filteredMissed.forEach(item => {
        csvContent += `${item.loanId},${item.clientId},"${item.clientName}",${item.phoneNumber},${item.loanAmount},${item.missedAmount},${item.daysOverdue},${item.lastPaymentDate},${item.totalArrears}\n`;
      });
    } else if (activeSubTab === 'maturity') {
      // Past Maturity Date Loans CSV
      filename = `past_maturity_loans_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Loan ID,Client ID,Client Name,Phone Number,Loan Amount,Outstanding Balance,Maturity Date,Days Overdue,Total Arrears\n';
      filteredPastMaturity.forEach(item => {
        csvContent += `${item.loanId},${item.clientId},"${item.clientName}",${item.phoneNumber},${item.loanAmount},${item.outstandingBalance},${item.maturityDate},${item.daysOverdue},${item.totalArrears}\n`;
      });
    }
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Collection Sheet Downloaded', {
      description: `Downloaded ${filename}`,
      duration: 3000,
    });
  };

  const totalDue = todaysCollections.reduce((sum, c) => sum + c.dueAmount, 0);
  const totalCollected = todaysCollections.reduce((sum, c) => sum + c.paidAmount, 0);
  const collectionRate = totalDue > 0 ? ((totalCollected / totalDue) * 100).toFixed(1) : '0';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={isDark ? 'text-white' : 'text-gray-900'}>Collection Sheets</h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Track and manage loan collections and repayments</p>
        </div>
        <button
          onClick={handleDownloadSheet}
          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
        >
          <Download className="size-4" />
          Download Sheet
        </button>
      </div>

      {/* Sub-tabs - Always in one row with horizontal scrolling */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button
          onClick={() => {
            setActiveSubTab('daily');
            setSearchTerm('');
            setSelectedLoans([]);
          }}
          className={`px-4 py-2 flex-shrink-0 ${
            activeSubTab === 'daily'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Daily Collection Sheet
        </button>
        <button
          onClick={() => {
            setActiveSubTab('missed');
            setSearchTerm('');
            setSelectedLoans([]);
          }}
          className={`px-4 py-2 flex-shrink-0 ${
            activeSubTab === 'missed'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Missed Repayment Sheet
        </button>
        <button
          onClick={() => {
            setActiveSubTab('maturity');
            setSearchTerm('');
            setSelectedLoans([]);
          }}
          className={`px-4 py-2 flex-shrink-0 ${
            activeSubTab === 'maturity'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Past Maturity Date Loans
        </button>
        <button
          onClick={() => {
            setActiveSubTab('sms');
            setSearchTerm('');
          }}
          className={`px-4 py-2 flex-shrink-0 ${
            activeSubTab === 'sms'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Send SMS
        </button>
        <button
          onClick={() => {
            setActiveSubTab('email');
            setSearchTerm('');
          }}
          className={`px-4 py-2 flex-shrink-0 ${
            activeSubTab === 'email'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Send Email
        </button>
      </div>

      {/* Daily Collection Sheet */}
      {activeSubTab === 'daily' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Due</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currencyCode} {totalDue.toLocaleString()}
                  </p>
                </div>
                <Calendar className="size-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Collected</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currencyCode} {totalCollected.toLocaleString()}
                  </p>
                </div>
                <CheckCircle className="size-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Collection Rate</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {collectionRate}%
                  </p>
                </div>
                <FileText className="size-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {todaysCollections.filter(c => c.status === 'Pending').length}
                  </p>
                </div>
                <Clock className="size-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className={`size-5 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search by loan ID or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[14px] ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[14px] ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Collection Sheet Table */}
          <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <h3 className={isDark ? 'text-white' : 'text-gray-900'}>
                  Daily Collections - {selectedDate} ({filteredCollections.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={toggleAllLoans}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    {selectedLoans.length === filteredCollections.length ? 'Deselect All' : 'Select All'}
                  </button>
                  {selectedLoans.length > 0 && (
                    <>
                      <button
                        onClick={() => handleSendSMS()}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Phone className="size-3" />
                        SMS ({selectedLoans.length})
                      </button>
                      <button
                        onClick={() => handleSendEmail()}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center gap-1"
                      >
                        <Mail className="size-3" />
                        Email ({selectedLoans.length})
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className={`sticky top-0 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={selectedLoans.length === filteredCollections.length && filteredCollections.length > 0}
                        onChange={toggleAllLoans}
                        className="rounded"
                      />
                    </th>
                    <th className={`px-6 py-3 text-left text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loan ID</th>
                    <th className={`px-6 py-3 text-left text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Client Name</th>
                    <th className={`px-6 py-3 text-left text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</th>
                    <th className={`px-6 py-3 text-right text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Due Amount</th>
                    <th className={`px-6 py-3 text-right text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Paid Amount</th>
                    <th className={`px-6 py-3 text-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                    <th className={`px-6 py-3 text-left text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Payment Method</th>
                    <th className={`px-6 py-3 text-left text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Collected By</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCollections.map((collection) => (
                    <tr key={collection.loanId} className={`border-t ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        <input
                          type="checkbox"
                          checked={selectedLoans.includes(collection.loanId)}
                          onChange={() => toggleLoanSelection(collection.loanId)}
                          className="rounded"
                        />
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{collection.loanId}</td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{collection.clientName}</td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{collection.phoneNumber}</td>
                      <td className={`px-6 py-4 text-right text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {currencyCode} {collection.dueAmount.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 text-right text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {currencyCode} {collection.paidAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          collection.status === 'Paid'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        }`}>
                          {collection.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {collection.paymentMethod || '-'}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {collection.collectedBy || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Missed Repayment Sheet */}
      {activeSubTab === 'missed' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Missed Repayments</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {missedRepayments.length}
                  </p>
                </div>
                <XCircle className="size-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Missed Amount</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currencyCode} {missedRepayments.reduce((sum, m) => sum + m.missedAmount, 0).toLocaleString()}
                  </p>
                </div>
                <AlertTriangle className="size-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Days Overdue</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {missedRepayments.length > 0 
                      ? Math.floor(missedRepayments.reduce((sum, m) => sum + m.daysOverdue, 0) / missedRepayments.length)
                      : 0
                    } days
                  </p>
                </div>
                <Clock className="size-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className={`size-5 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search by loan ID or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[14px] ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Missed Repayments Table */}
          <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <h3 className={isDark ? 'text-white' : 'text-gray-900'}>
                  Missed Repayments ({filteredMissed.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={toggleAllLoans}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    {selectedLoans.length === filteredMissed.length ? 'Deselect All' : 'Select All'}
                  </button>
                  {selectedLoans.length > 0 && (
                    <>
                      <button
                        onClick={() => handleSendSMS()}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Phone className="size-3" />
                        SMS ({selectedLoans.length})
                      </button>
                      <button
                        onClick={() => handleSendEmail()}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center gap-1"
                      >
                        <Mail className="size-3" />
                        Email ({selectedLoans.length})
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className={`sticky top-0 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={selectedLoans.length === filteredMissed.length && filteredMissed.length > 0}
                        onChange={toggleAllLoans}
                        className="rounded"
                      />
                    </th>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loan ID</th>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Client Name</th>
                    <th className={`px-6 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</th>
                    <th className={`px-6 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Missed Amount</th>
                    <th className={`px-6 py-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Days Overdue</th>
                    <th className={`px-6 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Arrears</th>
                    <th className={`px-6 py-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Last Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMissed.map((missed) => (
                    <tr key={missed.loanId} className={`border-t ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        <input
                          type="checkbox"
                          checked={selectedLoans.includes(missed.loanId)}
                          onChange={() => toggleLoanSelection(missed.loanId)}
                          className="rounded"
                        />
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{missed.loanId}</td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{missed.clientName}</td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{missed.phoneNumber}</td>
                      <td className={`px-6 py-4 text-right ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {currencyCode} {missed.missedAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          missed.daysOverdue > 30
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        }`}>
                          {missed.daysOverdue} days
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {currencyCode} {missed.totalArrears.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {missed.lastPaymentDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Past Maturity Date Loans */}
      {activeSubTab === 'maturity' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Past Maturity Loans</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {pastMaturityLoans.length}
                  </p>
                </div>
                <AlertTriangle className="size-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Outstanding</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currencyCode} {pastMaturityLoans.reduce((sum, p) => sum + p.outstandingBalance, 0).toLocaleString()}
                  </p>
                </div>
                <FileText className="size-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Arrears</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currencyCode} {pastMaturityLoans.reduce((sum, p) => sum + p.totalArrears, 0).toLocaleString()}
                  </p>
                </div>
                <AlertTriangle className="size-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className={`size-5 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search by loan ID or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[14px] ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Past Maturity Loans Table */}
          <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <h3 className={isDark ? 'text-white' : 'text-gray-900'}>
                  Past Maturity Date Loans ({filteredPastMaturity.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={toggleAllLoans}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    {selectedLoans.length === filteredPastMaturity.length ? 'Deselect All' : 'Select All'}
                  </button>
                  {selectedLoans.length > 0 && (
                    <>
                      <button
                        onClick={() => handleSendSMS()}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Phone className="size-3" />
                        SMS ({selectedLoans.length})
                      </button>
                      <button
                        onClick={() => handleSendEmail()}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center gap-1"
                      >
                        <Mail className="size-3" />
                        Email ({selectedLoans.length})
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className={`sticky top-0 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={selectedLoans.length === filteredPastMaturity.length && filteredPastMaturity.length > 0}
                        onChange={toggleAllLoans}
                        className="rounded"
                      />
                    </th>
                    <th className={`px-6 py-3 text-left text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loan ID</th>
                    <th className={`px-6 py-3 text-left text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Client Name</th>
                    <th className={`px-6 py-3 text-left text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</th>
                    <th className={`px-6 py-3 text-right text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loan Amount</th>
                    <th className={`px-6 py-3 text-right text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Outstanding Balance</th>
                    <th className={`px-6 py-3 text-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Maturity Date</th>
                    <th className={`px-6 py-3 text-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Days Overdue</th>
                    <th className={`px-6 py-3 text-right text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Arrears</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPastMaturity.map((loan) => (
                    <tr key={loan.loanId} className={`border-t ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        <input
                          type="checkbox"
                          checked={selectedLoans.includes(loan.loanId)}
                          onChange={() => toggleLoanSelection(loan.loanId)}
                          className="rounded"
                        />
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{loan.loanId}</td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{loan.clientName}</td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{loan.phoneNumber}</td>
                      <td className={`px-6 py-4 text-right text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {currencyCode} {loan.loanAmount.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 text-right text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                        {currencyCode} {loan.outstandingBalance.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {loan.maturityDate}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                          {loan.daysOverdue} days
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {currencyCode} {loan.totalArrears.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Send SMS Tab */}
      {activeSubTab === 'sms' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-6">
              <Phone className="size-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Send SMS Reminders</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Send bulk SMS reminders to clients with pending or overdue payments
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Recipients
                </label>
                <select className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}>
                  <option>All clients with pending payments today</option>
                  <option>All clients with missed repayments</option>
                  <option>All clients with past maturity date loans</option>
                  <option>Custom selection</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message Template
                </label>
                <select className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}>
                  <option>Payment Reminder</option>
                  <option>Overdue Notice</option>
                  <option>Final Reminder</option>
                  <option>Custom Message</option>
                </select>
                <textarea
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                  rows={4}
                  placeholder="Enter your message here..."
                  defaultValue="Dear [Client Name], this is a friendly reminder that your loan payment of KES [Amount] is due on [Date]. Please make your payment via M-Pesa to Paybill 123456. Thank you. - SmartLenderUp"
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Available variables: [Client Name], [Amount], [Date], [Loan ID]
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
                <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  <strong>Recipients:</strong> 15 clients | <strong>Cost:</strong> KES 150 (KES 10 per SMS)
                </p>
              </div>

              <button
                onClick={() => handleSendSMS(todaysCollections.filter(c => c.status === 'Pending').map(c => c.clientId))}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Send className="size-5" />
                Send SMS Reminders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Tab */}
      {activeSubTab === 'email' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-6">
              <Mail className="size-8 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Send Email Reminders</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Send bulk email reminders to clients with pending or overdue payments
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Recipients
                </label>
                <select className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}>
                  <option>All clients with pending payments today</option>
                  <option>All clients with missed repayments</option>
                  <option>All clients with past maturity date loans</option>
                  <option>Custom selection</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  defaultValue="Payment Reminder - SmartLenderUp"
                />
              </div>

              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Template
                </label>
                <select className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}>
                  <option>Payment Reminder</option>
                  <option>Overdue Notice</option>
                  <option>Final Reminder</option>
                  <option>Custom Message</option>
                </select>
                <textarea
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                  rows={6}
                  placeholder="Enter your message here..."
                  defaultValue="Dear [Client Name],

This is a friendly reminder that your loan payment of KES [Amount] is due on [Date].

Loan ID: [Loan ID]
Amount Due: KES [Amount]
Due Date: [Date]

Please make your payment via M-Pesa to Paybill 123456, Account Number [Loan ID].

If you have already made the payment, please disregard this message.

Thank you for your continued partnership.

Best regards,
SmartLenderUp Team"
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Available variables: [Client Name], [Amount], [Date], [Loan ID]
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
                <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                  <strong>Recipients:</strong> 15 clients
                </p>
              </div>

              <button
                onClick={() => handleSendEmail(todaysCollections.filter(c => c.status === 'Pending').map(c => c.clientId))}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Send className="size-5" />
                Send Email Reminders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}