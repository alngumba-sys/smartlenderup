import { CheckSquare, XCircle, Clock, User, DollarSign, Filter, AlertTriangle, FileText, UserCircle, X, Info, Building2, Users, ArrowRight, Shield, FileCheck, TrendingUp, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useData } from '../../contexts/DataContext';

interface Approval {
  id: string;
  type: 'loan_application' | 'loan_restructure' | 'loan_writeoff' | 'client_onboarding' | 'disbursement';
  title: string;
  description: string;
  requestedBy: string;
  requestDate: string;
  amount?: number;
  clientId: string;
  clientName: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  approver?: string;
  approvalDate?: string;
  rejectionReason?: string;
  relatedId: string;
  phase: 1 | 2 | 3 | 4 | 5;
  // New fields for 3-phase system
  creditScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

export function Approval1Tab() {
  const { isDark } = useTheme();
  const { approvals: contextApprovals, approveApproval, rejectApproval, clients, loans } = useData();
  const [filterPhase, setFilterPhase] = useState<number | null>(1);
  const [selectedLoans, setSelectedLoans] = useState<Set<string>>(new Set());
  const [filterAmount, setFilterAmount] = useState<{ min: number; max: number }>({ min: 0, max: 100000 });
  const [filterCreditScore, setFilterCreditScore] = useState<number>(0);
  const [filterCustomerType, setFilterCustomerType] = useState<'all' | 'existing' | 'new'>('all');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Convert 5-phase to 3-phase system
  const convertTo3Phase = (originalPhase: number): number => {
    if (originalPhase === 1 || originalPhase === 2) return 1; // Auto-Assessment
    if (originalPhase === 3 || originalPhase === 4) return 2; // Manager Approval
    return 3; // Disbursement
  };

  // Get actual client credit score instead of random mock data
  const enrichedApprovals = contextApprovals.map((approval: any) => {
    // Find the client to get their actual credit score
    const client = clients.find(c => c.id === approval.clientId);
    const creditScore = client?.creditScore || 300; // Default to 300 if no credit score
    
    return {
      ...approval,
      phase3: convertTo3Phase(approval.phase),
      creditScore,
      riskLevel: approval.amount && approval.amount < 500 ? 'low' : 
                 approval.amount && approval.amount < 1500 ? 'medium' : 'high',
    };
  });

  const filteredApprovals = enrichedApprovals.filter((approval: any) => {
    const matchesPhase = filterPhase === null || approval.phase3 === filterPhase;
    const matchesAmount = !approval.amount || (approval.amount >= filterAmount.min && approval.amount <= filterAmount.max);
    const matchesCreditScore = !approval.creditScore || approval.creditScore >= filterCreditScore;
    const matchesStatus = filterPhase === 3 ? approval.status === 'approved' : approval.status === 'pending';
    return matchesPhase && matchesAmount && matchesCreditScore && matchesStatus;
  });

  const phaseCounts = {
    phase1: enrichedApprovals.filter((a: any) => a.phase3 === 1 && a.status === 'pending').length,
    phase2: enrichedApprovals.filter((a: any) => a.phase3 === 2 && a.status === 'pending').length,
    phase3: enrichedApprovals.filter((a: any) => a.phase3 === 3 && a.status === 'approved').length,
    phase4: loans.filter((l: any) => l.status === 'Active' || l.status === 'Disbursed' || l.status === 'In Arrears').length,
  };

  const handleSelectAll = () => {
    if (selectedLoans.size === filteredApprovals.length) {
      setSelectedLoans(new Set());
    } else {
      setSelectedLoans(new Set(filteredApprovals.map((a: any) => a.id)));
    }
  };

  const handleSelectLoan = (id: string) => {
    const newSelected = new Set(selectedLoans);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLoans(newSelected);
  };

  const handleBulkApprove = () => {
    selectedLoans.forEach(id => {
      approveApproval(id, 'Bulk Approval System');
    });
    setSelectedLoans(new Set());
    setShowBulkModal(false);
  };

  const handleBulkReject = () => {
    selectedLoans.forEach(id => {
      rejectApproval(id, rejectionReason);
    });
    setSelectedLoans(new Set());
    setRejectionReason('');
    setShowRejectModal(false);
  };

  const selectedTotal = Array.from(selectedLoans).reduce((sum, id) => {
    const approval = filteredApprovals.find((a: any) => a.id === id);
    return sum + (approval?.amount || 0);
  }, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900">Approval Option 1: 3-Phase Streamlined System</h2>
        <p className="text-gray-600">AI-powered assessment with bulk approval capabilities</p>
      </div>

      {/* 3-Phase Pipeline */}
      <div className="bg-[rgb(17,17,32)] p-6 rounded-lg border border-[#111120]">
        <h3 className="text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="size-5 text-purple-600" />
          Streamlined 3-Phase Approval Pipeline
        </h3>
        
        <div className="flex items-center gap-3">
          {/* Phase 1: Auto-Assessment */}
          <div className="flex-1">
            <div className="bg-blue-900 border-2 border-blue-700 rounded-lg p-4 text-center relative cursor-pointer hover:bg-blue-800 transition-colors">
              <div className="absolute -top-2 -right-2 size-7 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                {phaseCounts.phase1}
              </div>
              <FileCheck className="size-8 text-blue-300 mx-auto mb-2" />
              <p className="text-blue-100 font-bold text-xs mb-1">Phase 1</p>
              <p className="text-blue-200 text-sm font-semibold mb-2">Auto-Assessment</p>
              <div className="mt-2 pt-2 border-t border-blue-700 space-y-1">
                <div className="text-[12px] text-left text-blue-200 leading-tight">
                  • AI Credit Check<br/>
                  • Risk assessment<br/>
                  • Flag high-risk cases
                </div>
              </div>
            </div>
          </div>

          <ArrowRight className="size-6 text-gray-400 flex-shrink-0" strokeWidth={2} />

          {/* Phase 2: Manager Approval */}
          <div className="flex-1">
            <div className="bg-orange-800 border-2 border-orange-600 rounded-lg p-4 text-center relative cursor-pointer hover:bg-orange-700 transition-colors">
              <div className="absolute -top-2 -right-2 size-7 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                {phaseCounts.phase2}
              </div>
              <Shield className="size-8 text-orange-300 mx-auto mb-2" />
              <p className="text-orange-100 font-bold text-xs mb-1">Phase 2</p>
              <p className="text-orange-200 text-sm font-semibold mb-2">Manager Approval</p>
              <div className="mt-2 pt-2 border-t border-orange-600 space-y-1">
                <div className="text-[12px] text-left text-orange-200 leading-tight">
                  • Risk evaluation<br/>
                  • Bulk approval option<br/>
                  • Final authorization
                </div>
              </div>
            </div>
          </div>

          <ArrowRight className="size-6 text-gray-400 flex-shrink-0" strokeWidth={2} />

          {/* Phase 3: Disbursement */}
          <div className="flex-1">
            <div className="bg-emerald-900 border-2 border-emerald-700 rounded-lg p-4 text-center relative cursor-pointer hover:bg-emerald-800 transition-colors">
              <div className="absolute -top-2 -right-2 size-7 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                {phaseCounts.phase3}
              </div>
              <TrendingUp className="size-8 text-emerald-300 mx-auto mb-2" />
              <p className="text-emerald-100 font-bold text-xs mb-1">Phase 3</p>
              <p className="text-emerald-200 text-sm font-semibold mb-2">Disbursement</p>
              <div className="mt-2 pt-2 border-t border-emerald-700 space-y-1">
                <div className="text-[12px] text-left text-emerald-200 leading-tight">
                  • Fund release<br/>
                  • M-Pesa transfer<br/>
                  • Loan activation
                </div>
              </div>
            </div>
          </div>

          <ArrowRight className="size-6 text-gray-400 flex-shrink-0" strokeWidth={2} />

          {/* Phase 4: Live Loans */}
          <div className="flex-1">
            <div className="bg-purple-900 border-2 border-purple-700 rounded-lg p-4 text-center relative cursor-pointer hover:bg-purple-800 transition-colors">
              <CheckCircle className="size-8 text-purple-300 mx-auto mb-2" />
              <p className="text-purple-100 font-bold text-xs mb-1">Phase 4</p>
              <p className="text-purple-200 text-sm font-semibold mb-2">Live Loans</p>
              
              {/* Large number display */}
              <div className="my-3">
                <p className="text-purple-100 text-4xl font-bold">{phaseCounts.phase4}</p>
              </div>
              
              <div className="mt-2 pt-2 border-t border-purple-700 space-y-1">
                <div className="text-[12px] text-left text-purple-200 leading-tight">
                  • Active loans<br/>
                  • In repayment<br/>
                  • Portfolio tracking
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Analysis Summary */}
      <div className="bg-[rgb(17,17,32)] border-2 border-[#2d3748] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <FileCheck className="size-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-gray-100 font-semibold mb-2">📊 Risk Analysis Summary</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#1a1a2e] rounded-lg p-3 border-2 border-emerald-600">
                <p className="text-emerald-400 text-2xl font-bold">{enrichedApprovals.filter((a: any) => a.riskLevel === 'low' && a.status === 'pending').length}</p>
                <p className="text-gray-300 text-sm">Low Risk Loans</p>
                <p className="text-xs text-gray-400 mt-1">Recommended for approval</p>
              </div>
              <div className="bg-[#1a1a2e] rounded-lg p-3 border-2 border-amber-500">
                <p className="text-amber-400 text-2xl font-bold">{enrichedApprovals.filter((a: any) => a.riskLevel === 'medium' && a.status === 'pending').length}</p>
                <p className="text-gray-300 text-sm">Medium Risk</p>
                <p className="text-xs text-gray-400 mt-1">Requires review</p>
              </div>
              <div className="bg-[#1a1a2e] rounded-lg p-3 border-2 border-red-500">
                <p className="text-red-400 text-2xl font-bold">{enrichedApprovals.filter((a: any) => a.riskLevel === 'high' && a.status === 'pending').length}</p>
                <p className="text-gray-300 text-sm">High Risk</p>
                <p className="text-xs text-gray-400 mt-1">Careful review needed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Approval Filters */}
      <div className="bg-[rgb(25,25,41)] p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="text-gray-600 text-sm mb-2 block">Min Amount</label>
            <input
              type="number"
              value={filterAmount.min}
              onChange={(e) => setFilterAmount({ ...filterAmount, min: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-gray-600 text-sm mb-2 block">Max Amount</label>
            <input
              type="number"
              value={filterAmount.max}
              onChange={(e) => setFilterAmount({ ...filterAmount, max: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="100000"
            />
          </div>
          <div>
            <label className="text-gray-600 text-sm mb-2 block">Min Credit Score</label>
            <input
              type="number"
              value={filterCreditScore}
              onChange={(e) => setFilterCreditScore(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-gray-600 text-sm mb-2 block">Customer Type</label>
            <select
              value={filterCustomerType}
              onChange={(e) => setFilterCustomerType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="all">All Customers</option>
              <option value="existing">Existing Only</option>
              <option value="new">New Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Phase Tabs */}
      <div className="bg-[rgb(17,17,32)] rounded-lg p-2 flex items-center gap-2">
        <button
          onClick={() => setFilterPhase(filterPhase === 1 ? null : 1)}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-all flex-1 justify-center ${
            filterPhase === 1 ? 'bg-[#4a5568] text-white' : 'text-gray-400 hover:text-gray-300 hover:bg-[#4a5568]/50'
          }`}
        >
          <FileCheck className="size-4" />
          <span>Phase 1: Auto-Assessment</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">{phaseCounts.phase1}</span>
        </button>
        <button
          onClick={() => setFilterPhase(filterPhase === 2 ? null : 2)}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-all flex-1 justify-center ${
            filterPhase === 2 ? 'bg-[#4a5568] text-white' : 'text-gray-400 hover:text-gray-300 hover:bg-[#4a5568]/50'
          }`}
        >
          <Shield className="size-4" />
          <span>Phase 2: Manager Approval</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-600 text-white">{phaseCounts.phase2}</span>
        </button>
        <button
          onClick={() => setFilterPhase(filterPhase === 3 ? null : 3)}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-all flex-1 justify-center ${
            filterPhase === 3 ? 'bg-[#4a5568] text-white' : 'text-gray-400 hover:text-gray-300 hover:bg-[#4a5568]/50'
          }`}
        >
          <TrendingUp className="size-4" />
          <span>Phase 3: Disbursement</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white">{phaseCounts.phase3}</span>
        </button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedLoans.size > 0 && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-semibold">
                {selectedLoans.size} loan{selectedLoans.size !== 1 ? 's' : ''} selected
              </p>
              <p className="text-gray-600 text-sm">
                Total amount: KES {selectedTotal.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
              >
                <CheckSquare className="size-4" />
                Approve Selected ({selectedLoans.size})
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <XCircle className="size-4" />
                Reject Selected
              </button>
              <button
                onClick={() => setSelectedLoans(new Set())}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approvals Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedLoans.size === filteredApprovals.length && filteredApprovals.length > 0}
                    onChange={handleSelectAll}
                    className="size-4 rounded border-gray-300"
                  />
                </th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Customer</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Amount</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Credit Score</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Risk Level</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Status</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Phase</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApprovals.map((approval: any) => (
                <tr key={approval.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedLoans.has(approval.id)}
                      onChange={() => handleSelectLoan(approval.id)}
                      className="size-4 rounded border-gray-300"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{approval.clientName}</p>
                    <p className="text-gray-500 text-sm">{approval.title}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">KES {approval.amount?.toLocaleString() || 'N/A'}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{approval.creditScore || 'N/A'}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      approval.riskLevel === 'low' ? 'bg-emerald-100 text-emerald-800' :
                      approval.riskLevel === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {approval.riskLevel?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      approval.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      approval.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {approval.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      Phase {approval.phase3}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {approval.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveApproval(approval.id, 'Manager')}
                          className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectApproval(approval.id, 'Manual rejection')}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Approve Confirmation Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Bulk Approval</h3>
            <p className="text-gray-600 mb-4">
              You are about to approve <strong>{selectedLoans.size}</strong> loan applications with a total value of <strong>KES {selectedTotal.toLocaleString()}</strong>.
            </p>
            <p className="text-gray-600 mb-6">This action cannot be undone. Continue?</p>
            <div className="flex gap-3">
              <button
                onClick={handleBulkApprove}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Yes, Approve All
              </button>
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Bulk Rejection</h3>
            <p className="text-gray-600 mb-4">
              You are about to reject <strong>{selectedLoans.size}</strong> loan applications.
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Enter reason for bulk rejection..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBulkReject}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Yes, Reject All
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}