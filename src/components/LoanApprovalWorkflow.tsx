import { useState, useEffect } from 'react';
import { FileText, Shield, TrendingUp, DollarSign, CheckCircle, XCircle, AlertTriangle, ArrowRight, Search, Filter, Download, Calendar } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Loan, Client, LoanProduct } from '../types';
import { formatCurrency } from '../utils/currencyUtils';

type LoanPhase = 'pending' | 'auto-assessment' | 'manager-approval' | 'disbursement' | 'active';
type RiskLevel = 'low' | 'medium' | 'high';

interface LoanWithRisk extends Loan {
  riskLevel?: RiskLevel;
  riskScore?: number;
  creditScore?: number;
}

interface ConfirmationModal {
  isOpen: boolean;
  loanId: string;
  type: 'phase1' | 'phase2' | 'phase3';
  loanName?: string;
}

interface DisbursementModal {
  isOpen: boolean;
  loanId: string;
  loanName?: string;
  date: string;
  paymentSource: string;
}

export function LoanApprovalWorkflow() {
  const { loans, clients, loanProducts, updateLoan, bankAccounts } = useData();
  const [selectedPhase, setSelectedPhase] = useState<LoanPhase>('auto-assessment');
  const [selectedLoans, setSelectedLoans] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    minCreditScore: '',
    customerType: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal>({
    isOpen: false,
    loanId: '',
    type: 'phase1'
  });
  const [disbursementModal, setDisbursementModal] = useState<DisbursementModal>({
    isOpen: false,
    loanId: '',
    date: new Date().toISOString().split('T')[0],
    paymentSource: ''
  });
  
  // Get active bank accounts and mobile money accounts from Supabase
  const paymentSources = bankAccounts
    .filter(account => account.status === 'Active')
    .map(account => ({
      id: account.id,
      name: `${account.name}${account.accountNumber ? ` - ${account.accountNumber}` : ''}`,
      balance: account.balance,
      type: account.accountType
    }));
  
  // Calculate risk level for each loan
  const calculateRiskLevel = (loan: Loan, client: Client | undefined): RiskLevel => {
    let riskScore = 0;
    
    // Factor 1: Loan Amount
    if (loan.principalAmount > 100000) riskScore += 30;
    else if (loan.principalAmount > 50000) riskScore += 20;
    else if (loan.principalAmount > 20000) riskScore += 10;
    else riskScore += 5;
    
    // Factor 2: Interest Rate
    if (loan.interestRate > 20) riskScore += 20;
    else if (loan.interestRate > 15) riskScore += 10;
    else riskScore += 5;
    
    // Factor 3: Loan Term
    if (loan.term > 24) riskScore += 15;
    else if (loan.term > 12) riskScore += 10;
    else riskScore += 5;
    
    // Factor 4: Client Age (if available)
    if (client?.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(client.dateOfBirth).getFullYear();
      if (age < 25 || age > 65) riskScore += 20;
      else if (age < 30 || age > 60) riskScore += 10;
      else riskScore += 5;
    }
    
    // Factor 5: Guarantor/Collateral
    if (!loan.guarantorRequired && !loan.collateralRequired) riskScore += 15;
    else if (!loan.guarantorRequired || !loan.collateralRequired) riskScore += 10;
    
    // Determine risk level
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  };
  
  // Enhance loans with risk data
  const loansWithRisk: LoanWithRisk[] = loans.map(loan => {
    const client = clients.find(c => c.id === loan.clientId);
    const riskLevel = calculateRiskLevel(loan, client);
    const riskScore = Math.floor(Math.random() * 100); // Simulated credit score
    const creditScore = Math.floor(500 + Math.random() * 350); // 500-850
    
    return {
      ...loan,
      riskLevel,
      riskScore,
      creditScore
    };
  });
  
  // Map loan status to phases
  const getPhaseFromStatus = (status: string): LoanPhase => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'pending';
    if (statusLower === 'under review') return 'auto-assessment';
    if (statusLower === 'approved') return 'manager-approval';
    if (statusLower === 'disbursed') return 'disbursement';
    if (statusLower === 'active') return 'active';
    return 'pending';
  };
  
  // Filter loans by phase
  const getLoansInPhase = (phase: LoanPhase): LoanWithRisk[] => {
    let filtered = loansWithRisk;
    
    // Filter by phase based on new status names
    if (phase === 'pending') {
      filtered = filtered.filter(l => l.status === 'Pending');
    } else if (phase === 'auto-assessment') {
      // Phase 1: Shows loans with "Pending" OR "Under Review" status
      filtered = filtered.filter(l => l.status === 'Pending' || l.status === 'Under Review');
    } else if (phase === 'manager-approval') {
      // Phase 2: Shows loans with "Need Approval" status
      filtered = filtered.filter(l => l.status === 'Need Approval');
    } else if (phase === 'disbursement') {
      // Phase 3: Shows loans with "Approved" status (ready for disbursement)
      filtered = filtered.filter(l => l.status === 'Approved');
    } else if (phase === 'active') {
      filtered = filtered.filter(l => l.status === 'Active' || l.status === 'Disbursed');
    }
    
    // Apply filters
    if (filters.minAmount) {
      filtered = filtered.filter(l => l.principalAmount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(l => l.principalAmount <= parseFloat(filters.maxAmount));
    }
    if (filters.minCreditScore) {
      filtered = filtered.filter(l => (l.creditScore || 0) >= parseFloat(filters.minCreditScore));
    }
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(l => 
        l.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.clientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  // Get counts for each phase
  const phaseCounts = {
    pending: loansWithRisk.filter(l => l.status === 'Pending').length,
    autoAssessment: loansWithRisk.filter(l => l.status === 'Pending' || l.status === 'Under Review').length,
    managerApproval: loansWithRisk.filter(l => l.status === 'Need Approval').length,
    disbursement: loansWithRisk.filter(l => l.status === 'Approved').length,
    active: loansWithRisk.filter(l => l.status === 'Active' || l.status === 'Disbursed').length,
  };
  
  // Get risk counts
  const riskCounts = {
    low: loansWithRisk.filter(l => 
      l.riskLevel === 'low' && 
      (l.status === 'Pending' || l.status === 'Under Review' || l.status === 'Need Approval' || l.status === 'Approved')
    ).length,
    medium: loansWithRisk.filter(l => 
      l.riskLevel === 'medium' && 
      (l.status === 'Pending' || l.status === 'Under Review' || l.status === 'Need Approval' || l.status === 'Approved')
    ).length,
    high: loansWithRisk.filter(l => 
      l.riskLevel === 'high' && 
      (l.status === 'Pending' || l.status === 'Under Review' || l.status === 'Need Approval' || l.status === 'Approved')
    ).length,
  };
  
  // Handle approval click - opens appropriate modal
  const handleApprovalClick = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;
    
    const loanName = loan.clientName || 'Unknown';
    
    if (loan.status === 'Pending' || loan.status === 'Under Review') {
      // Phase 1: Ask to move to Manager Approval
      setConfirmationModal({
        isOpen: true,
        loanId,
        type: 'phase1',
        loanName
      });
    } else if (loan.status === 'Need Approval') {
      // Phase 2: Confirm Manager Approval (will disburse)
      setConfirmationModal({
        isOpen: true,
        loanId,
        type: 'phase2',
        loanName
      });
    } else if (loan.status === 'Approved') {
      // Phase 3: Ask for disbursement date
      const defaultPaymentSource = paymentSources.length > 0 ? paymentSources[0].id : '';
      setDisbursementModal({
        isOpen: true,
        loanId,
        loanName,
        date: new Date().toISOString().split('T')[0],
        paymentSource: defaultPaymentSource
      });
    }
  };
  
  // Confirm Phase 1 approval
  const confirmPhase1Approval = () => {
    updateLoan(confirmationModal.loanId, {
      status: 'Need Approval'
    });
    setConfirmationModal({ ...confirmationModal, isOpen: false });
  };
  
  // Confirm Phase 2 approval
  const confirmPhase2Approval = () => {
    updateLoan(confirmationModal.loanId, {
      status: 'Approved',
      approvedDate: new Date().toISOString().split('T')[0]
    });
    setConfirmationModal({ ...confirmationModal, isOpen: false });
  };
  
  // Confirm Phase 3 disbursement
  const confirmDisbursement = () => {
    updateLoan(disbursementModal.loanId, {
      status: 'Disbursed',
      disbursementDate: disbursementModal.date,
      paymentSource: disbursementModal.paymentSource
    });
    setDisbursementModal({ ...disbursementModal, isOpen: false });
  };
  
  // Move loan to next phase
  const moveToNextPhase = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;
    
    let newStatus = loan.status;
    
    if (loan.status === 'Pending') {
      newStatus = 'Under Review';
    } else if (loan.status === 'Under Review') {
      newStatus = 'Need Approval';
    } else if (loan.status === 'Need Approval') {
      newStatus = 'Approved';
    } else if (loan.status === 'Approved') {
      newStatus = 'Disbursed';
    } else if (loan.status === 'Disbursed') {
      newStatus = 'Active';
    }
    
    updateLoan(loanId, {
      status: newStatus,
      ...(newStatus === 'Approved' && { approvedDate: new Date().toISOString().split('T')[0] }),
      ...(newStatus === 'Disbursed' && { disbursementDate: new Date().toISOString().split('T')[0] }),
    });
  };
  
  // Bulk approve
  const bulkApprove = () => {
    selectedLoans.forEach(loanId => {
      moveToNextPhase(loanId);
    });
    setSelectedLoans([]);
  };
  
  // Reject loan
  const rejectLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;
    
    updateLoan(loanId, {
      status: 'Rejected'
    });
  };
  
  const currentLoans = getLoansInPhase(selectedPhase);
  
  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <div className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-white">Streamlined 3-Phase Approval Pipeline</h2>
            <p className="text-gray-400 text-sm">Preview</p>
          </div>
        </div>
        
        {/* Pipeline Phases */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Phase 1: Auto-Assessment */}
          <div className="bg-blue-600/20 border-2 border-blue-600 rounded-lg p-5 relative">
            <div className="absolute -top-3 -right-3 bg-yellow-500 text-black rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
              {phaseCounts.autoAssessment}
            </div>
            <Shield className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-white font-semibold mb-1">Phase 1</h3>
            <p className="text-blue-400 text-sm mb-3">Auto-Assessment</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• AI Credit Check</li>
              <li>• Risk assessment</li>
              <li>• Flag high-risk cases</li>
            </ul>
            <ArrowRight className="absolute -right-6 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
          </div>
          
          {/* Phase 2: Manager Approval */}
          <div className="bg-orange-600/20 border-2 border-orange-600 rounded-lg p-5 relative">
            <div className="absolute -top-3 -right-3 bg-yellow-500 text-black rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
              {phaseCounts.managerApproval}
            </div>
            <Shield className="w-8 h-8 text-orange-400 mb-3" />
            <h3 className="text-white font-semibold mb-1">Phase 2</h3>
            <p className="text-orange-400 text-sm mb-3">Manager Approval</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Risk evaluation</li>
              <li>• Bulk approval option</li>
              <li>• Final authorization</li>
            </ul>
            <ArrowRight className="absolute -right-6 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
          </div>
          
          {/* Phase 3: Disbursement */}
          <div className="bg-green-600/20 border-2 border-green-600 rounded-lg p-5 relative">
            <div className="absolute -top-3 -right-3 bg-yellow-500 text-black rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
              {phaseCounts.disbursement}
            </div>
            <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-white font-semibold mb-1">Phase 3</h3>
            <p className="text-green-400 text-sm mb-3">Disbursement</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Fund release</li>
              <li>• M-Pesa transfer</li>
              <li>• Loan activation</li>
            </ul>
            <ArrowRight className="absolute -right-6 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
          </div>
          
          {/* Phase 4: Live Loans */}
          <div className="bg-purple-600/20 border-2 border-purple-600 rounded-lg p-5 relative">
            <CheckCircle className="w-12 h-12 text-purple-400 mb-3 mx-auto" />
            <h3 className="text-white font-semibold mb-1 text-center">Phase 4</h3>
            <p className="text-purple-400 text-sm mb-2 text-center">Live Loans</p>
            <div className="text-4xl font-bold text-white text-center mb-2">{phaseCounts.active}</div>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Active loans</li>
              <li>• In repayment</li>
              <li>• Portfolio tracking</li>
            </ul>
          </div>
        </div>
        
        {/* Risk Analysis Summary */}
        <div className="bg-[#111120] rounded-lg p-5 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Risk Analysis Summary</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Low Risk */}
            <div className="bg-green-900/20 border-2 border-green-600 rounded-lg p-4">
              <div className="text-3xl font-bold text-white mb-1">{riskCounts.low}</div>
              <div className="text-sm text-gray-400 mb-2">Low Risk Loans</div>
              <div className="text-xs text-gray-500">Recommended for approval</div>
            </div>
            
            {/* Medium Risk */}
            <div className="bg-yellow-900/20 border-2 border-yellow-600 rounded-lg p-4">
              <div className="text-3xl font-bold text-white mb-1">{riskCounts.medium}</div>
              <div className="text-sm text-gray-400 mb-2">Medium Risk</div>
              <div className="text-xs text-gray-500">Requires review</div>
            </div>
            
            {/* High Risk */}
            <div className="bg-red-900/20 border-2 border-red-600 rounded-lg p-4">
              <div className="text-3xl font-bold text-white mb-1">{riskCounts.high}</div>
              <div className="text-sm text-gray-400 mb-2">High Risk</div>
              <div className="text-xs text-gray-500">Careful review needed</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-[#1a1a2e] rounded-lg p-4 border border-gray-800">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Min Amount</label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
              className="w-full bg-[#2a2a3e] text-white rounded px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Max Amount</label>
            <input
              type="number"
              value={filters.maxAmount}
              onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
              className="w-full bg-[#2a2a3e] text-white rounded px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="100000"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Min Credit Score</label>
            <input
              type="number"
              value={filters.minCreditScore}
              onChange={(e) => setFilters({ ...filters, minCreditScore: e.target.value })}
              className="w-full bg-[#2a2a3e] text-white rounded px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Customer Type</label>
            <select
              value={filters.customerType}
              onChange={(e) => setFilters({ ...filters, customerType: e.target.value })}
              className="w-full bg-[#2a2a3e] text-white rounded px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Customers</option>
              <option value="new">New Customers</option>
              <option value="returning">Returning Customers</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Phase Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedPhase('auto-assessment')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
            selectedPhase === 'auto-assessment'
              ? 'bg-blue-600 text-white'
              : 'bg-[#2a2a3e] text-gray-400 hover:bg-[#3a3a4e]'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Phase 1: Auto-Assessment</span>
            <span className="bg-yellow-500 text-black rounded-full px-2 py-0.5 text-xs font-bold">
              {phaseCounts.autoAssessment}
            </span>
          </div>
        </button>
        
        <button
          onClick={() => setSelectedPhase('manager-approval')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
            selectedPhase === 'manager-approval'
              ? 'bg-orange-600 text-white'
              : 'bg-[#2a2a3e] text-gray-400 hover:bg-[#3a3a4e]'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Phase 2: Manager Approval</span>
            <span className="bg-yellow-500 text-black rounded-full px-2 py-0.5 text-xs font-bold">
              {phaseCounts.managerApproval}
            </span>
          </div>
        </button>
        
        <button
          onClick={() => setSelectedPhase('disbursement')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
            selectedPhase === 'disbursement'
              ? 'bg-green-600 text-white'
              : 'bg-[#2a2a3e] text-gray-400 hover:bg-[#3a3a4e]'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Phase 3: Disbursement</span>
            <span className="bg-yellow-500 text-black rounded-full px-2 py-0.5 text-xs font-bold">
              {phaseCounts.disbursement}
            </span>
          </div>
        </button>
      </div>
      
      {/* Actions Bar */}
      {selectedLoans.length > 0 && (
        <div className="bg-blue-600 text-white rounded-lg p-4 flex items-center justify-between">
          <span className="font-medium">{selectedLoans.length} loan(s) selected</span>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedLoans([])}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Clear Selection
            </button>
            <button
              onClick={bulkApprove}
              className="px-4 py-2 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Bulk Approve Selected
            </button>
          </div>
        </div>
      )}
      
      {/* Loans Table */}
      <div className="bg-[#1a1a2e] rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#111120] border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLoans.length === currentLoans.length && currentLoans.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLoans(currentLoans.map(l => l.id));
                      } else {
                        setSelectedLoans([]);
                      }
                    }}
                    className="rounded border-gray-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Customer</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Amount</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Credit Score</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Risk Level</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Phase</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {currentLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No loans in this phase
                  </td>
                </tr>
              ) : (
                currentLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-[#2a2a3e] transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedLoans.includes(loan.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLoans([...selectedLoans, loan.id]);
                          } else {
                            setSelectedLoans(selectedLoans.filter(id => id !== loan.id));
                          }
                        }}
                        className="rounded border-gray-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white">{loan.clientName || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{loan.clientId || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 text-white">
                      {formatCurrency(loan.principalAmount)}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {loan.creditScore || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      {loan.riskLevel === 'low' && (
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">
                          Low Risk
                        </span>
                      )}
                      {loan.riskLevel === 'medium' && (
                        <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs">
                          Medium Risk
                        </span>
                      )}
                      {loan.riskLevel === 'high' && (
                        <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs">
                          High Risk
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        loan.status === 'Pending' ? 'bg-yellow-600/20 text-yellow-400' :
                        loan.status === 'Under Review' ? 'bg-blue-600/20 text-blue-400' :
                        loan.status === 'Need Approval' ? 'bg-orange-600/20 text-orange-400' :
                        loan.status === 'Approved' ? 'bg-green-600/20 text-green-400' :
                        loan.status === 'Disbursed' ? 'bg-purple-600/20 text-purple-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white text-sm">
                      {selectedPhase === 'auto-assessment' && 'Phase 1'}
                      {selectedPhase === 'manager-approval' && 'Phase 2'}
                      {selectedPhase === 'disbursement' && 'Phase 3'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprovalClick(loan.id)}
                          className="text-green-400 hover:text-green-300"
                          title="Approve & Move to Next Phase"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => rejectLoan(loan.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Phase 1 Confirmation Modal */}
      {confirmationModal.isOpen && confirmationModal.type === 'phase1' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-800 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
              <h3 className="text-white text-lg">Move to Manager Approval?</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Would you like to move loan for <span className="text-white font-semibold">{confirmationModal.loanName}</span> to Manager for approval?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPhase1Approval}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                Yes, Move to Phase 2
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Phase 2 Confirmation Modal */}
      {confirmationModal.isOpen && confirmationModal.type === 'phase2' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-800 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-white text-lg">Confirm Manager Approval</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Are you sure you want to approve this loan for <span className="text-white font-semibold">{confirmationModal.loanName}</span>? This will move it to the Disbursement phase.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPhase2Approval}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
              >
                Yes, Approve
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Phase 3 Disbursement Date Modal */}
      {disbursementModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-800 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-green-400" />
              <h3 className="text-white text-lg">Enter Disbursement Details</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Enter the disbursement details for <span className="text-white font-semibold">{disbursementModal.loanName}</span>:
            </p>
            
            {paymentSources.length === 0 ? (
              <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-semibold">No Payment Accounts Available</span>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  You need to create at least one bank account or mobile money account before you can disburse loans.
                </p>
                <p className="text-gray-400 text-xs">
                  Please go to <span className="text-blue-400">Accounting → Accounts</span> to add a bank account or mobile money account.
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Payment Source</label>
                  <select
                    value={disbursementModal.paymentSource}
                    onChange={(e) => setDisbursementModal({ ...disbursementModal, paymentSource: e.target.value })}
                    className="w-full bg-[#2a2a3e] text-white rounded px-3 py-2 border border-gray-700 focus:border-green-500 focus:outline-none"
                  >
                    {paymentSources.map(source => (
                      <option key={source.id} value={source.id}>
                        {source.name} - {formatCurrency(source.balance)} Available
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {paymentSources.find(s => s.id === disbursementModal.paymentSource)?.type}
                  </p>
                </div>
                
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Available Balance:</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(paymentSources.find(s => s.id === disbursementModal.paymentSource)?.balance || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Loan Amount:</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(loans.find(l => l.id === disbursementModal.loanId)?.principalAmount || 0)}
                    </span>
                  </div>
                  <div className="h-px bg-blue-600 my-2"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Balance After Disbursement:</span>
                    <span className="text-green-400 font-semibold">
                      {formatCurrency(
                        (paymentSources.find(s => s.id === disbursementModal.paymentSource)?.balance || 0) - 
                        (loans.find(l => l.id === disbursementModal.loanId)?.principalAmount || 0)
                      )}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Disbursement Date</label>
                  <input
                    type="date"
                    value={disbursementModal.date}
                    onChange={(e) => setDisbursementModal({ ...disbursementModal, date: e.target.value })}
                    className="w-full bg-[#2a2a3e] text-white rounded px-3 py-2 border border-gray-700 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setDisbursementModal({ ...disbursementModal, isOpen: false })}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDisbursement}
                disabled={paymentSources.length === 0}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  paymentSources.length === 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                Confirm Disbursement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}