import { X, User, FileCheck, Users, DollarSign, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '../../contexts/NavigationContext';

interface Approval {
  id: string;
  type: 'loan_application' | 'loan_restructure' | 'loan_writeoff' | 'client_onboarding' | 'disbursement' | 'savings_withdrawal';
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
  phase: 1 | 2 | 3 | 4;
}

interface PipelineStageModalProps {
  stageNumber: number;
  approvals: Approval[];
  onClose: () => void;
}

export function PipelineStageModal({ stageNumber, approvals, onClose }: PipelineStageModalProps) {
  const { isDark } = useTheme();
  const { navigateToApproval, navigateToLoan, navigateToSavings } = useNavigation();

  const handleItemClick = (item: any) => {
    // Close modal first
    onClose();
    
    // Navigate based on item type
    if (stageNumber === 5) {
      // Phase 5 - Navigate to loan
      navigateToLoan(item.id);
    } else {
      // Phases 1-4 - Navigate to approval
      navigateToApproval(item.id);
    }
  };

  const stageData = {
    1: {
      name: 'Intake & Preliminary Review',
      subtitle: 'Initial Application Processing',
      icon: User,
      color: 'blue',
      staff: ['Victor Muthama'],
      description: 'First point of contact with the client. Responsible for initial application intake and preliminary assessment.',
      responsibilities: [
        'Help client complete loan application form',
        'Upload and verify KYC documents (ID, proof of residence)',
        'Conduct basic affordability assessment with client',
        'Collect supporting documents (payslips, bank statements)',
        'Take initial photos of business/collateral if applicable',
        'Submit application to Due Diligence phase'
      ]
    },
    2: {
      name: 'Due Diligence & Assessment',
      subtitle: 'Credit Assessment & Risk Scoring',
      icon: FileCheck,
      color: 'indigo',
      staff: ['Victor Muthama', 'Ben Mbuvi'],
      description: 'Performs credit assessment and risk scoring for loan applications.',
      responsibilities: [
        'Character assessment - verify client references and reputation',
        'Capacity analysis - review income sources and cash flow',
        'Capital review - assess existing assets and liabilities',
        'Security/collateral review - evaluate pledged assets',
        'Calculate debt-to-income ratio and repayment capacity',
        'Run AI credit scoring model and assign risk grade'
      ]
    },
    3: {
      name: 'Joint Decision & Terms',
      subtitle: 'Co-Owners Final Approval',
      icon: Users,
      color: 'purple',
      staff: ['Victor Muthama', 'Ben Mbuvi'],
      description: 'Joint review by both co-owners for final approval decision and terms negotiation.',
      responsibilities: [
        'Joint risk review between both co-owners',
        'Final terms negotiation - amount, interest rate, tenure',
        'Approve or reject loan application',
        'Set special conditions if needed',
        'Document decision rationale for audit trail',
        'Send approved applications to Documentation phase'
      ]
    },
    4: {
      name: 'Documentation & Disbursement',
      subtitle: 'Contract Execution & Fund Transfer',
      icon: FileText,
      color: 'emerald',
      staff: ['Victor Muthama', 'Ben Mbuvi'],
      description: 'Final documentation preparation, contract signing, and fund disbursement.',
      responsibilities: [
        'Generate loan contract and agreement documents',
        'Client signs loan agreement with co-owners',
        'Verify M-Pesa details or bank account information',
        'Process fund disbursement via M-Pesa or bank transfer',
        'Send disbursement confirmation SMS to client',
        'Archive all loan documentation and move to servicing'
      ]
    },
    5: {
      name: 'Monitoring & Servicing',
      subtitle: 'Ongoing Loan Management',
      icon: DollarSign,
      color: 'green',
      staff: ['Victor Muthama', 'Ben Mbuvi'],
      description: 'Ongoing monitoring of all active loans, payment tracking, and collections.',
      responsibilities: [
        'Track all loan payments and M-Pesa transactions',
        'Monitor payment schedules and upcoming due dates',
        'Follow-up with clients for upcoming/overdue payments',
        'Handle collections for overdue accounts',
        'Process early repayments and loan closures',
        'Archive completed loans and maintain records'
      ]
    }
  };

  // Active loans for Phase 5
  const activeLoans = [
    { id: 'LOAN-001', client: 'Mr. STEPHEN MULU NZAVI', amount: 55000, status: 'Current' },
    { id: 'LOAN-002', client: 'ROONEY MBANI', amount: 40000, status: 'Current' },
    { id: 'LOAN-003', client: 'ROONEY MBANI', amount: 60000, status: 'Current' },
    { id: 'LOAN-004', client: 'JOSPHAT M MATHEKA', amount: 110000, status: 'Overdue' },
    { id: 'LOAN-005', client: 'BEN MBUVI', amount: 50000, status: 'Current' },
    { id: 'LOAN-006', client: 'NATALIA THOMAS', amount: 35000, status: 'Current' },
    { id: 'LOAN-007', client: 'Saumu Ouma', amount: 22000, status: 'Overdue 90+' },
    { id: 'LOAN-008', client: 'BEN MBUVI', amount: 45000, status: 'Overdue 45d' },
    { id: 'LOAN-009', client: 'ERIC MUTHAMA', amount: 83000, status: 'Current' },
    { id: 'LOAN-010', client: 'Lucy Nyambura', amount: 65000, status: 'Current' },
    { id: 'LOAN-011', client: 'ELIZABETH WAWERU KIDIIGA', amount: 75000, status: 'Current' },
    { id: 'LOAN-012', client: 'ELIZABETH WAWERU KIDIIGA', amount: 110000, status: 'Current' }
  ];

  const stage = stageData[stageNumber as keyof typeof stageData];
  if (!stage) return null;

  const Icon = stage.icon;
  const bgColor = `bg-${stage.color}-50`;
  const borderColor = `border-${stage.color}-300`;
  const textColor = `text-${stage.color}-900`;
  const iconColor = `text-${stage.color}-600`;

  const displayItems = stageNumber === 5 ? activeLoans : approvals;

  return (
    <div className={`fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`${bgColor} border-b-2 ${borderColor} p-6`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 ${bgColor} border-2 ${borderColor} rounded-lg`}>
                <Icon className={`size-8 ${iconColor}`} />
              </div>
              <div>
                <h2 className="text-gray-900 text-2xl mb-1">Stage {stageNumber}: {stage.name}</h2>
                <p className="text-gray-700">{stage.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <X className="size-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-800">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-white mb-2">Stage Description</h3>
            <p className="text-gray-300">{stage.description}</p>
          </div>

          {/* Staff Assigned */}
          <div className="mb-6">
            <h3 className="text-white mb-3 flex items-center gap-2">
              <User className="size-5 text-gray-300" />
              Staff Assigned ({stage.staff.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {stage.staff.map((person, idx) => (
                <div key={idx} className="bg-purple-600 border border-purple-500 rounded-lg px-3 py-1.5 text-sm text-white">
                  {person}
                </div>
              ))}
            </div>
          </div>

          {/* Responsibilities */}
          <div className="mb-6">
            <h3 className="text-white mb-3 flex items-center gap-2">
              <CheckCircle className="size-5 text-gray-300" />
              Key Responsibilities
            </h3>
            <ul className="space-y-2">
              {stage.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span className="text-gray-300">{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pending Applications or Active Loans */}
          <div>
            <h3 className="text-white mb-3 flex items-center gap-2">
              <AlertCircle className="size-5 text-amber-400" />
              {stageNumber === 5 ? `Active Loans (${displayItems.length})` : `Pending Applications (${displayItems.length})`}
            </h3>
            {displayItems.length === 0 ? (
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 text-center">
                <p className="text-gray-400">No items in this phase</p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayItems.map((item: any, idx: number) => (
                  <div key={idx} className="bg-gray-700 border border-gray-600 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleItemClick(item)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold">{item.id}</span>
                        <span className="text-gray-200">{item.clientName || item.client}</span>
                      </div>
                      {item.amount > 0 && (
                        <span className="text-emerald-400 font-bold">KES {item.amount.toLocaleString()}</span>
                      )}
                    </div>
                    {item.description && (
                      <div className="mb-2">
                        <span className="text-gray-300 text-sm">{item.description}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      {item.title && <span className="text-gray-400">{item.title}</span>}
                      {item.requestDate && (
                        <div className="flex items-center gap-2">
                          <Clock className="size-3 text-gray-400" />
                          <span className="text-gray-400">{item.requestDate}</span>
                        </div>
                      )}
                      {item.status && !item.requestDate && (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status.includes('Overdue') ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                    {item.priority && (
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          item.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          Priority: {item.priority}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-600 p-4 bg-gray-800 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {stageNumber === 5 
              ? `Monitoring ${displayItems.length} active loans` 
              : `${displayItems.length} items pending in this phase`}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}