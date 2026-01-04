import { CheckSquare, XCircle, Clock, User, DollarSign, Filter, AlertTriangle, FileText, UserCircle, X, Info, Building2, Users, ArrowRight, Shield, Home, FileCheck, Briefcase, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clients } from '../../data/dummyData';
import { PipelineStageModal } from '../modals/PipelineStageModal';
import { PhaseAdvanceModal, PhaseAdvanceData } from '../modals/PhaseAdvanceModal';
import { DisbursementReminderModal } from '../modals/DisbursementReminderModal';
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
  phase: 1 | 2 | 3 | 4 | 5; // Pipeline phase tracking
}

export function ApprovalsTab() {
  const { isDark } = useTheme();
  const { selectedApprovalId, clearSelection } = useNavigation();
  const { approvals: contextApprovals, approveApproval, rejectApproval, seedSampleApprovals, syncLoansWithApprovals } = useData();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<number | null>(1); // Default to Phase 1
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<Approval | null>(null);
  const [showClientModal, setShowClientModal] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showPipelineStageModal, setShowPipelineStageModal] = useState<number | null>(null);
  const [showPhaseAdvanceModal, setShowPhaseAdvanceModal] = useState<Approval | null>(null);
  const [phaseAdvanceData, setPhaseAdvanceData] = useState<PhaseAdvanceData | null>(null);
  const [showDisbursementReminder, setShowDisbursementReminder] = useState(false);
  const [disbursedLoans, setDisbursedLoans] = useState<Set<string>>(new Set());

  // Sync loans with approvals on mount
  useEffect(() => {
    syncLoansWithApprovals();
  }, []);

  // Handle navigation from pipeline
  useEffect(() => {
    if (selectedApprovalId) {
      setSelectedApproval(selectedApprovalId);
      // Clear the selection after handling it
      setTimeout(() => clearSelection(), 100);
    }
  }, [selectedApprovalId, clearSelection]);

  const approvalsList = contextApprovals;

  const filteredApprovals = approvalsList.filter(approval => {
    const matchesType = filterType === 'all' || approval.type === filterType;
    const matchesPriority = filterPriority === 'all' || approval.priority === filterPriority;
    const matchesPhase = filterPhase === null || approval.phase === filterPhase;
    
    // Phase-specific status filtering:
    // - Phase 5 shows approved loans (active loans)
    // - Other phases show pending loans
    // - If no phase filter is set, respect the status filter
    let matchesStatus;
    if (filterPhase === 5) {
      // Phase 5: Show approved (active) loans
      matchesStatus = approval.status === 'approved';
    } else if (filterPhase !== null) {
      // Phases 1-4: Show pending loans
      matchesStatus = approval.status === 'pending';
    } else {
      // No phase filter: Use the status dropdown filter
      matchesStatus = filterStatus === 'all' || approval.status === filterStatus;
    }
    
    return matchesType && matchesStatus && matchesPriority && matchesPhase;
  }).sort((a, b) => {
    // Sort by request date - newest first (newest at top)
    const dateA = new Date(a.requestDate);
    const dateB = new Date(b.requestDate);
    return dateB.getTime() - dateA.getTime();
  });

  // Check for due disbursements on component mount
  useEffect(() => {
    const checkDueDisbursements = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dueLoans = contextApprovals.filter(approval => {
        // Only check loans in Phase 3 (Approved for Disbursement)
        if (approval.phase !== 3 || approval.status !== 'pending') return false;
        
        // Check if already disbursed
        if (disbursedLoans.has(approval.id)) return false;

        // Check if due (mock implementation - 3 days after request)
        // Parse date string properly to avoid timezone issues
        const [year, month, day] = approval.requestDate.split('-').map(Number);
        const mockReleaseDate = new Date(year, month - 1, day); // month is 0-indexed
        mockReleaseDate.setDate(mockReleaseDate.getDate() + 3);
        mockReleaseDate.setHours(0, 0, 0, 0);
        
        // Normalize both dates to midnight to avoid timezone issues
        const daysPastDue = Math.floor((today.getTime() - mockReleaseDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return daysPastDue >= 0;
      });

      if (dueLoans.length > 0) {
        setShowDisbursementReminder(true);
      }
    };

    checkDueDisbursements();
  }, [contextApprovals, disbursedLoans]);

  const stats = {
    pending: approvalsList.filter(a => a.status === 'pending').length,
    approved: approvalsList.filter(a => a.status === 'approved').length,
    rejected: approvalsList.filter(a => a.status === 'rejected').length,
    urgent: approvalsList.filter(a => a.priority === 'urgent' && a.status === 'pending').length
  };

  // Calculate phase counts dynamically
  const phaseCounts = {
    phase1: approvalsList.filter(a => a.phase === 1 && a.status === 'pending').length,
    phase2: approvalsList.filter(a => a.phase === 2 && a.status === 'pending').length,
    phase3: approvalsList.filter(a => a.phase === 3 && a.status === 'pending').length,
    phase4: approvalsList.filter(a => a.phase === 4 && a.status === 'pending').length,
    phase5: approvalsList.filter(a => a.phase === 5 && a.status === 'approved').length
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      loan_application: 'bg-blue-100 text-blue-800',
      loan_restructure: 'bg-amber-100 text-amber-800',
      loan_writeoff: 'bg-red-100 text-red-800',
      client_onboarding: 'bg-emerald-100 text-emerald-800',
      disbursement: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      loan_application: 'Loan Application',
      loan_restructure: 'Loan Restructure',
      loan_writeoff: 'Loan Write-off',
      client_onboarding: 'Client Onboarding',
      disbursement: 'Disbursement'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPhaseBadge = (phase: number) => {
    const colors = {
      1: 'bg-blue-100 text-blue-800 border-blue-300',
      2: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      3: 'bg-purple-100 text-purple-800 border-purple-300',
      4: 'bg-teal-100 text-teal-800 border-teal-300',
      5: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
    return colors[phase as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getPhaseLabel = (phase: number) => {
    const labels = {
      1: 'Phase 1: Loan Requested',
      2: 'Phase 2: Under Review',
      3: 'Phase 3: Approved for Disbursement',
      4: 'Phase 4: Ready for Disbursing',
      5: 'Phase 5: Active Loan'
    };
    return labels[phase as keyof typeof labels] || `Phase ${phase}`;
  };

  const handleApprove = (approvalId: string) => {
    approveApproval(approvalId, 'Management Team');
  };

  const handleReject = (approvalId: string) => {
    rejectApproval(approvalId, rejectionReason);
    setRejectionReason(''); // Clear the rejection reason
  };

  const handlePhaseAdvanceConfirm = (data: PhaseAdvanceData) => {
    if (showPhaseAdvanceModal) {
      // Pass disbursement data to approveApproval when advancing phases
      const disbursementData = data.releaseDate && data.disbursementMethod && data.sourceOfFunds && data.accountNumber ? {
        releaseDate: data.releaseDate,
        disbursementMethod: data.disbursementMethod,
        sourceOfFunds: data.sourceOfFunds,
        accountNumber: data.accountNumber,
        notes: data.notes
      } : undefined;
      
      approveApproval(showPhaseAdvanceModal.id, 'Management Team', disbursementData);
      setShowPhaseAdvanceModal(null);
    }
  };

  const getNextPhaseName = (currentPhase: number) => {
    const names = {
      1: 'Under Review',
      2: 'Approved for Disbursement',
      3: 'Ready for Disbursing',
      4: 'Active'
    };
    return names[currentPhase as keyof typeof names] || 'Next Phase';
  };

  const getAmountLabel = (phase: number) => {
    const labels = {
      1: 'Requested Amount',
      2: 'Application Amount',
      3: 'Approved Amount',
      4: 'Disbursement Amount',
      5: 'Disbursed Amount'
    };
    return labels[phase as keyof typeof labels] || 'Amount';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900">Approvals & Workflow</h2>
        <p className="text-gray-600">Manage pending approvals and workflow tasks</p>
      </div>

      {/* Loan Approval Pipeline */}
      <div className="bg-[rgb(17,17,32)] p-6 rounded-lg border border-[#111120]">
        <h3 className="text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="size-5 text-purple-600" />
          Loan Approval Pipeline - Complete Workflow (5 Phases)
        </h3>
        
        {/* Responsive container for pipeline - auto-fits to screen */}
        <div className="w-full">
          <div className="flex items-center gap-1 md:gap-2 lg:gap-3">
            {/* Phase 1: Loan Requested */}
            <div className="flex-1 min-w-0">
              <div 
                onClick={() => setShowPipelineStageModal(1)}
                className="bg-blue-900 border-2 border-blue-700 rounded-lg p-2 md:p-3 text-center relative cursor-pointer hover:bg-blue-800 transition-colors"
              >
                <div className="absolute -top-2 -right-2 size-6 md:size-7 rounded-full bg-amber-500 text-white text-[10px] md:text-xs flex items-center justify-center font-bold">
                  {phaseCounts.phase1}
                </div>
                <User className="size-5 md:size-7 text-blue-300 mx-auto mb-1 md:mb-2" />
                <p className="text-blue-100 font-bold text-[10px] md:text-xs mb-0.5">Phase 1</p>
                <p className="text-blue-200 text-[10px] md:text-xs font-semibold mb-1 leading-tight">Loan Requested</p>
                <p className="text-blue-300 text-[8px] md:text-[10px] leading-tight mb-2 hidden md:block">Borrower Submission</p>
                <div className="mt-1 md:mt-2 pt-1 md:pt-2 border-t border-blue-700 space-y-1">
                  <div className="text-[8px] md:text-[9px] text-left text-blue-200 leading-tight hidden lg:block">
                    • Borrower submits loan request<br/>
                    • Status set to Pending<br/>
                    • Initial documentation collected
                  </div>
                  <div className="flex justify-between text-[9px] md:text-[10px] mt-1 md:mt-2 pt-1 border-t border-blue-700">
                    <span className="text-blue-300">Active:</span>
                    <span className="text-blue-100 font-bold">{phaseCounts.phase1}</span>
                  </div>
                </div>
              </div>
            </div>

            <ArrowRight className="size-4 md:size-5 lg:size-6 text-gray-400 flex-shrink-0" strokeWidth={2} />

            {/* Phase 2: Under Review */}
            <div className="flex-1 min-w-0">
              <div 
                onClick={() => setShowPipelineStageModal(2)}
                className="bg-orange-800 border-2 border-orange-600 rounded-lg p-2 md:p-3 text-center relative cursor-pointer hover:bg-orange-700 transition-colors"
              >
                <div className="absolute -top-2 -right-2 size-6 md:size-7 rounded-full bg-amber-500 text-white text-[10px] md:text-xs flex items-center justify-center font-bold">
                  {phaseCounts.phase2}
                </div>
                <FileCheck className="size-5 md:size-7 text-orange-300 mx-auto mb-1 md:mb-2" />
                <p className="text-orange-100 font-bold text-[10px] md:text-xs mb-0.5">Phase 2</p>
                <p className="text-orange-200 text-[10px] md:text-xs font-semibold mb-1 leading-tight">Under Review</p>
                <p className="text-orange-300 text-[8px] md:text-[10px] leading-tight mb-2 hidden md:block">Loan Officer Review</p>
                <div className="mt-1 md:mt-2 pt-1 md:pt-2 border-t border-orange-600 space-y-1">
                  <div className="text-[8px] md:text-[9px] text-left text-orange-200 leading-tight hidden lg:block">
                    • Officer reviews application<br/>
                    • Confirms release date<br/>
                    • Disbursement method & source
                  </div>
                  <div className="flex justify-between text-[9px] md:text-[10px] mt-1 md:mt-2 pt-1 border-t border-orange-600">
                    <span className="text-orange-300">Active:</span>
                    <span className="text-orange-100 font-bold">{phaseCounts.phase2}</span>
                  </div>
                </div>
              </div>
            </div>

            <ArrowRight className="size-4 md:size-5 lg:size-6 text-gray-400 flex-shrink-0" strokeWidth={2} />

            {/* Phase 3: Approved for Disbursement */}
            <div className="flex-1 min-w-0">
              <div 
                onClick={() => setShowPipelineStageModal(3)}
                className="bg-indigo-900 border-2 border-indigo-700 rounded-lg p-2 md:p-3 text-center relative cursor-pointer hover:bg-indigo-800 transition-colors"
              >
                <div className="absolute -top-2 -right-2 size-6 md:size-7 rounded-full bg-amber-500 text-white text-[10px] md:text-xs flex items-center justify-center font-bold">
                  {phaseCounts.phase3}
                </div>
                <Shield className="size-5 md:size-7 text-indigo-300 mx-auto mb-1 md:mb-2" />
                <p className="text-indigo-100 font-bold text-[10px] md:text-xs mb-0.5">Phase 3</p>
                <p className="text-indigo-200 text-[10px] md:text-xs font-semibold mb-1 leading-tight">Approved for Disbursement</p>
                <p className="text-indigo-300 text-[8px] md:text-[10px] leading-tight mb-2 hidden md:block">Authorized for Release</p>
                <div className="mt-1 md:mt-2 pt-1 md:pt-2 border-t border-indigo-700 space-y-1">
                  <div className="text-[8px] md:text-[9px] text-left text-indigo-200 leading-tight hidden lg:block">
                    • Loan approved<br/>
                    • Authorized for release<br/>
                    • Ready for disbursement
                  </div>
                  <div className="flex justify-between text-[9px] md:text-[10px] mt-1 md:mt-2 pt-1 border-t border-indigo-700">
                    <span className="text-indigo-300">Active:</span>
                    <span className="text-indigo-100 font-bold">{phaseCounts.phase3}</span>
                  </div>
                </div>
              </div>
            </div>

            <ArrowRight className="size-4 md:size-5 lg:size-6 text-gray-400 flex-shrink-0" strokeWidth={2} />

            {/* Phase 4: Ready for Disbursing */}
            <div className="flex-1 min-w-0">
              <div 
                onClick={() => setShowPipelineStageModal(4)}
                className="bg-teal-800 border-2 border-teal-600 rounded-lg p-2 md:p-3 text-center relative cursor-pointer hover:bg-teal-700 transition-colors"
              >
                <div className="absolute -top-2 -right-2 size-6 md:size-7 rounded-full bg-amber-500 text-white text-[10px] md:text-xs flex items-center justify-center font-bold">
                  {phaseCounts.phase4}
                </div>
                <DollarSign className="size-5 md:size-7 text-teal-300 mx-auto mb-1 md:mb-2" />
                <p className="text-teal-100 font-bold text-[10px] md:text-xs mb-0.5">Phase 4</p>
                <p className="text-teal-200 text-[10px] md:text-xs font-semibold mb-1 leading-tight">Ready for Disbursing</p>
                <p className="text-teal-300 text-[8px] md:text-[10px] leading-tight mb-2 hidden md:block">Funds to be Released</p>
                <div className="mt-1 md:mt-2 pt-1 md:pt-2 border-t border-teal-600 space-y-1">
                  <div className="text-[8px] md:text-[9px] text-left text-teal-200 leading-tight hidden lg:block">
                    • Processing fee deducted<br/>
                    • Net amount to client<br/>
                    • Final step before active
                  </div>
                  <div className="flex justify-between text-[9px] md:text-[10px] mt-1 md:mt-2 pt-1 border-t border-teal-600">
                    <span className="text-teal-300">Active:</span>
                    <span className="text-teal-100 font-bold">{phaseCounts.phase4}</span>
                  </div>
                </div>
              </div>
            </div>

            <ArrowRight className="size-4 md:size-5 lg:size-6 text-gray-400 flex-shrink-0" strokeWidth={2} />

            {/* Phase 5: Active Loans */}
            <div className="flex-1 min-w-0">
              <div 
                onClick={() => setShowPipelineStageModal(5)}
                className="bg-emerald-900 border-2 border-emerald-700 rounded-lg p-2 md:p-3 text-center relative cursor-pointer hover:bg-emerald-800 transition-colors"
              >
                <div className="absolute -top-2 -right-2 size-6 md:size-7 rounded-full bg-emerald-600 text-white text-[10px] md:text-xs flex items-center justify-center font-bold">
                  {phaseCounts.phase5}
                </div>
                <TrendingUp className="size-5 md:size-7 text-emerald-300 mx-auto mb-1 md:mb-2" />
                <p className="text-emerald-100 font-bold text-[10px] md:text-xs mb-0.5">Phase 5</p>
                <p className="text-emerald-200 text-[10px] md:text-xs font-semibold mb-1 leading-tight">Active Loans</p>
                <p className="text-emerald-300 text-[8px] md:text-[10px] leading-tight mb-2 hidden md:block">Ongoing Monitoring</p>
                <div className="mt-1 md:mt-2 pt-1 md:pt-2 border-t border-emerald-700 space-y-1">
                  <div className="text-[8px] md:text-[9px] text-left text-emerald-200 leading-tight hidden lg:block">
                    • Payment tracking<br/>
                    • Follow-up & collections<br/>
                    • Loan closure & archiving
                  </div>
                  <div className="flex justify-between text-[9px] md:text-[10px] mt-1 md:mt-2 pt-1 border-t border-emerald-700">
                    <span className="text-emerald-300">Active:</span>
                    <span className="text-emerald-100 font-bold">{phaseCounts.phase5} loans</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[rgb(17,17,32)] p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Approvals</p>
              <p className="text-gray-900 text-2xl">{stats.pending}</p>
            </div>
            <Clock className="size-8 text-amber-500" />
          </div>
        </div>
        <div className="bg-[rgb(17,17,32)] p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-gray-900 text-2xl">{stats.approved}</p>
            </div>
            <CheckSquare className="size-8 text-emerald-500" />
          </div>
        </div>
        <div className="bg-[rgb(17,17,32)] p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-gray-900 text-2xl">{stats.rejected}</p>
            </div>
            <XCircle className="size-8 text-red-500" />
          </div>
        </div>
        <div className="bg-[rgb(17,17,32)] p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Urgent Items</p>
              <p className="text-gray-900 text-2xl">{stats.urgent}</p>
            </div>
            <AlertTriangle className="size-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[rgb(25,25,41)] p-4 rounded-lg border border-gray-200 px-[16px] py-[7px]">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-gray-600" />
            <span className="text-gray-700 text-sm">Filters:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Types</option>
              <option value="loan_application">Loan Applications</option>
              <option value="loan_restructure">Loan Restructures</option>
              <option value="loan_writeoff">Loan Write-offs</option>
              <option value="client_onboarding">Client Onboarding</option>
              <option value="disbursement">Disbursements</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Phase Tabs */}
      <div className="bg-[rgb(17,17,32)] rounded-lg p-2 flex items-center justify-between gap-1.5">
        <button
          onClick={() => setFilterPhase(filterPhase === 1 ? null : 1)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all whitespace-nowrap flex-1 justify-center ${
            filterPhase === 1 
              ? 'bg-[#4a5568] text-white' 
              : 'text-gray-400 hover:text-gray-300 hover:bg-[#4a5568]/50'
          }`}
        >
          <User className="size-3.5" />
          <span className="text-[11px]">Phase 1: Loan Requested</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white">
            {phaseCounts.phase1}
          </span>
        </button>

        <button
          onClick={() => setFilterPhase(filterPhase === 2 ? null : 2)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all whitespace-nowrap flex-1 justify-center ${
            filterPhase === 2 
              ? 'bg-[#4a5568] text-white' 
              : 'text-gray-400 hover:text-gray-300 hover:bg-[#4a5568]/50'
          }`}
        >
          <FileCheck className="size-3.5" />
          <span className="text-[11px]">Phase 2: Under Review</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-600 text-white">
            {phaseCounts.phase2}
          </span>
        </button>

        <button
          onClick={() => setFilterPhase(filterPhase === 3 ? null : 3)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all whitespace-nowrap flex-1 justify-center ${
            filterPhase === 3 
              ? 'bg-[#4a5568] text-white' 
              : 'text-gray-400 hover:text-gray-300 hover:bg-[#4a5568]/50'
          }`}
        >
          <Shield className="size-3.5" />
          <span className="text-[11px]">Phase 3: Approved for Disbursement</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-600 text-white">
            {phaseCounts.phase3}
          </span>
        </button>

        <button
          onClick={() => setFilterPhase(filterPhase === 4 ? null : 4)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all whitespace-nowrap flex-1 justify-center ${
            filterPhase === 4 
              ? 'bg-[#4a5568] text-white' 
              : 'text-gray-400 hover:text-gray-300 hover:bg-[#4a5568]/50'
          }`}
        >
          <DollarSign className="size-3.5" />
          <span className="text-[11px]">Phase 4: Ready for Disbursing</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-600 text-white">
            {phaseCounts.phase4}
          </span>
        </button>

        <button
          onClick={() => setFilterPhase(filterPhase === 5 ? null : 5)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all whitespace-nowrap flex-1 justify-center ${
            filterPhase === 5 
              ? 'bg-[#4a5568] text-white' 
              : 'text-gray-400 hover:text-gray-300 hover:bg-[#4a5568]/50'
          }`}
        >
          <TrendingUp className="size-3.5" />
          <span className="text-[11px]">Phase 5: Active Loan</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-white">
            {phaseCounts.phase5}
          </span>
        </button>
      </div>

      {/* Approvals List */}
      <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
        {filteredApprovals.map((approval) => (
          <div
            key={approval.id}
            onClick={() => setSelectedApproval(approval.id === selectedApproval ? null : approval.id)}
            className={`bg-[#2d3748] rounded-lg border cursor-pointer transition-all ${
              approval.priority === 'urgent' ? 'border-red-500' :
              approval.status === 'rejected' ? 'border-gray-600' :
              approval.status === 'approved' ? 'border-emerald-500' :
              'border-gray-600 hover:border-gray-500'
            } ${selectedApproval === approval.id ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="p-3">
              {/* Top row: Title and Amount */}
              <div className="flex items-start justify-between gap-4 mb-0.5">
                <div className="flex-1">
                  <h3 className="text-white text-sm">
                    {approval.title} <span className="text-gray-400">({approval.id})</span>
                  </h3>
                  <p className="text-gray-300 text-xs line-clamp-2">{approval.description}</p>
                </div>
                {approval.amount && (
                  <div className="text-right">
                    <p className="text-gray-400 text-[13px]">{getAmountLabel(approval.phase)}</p>
                    <p className="text-white text-sm text-[15px]">Kshs {approval.amount.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Middle row: Client, Date, Requested By info */}
              <div className="flex items-center gap-3 text-xs text-gray-300 mb-0.5">
                <div className="flex items-center gap-1">
                  <User className="size-3" />
                  <span>Client: {approval.clientName} ({approval.clientId})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>Requested: {approval.requestDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserCircle className="size-3" />
                  <span>By: {approval.requestedBy}</span>
                </div>
              </div>

              {/* Bottom row: Badges and Action Buttons */}
              <div className="flex items-center justify-between gap-3">
                {/* Left: Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded text-xs ${
                    approval.phase === 1 ? 'bg-blue-900/80 text-blue-200' :
                    approval.phase === 2 ? 'bg-indigo-900/80 text-indigo-200' :
                    approval.phase === 3 ? 'bg-purple-900/80 text-purple-200' :
                    approval.phase === 4 ? 'bg-teal-900/80 text-teal-200' :
                    'bg-emerald-900/80 text-emerald-200'
                  }`}>
                    {getPhaseLabel(approval.phase)}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-xs ${
                    approval.status === 'pending' ? 'bg-orange-600 text-white' :
                    approval.status === 'approved' ? 'bg-emerald-600 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {approval.status}
                  </span>
                </div>

                {/* Right: Action Buttons */}
                {approval.status === 'pending' && (
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPhaseAdvanceModal(approval);
                      }}
                      className="px-3 py-1.5 bg-[rgb(0,153,54)] text-white rounded text-xs hover:bg-emerald-700 flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <ArrowRight className="size-3.5" />
                      Advance to {getNextPhaseName(approval.phase)}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRejectModal(approval.id);
                      }}
                      className="px-3 py-1.5 bg-[rgb(157,7,14)] text-white rounded text-xs hover:bg-red-700 flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <XCircle className="size-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>

              {selectedApproval === approval.id && (
                <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                  {approval.status === 'approved' && (
                    <div className="bg-emerald-900/30 p-2 rounded-lg border border-emerald-700">
                      <p className="text-emerald-300 text-xs">
                        <strong>Approved by:</strong> {approval.approver} on {approval.approvalDate}
                      </p>
                    </div>
                  )}

                  {approval.status === 'rejected' && (
                    <div className="bg-red-900/30 p-2 rounded-lg border border-red-700">
                      <p className="text-red-300 text-xs mb-1">
                        <strong>Rejected by:</strong> {approval.approver} on {approval.approvalDate}
                      </p>
                      <p className="text-red-300 text-xs">
                        <strong>Reason:</strong> {approval.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredApprovals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <CheckSquare className="size-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No approvals match your filters</p>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div className={`fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center ${isDark ? 'dark' : ''}`}>
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Approval Details</h3>
              <button
                onClick={() => setShowDetailsModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="size-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-gray-600" />
                <p className="text-gray-700 text-sm">Title: {showDetailsModal.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <UserCircle className="size-4 text-gray-600" />
                <p className="text-gray-700 text-sm">Requested By: {showDetailsModal.requestedBy}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-gray-600" />
                <p className="text-gray-700 text-sm">Request Date: {showDetailsModal.requestDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <User className="size-4 text-gray-600" />
                <p className="text-gray-700 text-sm">Client: {showDetailsModal.clientName} ({showDetailsModal.clientId})</p>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="size-4 text-gray-600" />
                <p className="text-gray-700 text-sm">Amount: KES {showDetailsModal.amount?.toLocaleString() || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-gray-600" />
                <p className="text-gray-700 text-sm">Type: {getTypeLabel(showDetailsModal.type)}</p>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-gray-600" />
                <p className="text-gray-700 text-sm">Priority: {showDetailsModal.priority}</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="size-4 text-gray-600" />
                <p className="text-gray-700 text-sm">Status: {showDetailsModal.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Modal */}
      {showClientModal && (
        <div className={`fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center ${isDark ? 'dark' : ''}`}>
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Client Profile</h3>
              <button
                onClick={() => setShowClientModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="size-4" />
              </button>
            </div>
            <div className="space-y-2">
              {clients.find(client => client.id === showClientModal) && (
                <>
                  <div className="flex items-center gap-2">
                    <UserCircle className="size-4 text-gray-600" />
                    <p className="text-gray-700 text-sm">Name: {clients.find(client => client.id === showClientModal)?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-gray-600" />
                    <p className="text-gray-700 text-sm">ID: {clients.find(client => client.id === showClientModal)?.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-gray-600" />
                    <p className="text-gray-700 text-sm">Description: {clients.find(client => client.id === showClientModal)?.description}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className={`fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center ${isDark ? 'dark' : ''}`}>
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Reject Approval</h3>
              <button
                onClick={() => setShowRejectModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="size-4" />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700 text-sm">Enter rejection reason:</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                rows={4}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  handleReject(showRejectModal);
                  setShowRejectModal(null);
                }}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Stage Modal */}
      {showPipelineStageModal && (
        <PipelineStageModal
          stageNumber={showPipelineStageModal}
          approvals={approvalsList.filter(a => a.phase === showPipelineStageModal && a.status === 'pending')}
          onClose={() => setShowPipelineStageModal(null)}
        />
      )}

      {/* Phase Advance Modal */}
      {showPhaseAdvanceModal && (
        <PhaseAdvanceModal
          onClose={() => setShowPhaseAdvanceModal(null)}
          onConfirm={handlePhaseAdvanceConfirm}
          currentPhase={showPhaseAdvanceModal.phase}
          applicantName={showPhaseAdvanceModal.clientName}
          loanAmount={showPhaseAdvanceModal.amount}
          loanId={showPhaseAdvanceModal.id}
        />
      )}

      {/* Disbursement Reminder Modal */}
      {showDisbursementReminder && (
        <DisbursementReminderModal
          dueLoans={approvalsList
            .filter(approval => {
              // Only check loans in Phase 3 (Approved for Disbursement)
              if (approval.phase !== 3 || approval.status !== 'pending') return false;
              
              // Check if already disbursed
              if (disbursedLoans.has(approval.id)) return false;

              // Check if due (mock implementation - 3 days after request)
              // Parse date string properly to avoid timezone issues
              const [year, month, day] = approval.requestDate.split('-').map(Number);
              const mockReleaseDate = new Date(year, month - 1, day); // month is 0-indexed
              mockReleaseDate.setDate(mockReleaseDate.getDate() + 3);
              mockReleaseDate.setHours(0, 0, 0, 0);
              
              // Normalize both dates to midnight to avoid timezone issues
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              return mockReleaseDate <= today;
            })
            .map(approval => {
              // Parse date string properly to avoid timezone issues
              const [year, month, day] = approval.requestDate.split('-').map(Number);
              const mockReleaseDate = new Date(year, month - 1, day); // month is 0-indexed
              mockReleaseDate.setDate(mockReleaseDate.getDate() + 3);
              mockReleaseDate.setHours(0, 0, 0, 0);
              
              // Normalize today to midnight
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              const daysPastDue = Math.floor((today.getTime() - mockReleaseDate.getTime()) / (1000 * 60 * 60 * 24));
              
              return {
                id: approval.id,
                applicantName: approval.clientName,
                amount: approval.amount || 0,
                releaseDate: mockReleaseDate.toISOString().split('T')[0],
                disbursementMethod: 'mpesa',  // Mock data - would come from phase advance
                sourceOfFunds: 'M-Pesa',      // Mock data - would come from phase advance
                accountNumber: '+254 712 345 678',  // Mock data - would come from phase advance
                daysPastDue: daysPastDue > 0 ? daysPastDue : 0
              };
            })}
          onClose={() => setShowDisbursementReminder(false)}
          onMarkDisbursed={(loanId) => {
            setDisbursedLoans(prev => new Set([...prev, loanId]));
            // Optionally check if there are more loans, if not close the modal
            const remainingLoans = approvalsList.filter(approval => {
              if (approval.phase !== 3 || approval.status !== 'pending') return false;
              if (disbursedLoans.has(approval.id) || approval.id === loanId) return false;
              const mockReleaseDate = new Date(approval.requestDate);
              mockReleaseDate.setDate(mockReleaseDate.getDate() + 3);
              return mockReleaseDate <= new Date();
            });
            
            if (remainingLoans.length === 0) {
              setShowDisbursementReminder(false);
            }
          }}
        />
      )}
    </div>
  );
}