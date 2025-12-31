import { CheckSquare, XCircle, Clock, User, DollarSign, Filter, AlertTriangle, FileText, UserCircle, X, Info, Building2, Users, ArrowRight, Shield, FileCheck, TrendingUp, CheckCircle, Zap, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clients } from '../../data/dummyData';
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
  // New fields for 2-phase aggressive system
  creditScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  isRepeatCustomer?: boolean;
  autoEligible?: boolean;
}

export function Approval2Tab() {
  const { isDark } = useTheme();
  const { approvals: contextApprovals, approveApproval, rejectApproval, clients } = useData();
  const [filterPhase, setFilterPhase] = useState<number | null>(1);
  const [selectedLoans, setSelectedLoans] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Convert 5-phase to 2-phase aggressive system
  const convertTo2Phase = (originalPhase: number): number => {
    if (originalPhase === 1 || originalPhase === 2 || originalPhase === 3 || originalPhase === 4) return 1; // Smart Approval
    return 2; // Disbursement
  };

  // Get actual client credit score instead of random mock data
  const enrichedApprovals = contextApprovals.map((approval: any) => {
    // Find the client to get their actual credit score
    const client = clients.find(c => c.id === approval.clientId);
    const creditScore = client?.creditScore || 300; // Default to 300 if no credit score
    const isRepeatCustomer = Math.random() > 0.5;
    const amount = approval.amount || 0;

    return {
      ...approval,
      phase2: convertTo2Phase(approval.phase),
      creditScore,
      isRepeatCustomer,
      riskLevel: amount < 500 ? 'low' : amount < 1500 ? 'medium' : 'high',
    };
  });

  const filteredApprovals = enrichedApprovals.filter((approval: any) => {
    const matchesPhase = filterPhase === null || approval.phase2 === filterPhase;
    const matchesStatus = filterPhase === 2 ? approval.status === 'approved' : approval.status === 'pending';
    return matchesPhase && matchesStatus;
  });

  const phaseCounts = {
    phase1: enrichedApprovals.filter((a: any) => a.phase2 === 1 && a.status === 'pending').length,
    phase2: enrichedApprovals.filter((a: any) => a.phase2 === 2 && a.status === 'approved').length,
  };

  const autoEligibleCount = enrichedApprovals.filter((a: any) => a.autoEligible && a.status === 'pending').length;
  const manualReviewCount = enrichedApprovals.filter((a: any) => !a.autoEligible && a.status === 'pending').length;

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
      approveApproval(id, 'Bulk Approval - Aggressive Mode');
    });
    setSelectedLoans(new Set());
    setShowBulkModal(false);
  };

  const handleAutoApproveAll = () => {
    const autoEligibleIds = enrichedApprovals
      .filter((a: any) => a.autoEligible && a.status === 'pending')
      .map((a: any) => a.id);
    
    autoEligibleIds.forEach(id => {
      approveApproval(id, 'Auto-Approval System');
    });
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
        <h2 className="text-gray-900">Approval Option 2: 2-Phase Aggressive System</h2>
        <p className="text-gray-600">Lightning-fast approvals with smart automation</p>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-amber-900 font-semibold mb-1">⚡ Aggressive Mode Active</h4>
            <p className="text-amber-800 text-sm">This system prioritizes speed over review depth. Recommended for established customers with strong credit history.</p>
          </div>
        </div>
      </div>

      {/* 2-Phase Pipeline */}
      <div className="bg-[rgb(17,17,32)] p-6 rounded-lg border border-[#111120]">
        <h3 className="text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="size-5 text-yellow-500" />
          Lightning-Fast 2-Phase Approval Pipeline
        </h3>
        
        <div className="flex items-center gap-4">
          {/* Phase 1: Smart Approval */}
          <div className="flex-1">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-700 rounded-lg p-6 text-center relative">
              <div className="absolute -top-2 -right-2 size-8 rounded-full bg-amber-500 text-white text-sm flex items-center justify-center font-bold">
                {phaseCounts.phase1}
              </div>
              <Target className="size-10 text-purple-300 mx-auto mb-3" />
              <p className="text-purple-100 font-bold mb-1">Phase 1</p>
              <p className="text-purple-200 text-lg font-semibold mb-3">Smart Approval</p>
              <div className="mt-3 pt-3 border-t border-purple-700 space-y-2">
                <div className="text-xs text-left text-purple-200 leading-relaxed">
                  ✓ AI risk assessment<br/>
                  ✓ Credit score evaluation<br/>
                  ✓ Manual review for all cases<br/>
                  ✓ Combined assessment + authorization
                </div>
                <div className="bg-purple-800 rounded p-2 mt-3">
                  <p className="text-purple-200 text-xs">Pending Review</p>
                  <p className="text-white text-lg font-bold">{phaseCounts.phase1}</p>
                </div>
              </div>
            </div>
          </div>

          <ArrowRight className="size-8 text-gray-400 flex-shrink-0" strokeWidth={3} />

          {/* Phase 2: Disbursement */}
          <div className="flex-1">
            <div className="bg-gradient-to-br from-emerald-900 to-teal-900 border-2 border-emerald-700 rounded-lg p-6 text-center relative">
              <div className="absolute -top-2 -right-2 size-8 rounded-full bg-emerald-600 text-white text-sm flex items-center justify-center font-bold">
                {phaseCounts.phase2}
              </div>
              <TrendingUp className="size-10 text-emerald-300 mx-auto mb-3" />
              <p className="text-emerald-100 font-bold mb-1">Phase 2</p>
              <p className="text-emerald-200 text-lg font-semibold mb-3">Instant Disbursement</p>
              <div className="mt-3 pt-3 border-t border-emerald-700 space-y-2">
                <div className="text-xs text-left text-emerald-200 leading-relaxed">
                  ✓ Immediate fund release<br/>
                  ✓ M-Pesa instant transfer<br/>
                  ✓ Real-time activation<br/>
                  ✓ Automated notifications
                </div>
                <div className="bg-emerald-800 rounded p-2 mt-3">
                  <p className="text-emerald-200 text-xs">Active Loans</p>
                  <p className="text-white text-lg font-bold">{phaseCounts.phase2}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Analysis Summary */}
      <div className="bg-[rgb(17,17,32)] border-2 border-[#2d3748] rounded-lg p-5">
        <h4 className="text-gray-100 font-bold text-lg mb-3">📊 Quick Statistics</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#1a1a2e] rounded-lg p-4 border-2 border-emerald-600">
            <div className="flex items-center justify-between mb-2">
              <p className="text-emerald-400 text-3xl font-bold">{enrichedApprovals.filter((a: any) => a.riskLevel === 'low' && a.status === 'pending').length}</p>
              <CheckCircle className="size-6 text-emerald-500" />
            </div>
            <p className="text-gray-300 text-sm font-semibold">Low Risk Loans</p>
            <p className="text-xs text-gray-400 mt-1">Recommended for approval</p>
          </div>
          <div className="bg-[#1a1a2e] rounded-lg p-4 border-2 border-amber-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-amber-400 text-3xl font-bold">{enrichedApprovals.filter((a: any) => a.riskLevel === 'medium' && a.status === 'pending').length}</p>
              <User className="size-6 text-amber-500" />
            </div>
            <p className="text-gray-300 text-sm font-semibold">Medium Risk</p>
            <p className="text-xs text-gray-400 mt-1">Requires review</p>
          </div>
          <div className="bg-[#1a1a2e] rounded-lg p-4 border-2 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-red-400 text-3xl font-bold">{enrichedApprovals.filter((a: any) => a.riskLevel === 'high' && a.status === 'pending').length}</p>
              <AlertTriangle className="size-6 text-red-500" />
            </div>
            <p className="text-gray-300 text-sm font-semibold">High Risk</p>
            <p className="text-xs text-gray-400 mt-1">Careful review needed</p>
          </div>
        </div>
      </div>

      {/* Phase Tabs */}
      <div className="bg-[rgb(17,17,32)] rounded-lg p-2 flex items-center gap-3">
        <button
          onClick={() => setFilterPhase(filterPhase === 1 ? null : 1)}
          className={`flex items-center gap-2 px-6 py-3 rounded transition-all flex-1 justify-center ${
            filterPhase === 1 ? 'bg-[#4a5568] text-white' : 'text-gray-400 hover:text-gray-300 hover:bg-[#4a5568]/50'
          }`}
        >
          <Target className="size-5" />
          <span className="font-semibold">Phase 1: Smart Approval</span>
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-600 text-white">{phaseCounts.phase1}</span>
        </button>
        <button
          onClick={() => setFilterPhase(filterPhase === 2 ? null : 2)}
          className={`flex items-center gap-2 px-6 py-3 rounded transition-all flex-1 justify-center ${
            filterPhase === 2 ? 'bg-[#4a5568] text-white' : 'text-gray-400 hover:text-gray-300 hover:bg-[#4a5568]/50'
          }`}
        >
          <TrendingUp className="size-5" />
          <span className="font-semibold">Phase 2: Disbursement</span>
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">{phaseCounts.phase2}</span>
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
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Type</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Status</th>
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
                    <p className="text-gray-900 font-semibold">{approval.clientName}</p>
                    <p className="text-gray-500 text-sm">{approval.title}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900 font-semibold">KES {approval.amount?.toLocaleString() || 'N/A'}</p>
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
                      approval.isRepeatCustomer ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {approval.isRepeatCustomer ? 'REPEAT' : 'NEW'}
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
                    {approval.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveApproval(approval.id, 'Manager')}
                          className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectApproval(approval.id, 'Manual rejection')}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold"
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">⚡ Confirm Bulk Approval</h3>
            <p className="text-gray-600 mb-4">
              You are about to approve <strong>{selectedLoans.size}</strong> loan applications with a total value of <strong>KES {selectedTotal.toLocaleString()}</strong>.
            </p>
            <p className="text-gray-600 mb-6">This action will immediately move loans to disbursement. Continue?</p>
            <div className="flex gap-3">
              <button
                onClick={handleBulkApprove}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold"
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