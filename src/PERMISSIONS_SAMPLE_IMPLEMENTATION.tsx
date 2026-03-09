/**
 * SAMPLE IMPLEMENTATION - Granular Permissions in Action
 * 
 * This file demonstrates how to apply granular permissions across
 * various components in the platform.
 */

// ============================================
// EXAMPLE 1: ClientsTab with Permissions
// ============================================

import { useState } from 'react';
import { Plus, Edit2, Trash2, Mail, MessageSquare, Download } from 'lucide-react';
import { usePermissions } from '../contexts/PermissionsContext';
import { PermissionGate, PermissionButton } from '../components/PermissionGate';
import { PERMISSIONS } from '../utils/permissions';
import { toast } from 'sonner';

export function ClientsTabWithPermissions() {
  const { hasPermission, hasAnyPermission } = usePermissions();
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  const handleAddClient = () => {
    if (!hasPermission(PERMISSIONS.CLIENTS.ADD_CLIENT)) {
      toast.error('You don\'t have permission to add clients');
      return;
    }
    setShowNewClientModal(true);
  };

  const handleEditClient = (clientId: string) => {
    if (!hasPermission(PERMISSIONS.CLIENTS.EDIT_CLIENT)) {
      toast.error('You don\'t have permission to edit clients');
      return;
    }
    // Open edit modal
  };

  const handleDeleteClient = (clientId: string) => {
    if (!hasPermission(PERMISSIONS.CLIENTS.DELETE_CLIENT)) {
      toast.error('You don\'t have permission to delete clients');
      return;
    }
    // Confirm and delete
  };

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h2>Client Management</h2>
        
        {/* Add Client Button - Only shows if user has permission */}
        <PermissionButton
          permission={PERMISSIONS.CLIENTS.ADD_CLIENT}
          onClick={handleAddClient}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="size-4 mr-2" />
          Add Client
        </PermissionButton>
      </div>

      {/* Statistics Cards - Conditional based on permissions */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <PermissionGate permission={PERMISSIONS.CLIENTS.VIEW_CLIENT_STATISTICS}>
          <div className="stat-card">
            <h3>Total Clients</h3>
            <p className="text-3xl">245</p>
          </div>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.CLIENTS.VIEW_CLIENT_FINANCIALS}>
          <div className="stat-card">
            <h3>Total Outstanding</h3>
            <p className="text-3xl">KES 5.2M</p>
          </div>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.CLIENTS.VIEW_CLIENT_CREDIT_SCORE}>
          <div className="stat-card">
            <h3>Avg Credit Score</h3>
            <p className="text-3xl">720</p>
          </div>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.CLIENTS.VIEW_CLIENT_STATISTICS}>
          <div className="stat-card">
            <h3>Active Clients</h3>
            <p className="text-3xl">198</p>
          </div>
        </PermissionGate>
      </div>

      {/* Action Buttons - Multiple permissions */}
      <div className="flex gap-2 mb-4">
        <PermissionButton
          permission={PERMISSIONS.CLIENTS.SEND_SMS_TO_CLIENTS}
          className="btn-secondary"
        >
          <MessageSquare className="size-4 mr-2" />
          Send SMS
        </PermissionButton>

        <PermissionButton
          permission={PERMISSIONS.CLIENTS.SEND_EMAIL_TO_CLIENTS}
          className="btn-secondary"
        >
          <Mail className="size-4 mr-2" />
          Send Email
        </PermissionButton>

        <PermissionButton
          permission={PERMISSIONS.CLIENTS.EXPORT_CLIENTS}
          className="btn-secondary"
        >
          <Download className="size-4 mr-2" />
          Export
        </PermissionButton>
      </div>

      {/* Client Table */}
      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            
            {/* Conditional columns based on permissions */}
            <PermissionGate permission={PERMISSIONS.CLIENTS.VIEW_CLIENT_FINANCIALS}>
              <th>Outstanding</th>
            </PermissionGate>
            
            <PermissionGate permission={PERMISSIONS.CLIENTS.VIEW_CLIENT_CREDIT_SCORE}>
              <th>Credit Score</th>
            </PermissionGate>
            
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Sample client row */}
          <tr>
            <td>John Doe</td>
            <td>+254 712 345 678</td>
            
            <PermissionGate permission={PERMISSIONS.CLIENTS.VIEW_CLIENT_FINANCIALS}>
              <td>KES 50,000</td>
            </PermissionGate>
            
            <PermissionGate permission={PERMISSIONS.CLIENTS.VIEW_CLIENT_CREDIT_SCORE}>
              <td>750</td>
            </PermissionGate>
            
            <td className="flex gap-2">
              <PermissionButton
                permission={PERMISSIONS.CLIENTS.EDIT_CLIENT}
                onClick={() => handleEditClient('client-id')}
                className="btn-icon"
              >
                <Edit2 className="size-4" />
              </PermissionButton>
              
              <PermissionButton
                permission={PERMISSIONS.CLIENTS.DELETE_CLIENT}
                onClick={() => handleDeleteClient('client-id')}
                className="btn-icon-danger"
              >
                <Trash2 className="size-4" />
              </PermissionButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// EXAMPLE 2: LoansTab with Permissions
// ============================================

export function LoansTabWithPermissions() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2>Loan Management</h2>
        
        {/* Create Loan Button */}
        <PermissionButton
          permission={PERMISSIONS.LOANS.CREATE_LOAN}
          className="btn-primary"
        >
          <Plus className="size-4 mr-2" />
          Create Loan
        </PermissionButton>
      </div>

      {/* Loan Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <PermissionGate permission={PERMISSIONS.LOANS.VIEW_LOAN_STATISTICS}>
          <div className="stat-card">Active Loans: 120</div>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.LOANS.VIEW_LOAN_AMOUNT}>
          <div className="stat-card">Disbursed: KES 12.5M</div>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.LOANS.VIEW_OUTSTANDING_BALANCE}>
          <div className="stat-card">Outstanding: KES 5.2M</div>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.LOANS.VIEW_LOAN_STATISTICS}>
          <div className="stat-card">Default Rate: 2.3%</div>
        </PermissionGate>
      </div>

      {/* Loan Table with conditional columns */}
      <table className="w-full mt-6">
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Client</th>
            
            <PermissionGate permission={PERMISSIONS.LOANS.VIEW_LOAN_AMOUNT}>
              <th>Amount</th>
            </PermissionGate>
            
            <PermissionGate permission={PERMISSIONS.LOANS.VIEW_OUTSTANDING_BALANCE}>
              <th>Outstanding</th>
            </PermissionGate>
            
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>LN001</td>
            <td>John Doe</td>
            
            <PermissionGate permission={PERMISSIONS.LOANS.VIEW_LOAN_AMOUNT}>
              <td>KES 100,000</td>
            </PermissionGate>
            
            <PermissionGate permission={PERMISSIONS.LOANS.VIEW_OUTSTANDING_BALANCE}>
              <td>KES 50,000</td>
            </PermissionGate>
            
            <td>Active</td>
            <td className="flex gap-2">
              <PermissionButton
                permission={PERMISSIONS.LOANS.EDIT_LOAN}
                className="btn-icon"
              >
                <Edit2 className="size-4" />
              </PermissionButton>
              
              <PermissionButton
                permissions={[
                  PERMISSIONS.LOANS.DISBURSE_LOAN,
                  PERMISSIONS.APPROVALS.APPROVE_PHASE_5
                ]}
                requireAll={true}
                className="btn-success"
              >
                Disburse
              </PermissionButton>
              
              <PermissionButton
                permission={PERMISSIONS.LOANS.DELETE_LOAN}
                className="btn-icon-danger"
              >
                <Trash2 className="size-4" />
              </PermissionButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// EXAMPLE 3: ApprovalsTab with Phase Permissions
// ============================================

export function ApprovalsTabWithPermissions() {
  const { hasPermission } = usePermissions();

  const handleApprovePhase = (phase: number, loanId: string) => {
    const permissionMap = {
      1: PERMISSIONS.APPROVALS.APPROVE_PHASE_1,
      2: PERMISSIONS.APPROVALS.APPROVE_PHASE_2,
      3: PERMISSIONS.APPROVALS.APPROVE_PHASE_3,
      4: PERMISSIONS.APPROVALS.APPROVE_PHASE_4,
      5: PERMISSIONS.APPROVALS.APPROVE_PHASE_5,
    };

    const permission = permissionMap[phase as keyof typeof permissionMap];
    
    if (!hasPermission(permission)) {
      toast.error(`You don't have permission to approve Phase ${phase}`);
      return;
    }

    // Proceed with approval
    toast.success(`Loan approved for Phase ${phase}`);
  };

  return (
    <div>
      <h2 className="mb-4">Loan Approvals</h2>

      {/* Approval Pipeline */}
      <div className="space-y-4">
        {/* Phase 1: Client Submission */}
        <div className="approval-card">
          <h3>Phase 1: Client Submission</h3>
          <p>12 loans pending review</p>
          
          <PermissionButton
            permission={PERMISSIONS.APPROVALS.APPROVE_PHASE_1}
            onClick={() => handleApprovePhase(1, 'loan-id')}
            className="btn-primary mt-2"
          >
            Approve Phase 1
          </PermissionButton>
        </div>

        {/* Phase 2: Credit Check */}
        <div className="approval-card">
          <h3>Phase 2: Credit Check</h3>
          <p>8 loans awaiting credit verification</p>
          
          <PermissionButton
            permission={PERMISSIONS.APPROVALS.APPROVE_PHASE_2}
            onClick={() => handleApprovePhase(2, 'loan-id')}
            className="btn-primary mt-2"
          >
            Approve Phase 2
          </PermissionButton>
        </div>

        {/* Phase 3: Manager Review */}
        <div className="approval-card">
          <h3>Phase 3: Manager Review</h3>
          <p>5 loans pending manager approval</p>
          
          <PermissionButton
            permission={PERMISSIONS.APPROVALS.APPROVE_PHASE_3}
            onClick={() => handleApprovePhase(3, 'loan-id')}
            className="btn-primary mt-2"
          >
            Approve Phase 3
          </PermissionButton>
        </div>

        {/* Phase 4: Final Approval (Admin only) */}
        <div className="approval-card">
          <h3>Phase 4: Final Approval</h3>
          <p>3 loans awaiting final approval</p>
          
          <PermissionButton
            permission={PERMISSIONS.APPROVALS.APPROVE_PHASE_4}
            onClick={() => handleApprovePhase(4, 'loan-id')}
            className="btn-primary mt-2"
          >
            Approve Phase 4
          </PermissionButton>
          
          {/* Show message if user lacks permission */}
          <PermissionGate 
            permission={PERMISSIONS.APPROVALS.APPROVE_PHASE_4}
            showDenied={!hasPermission(PERMISSIONS.APPROVALS.APPROVE_PHASE_4)}
          >
            <p className="text-sm text-red-600 mt-2">
              Only Admins can approve Phase 4
            </p>
          </PermissionGate>
        </div>

        {/* Phase 5: Disbursement */}
        <div className="approval-card">
          <h3>Phase 5: Disbursement</h3>
          <p>2 loans ready for disbursement</p>
          
          <PermissionButton
            permissions={[
              PERMISSIONS.APPROVALS.APPROVE_PHASE_5,
              PERMISSIONS.LOANS.DISBURSE_LOAN
            ]}
            requireAll={true}
            onClick={() => handleApprovePhase(5, 'loan-id')}
            className="btn-success mt-2"
          >
            Approve & Disburse
          </PermissionButton>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 4: BankAccountsTab with Permissions
// ============================================

export function BankAccountsTabWithPermissions() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2>Bank Accounts</h2>
        
        <PermissionButton
          permission={PERMISSIONS.BANK_ACCOUNTS.ADD_BANK_ACCOUNT}
          className="btn-primary"
        >
          <Plus className="size-4 mr-2" />
          Add Bank Account
        </PermissionButton>
      </div>

      {/* Bank Account Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bank-card">
          <h3>KCB Bank</h3>
          <p className="text-sm text-gray-600">Account: ****1234</p>
          
          {/* Conditionally show balance */}
          <PermissionGate permission={PERMISSIONS.BANK_ACCOUNTS.VIEW_ACCOUNT_BALANCE}>
            <p className="text-2xl font-bold mt-2">KES 2,345,678.50</p>
          </PermissionGate>
          
          <PermissionGate 
            permission={PERMISSIONS.BANK_ACCOUNTS.VIEW_ACCOUNT_BALANCE}
            fallback={<p className="text-sm text-gray-500 mt-2">Balance hidden</p>}
          />

          <div className="flex gap-2 mt-4">
            <PermissionButton
              permission={PERMISSIONS.BANK_ACCOUNTS.VIEW_TRANSACTIONS}
              className="btn-secondary text-sm"
            >
              View Transactions
            </PermissionButton>
            
            <PermissionButton
              permission={PERMISSIONS.BANK_ACCOUNTS.RECONCILE_ACCOUNT}
              className="btn-secondary text-sm"
            >
              Reconcile
            </PermissionButton>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <PermissionGate permission={PERMISSIONS.BANK_ACCOUNTS.VIEW_TRANSACTIONS}>
        <div className="mt-6">
          <h3 className="mb-4">Recent Transactions</h3>
          
          <table className="w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                
                <PermissionGate permission={PERMISSIONS.BANK_ACCOUNTS.VIEW_TRANSACTION_DETAILS}>
                  <th>Amount</th>
                </PermissionGate>
                
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026-03-04</td>
                <td>Loan Disbursement - John Doe</td>
                <td>Debit</td>
                
                <PermissionGate permission={PERMISSIONS.BANK_ACCOUNTS.VIEW_TRANSACTION_DETAILS}>
                  <td className="text-red-600">- KES 100,000</td>
                </PermissionGate>
                
                <td className="flex gap-2">
                  <PermissionButton
                    permission={PERMISSIONS.BANK_ACCOUNTS.EDIT_TRANSACTION}
                    className="btn-icon"
                  >
                    <Edit2 className="size-4" />
                  </PermissionButton>
                  
                  <PermissionButton
                    permission={PERMISSIONS.BANK_ACCOUNTS.DELETE_TRANSACTION}
                    className="btn-icon-danger"
                  >
                    <Trash2 className="size-4" />
                  </PermissionButton>
                  
                  <PermissionButton
                    permission={PERMISSIONS.BANK_ACCOUNTS.MARK_REVIEWED}
                    className="btn-icon-success"
                  >
                    ✓
                  </PermissionButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </PermissionGate>
    </div>
  );
}

// ============================================
// EXAMPLE 5: AccountingTab with Permissions
// ============================================

export function AccountingTabWithPermissions() {
  return (
    <div>
      <h2 className="mb-4">Accounting</h2>

      {/* Financial Statements - Tab Navigation */}
      <div className="tabs mb-6">
        <PermissionGate permission={PERMISSIONS.ACCOUNTING.VIEW_INCOME_STATEMENT}>
          <button className="tab">Income Statement</button>
        </PermissionGate>
        
        <PermissionGate permission={PERMISSIONS.ACCOUNTING.VIEW_BALANCE_SHEET}>
          <button className="tab">Balance Sheet</button>
        </PermissionGate>
        
        <PermissionGate permission={PERMISSIONS.ACCOUNTING.VIEW_CASH_FLOW}>
          <button className="tab">Cash Flow</button>
        </PermissionGate>
        
        <PermissionGate permission={PERMISSIONS.ACCOUNTING.VIEW_TRIAL_BALANCE}>
          <button className="tab">Trial Balance</button>
        </PermissionGate>
      </div>

      {/* Journal Entries */}
      <PermissionGate permission={PERMISSIONS.ACCOUNTING.VIEW_JOURNAL_ENTRIES}>
        <div className="journal-section">
          <div className="flex justify-between mb-4">
            <h3>Journal Entries</h3>
            
            <PermissionButton
              permission={PERMISSIONS.ACCOUNTING.CREATE_JOURNAL_ENTRY}
              className="btn-primary"
            >
              <Plus className="size-4 mr-2" />
              New Entry
            </PermissionButton>
          </div>

          <table className="w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026-03-04</td>
                <td>Loan Disbursement</td>
                <td>KES 100,000</td>
                <td>-</td>
                <td className="flex gap-2">
                  <PermissionButton
                    permission={PERMISSIONS.ACCOUNTING.EDIT_JOURNAL_ENTRY}
                    className="btn-icon"
                  >
                    <Edit2 className="size-4" />
                  </PermissionButton>
                  
                  <PermissionButton
                    permission={PERMISSIONS.ACCOUNTING.DELETE_JOURNAL_ENTRY}
                    className="btn-icon-danger"
                  >
                    <Trash2 className="size-4" />
                  </PermissionButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </PermissionGate>

      {/* Chart of Accounts */}
      <PermissionGate permission={PERMISSIONS.ACCOUNTING.VIEW_CHART_OF_ACCOUNTS}>
        <div className="mt-6">
          <div className="flex justify-between mb-4">
            <h3>Chart of Accounts</h3>
            
            <PermissionButton
              permission={PERMISSIONS.ACCOUNTING.ADD_ACCOUNT}
              className="btn-secondary"
            >
              Add Account
            </PermissionButton>
          </div>

          {/* Accounts list would go here */}
        </div>
      </PermissionGate>

      {/* Export Reports */}
      <PermissionGate permission={PERMISSIONS.ACCOUNTING.EXPORT_FINANCIAL_REPORTS}>
        <div className="mt-6">
          <PermissionButton className="btn-success">
            <Download className="size-4 mr-2" />
            Export Financial Reports
          </PermissionButton>
        </div>
      </PermissionGate>
    </div>
  );
}

// ============================================
// EXAMPLE 6: Dashboard with Permission-Based Metrics
// ============================================

export function DashboardWithPermissions() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      <h1 className="mb-6">Dashboard</h1>

      {/* Metrics Grid - Conditional display */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <PermissionGate permission={PERMISSIONS.DASHBOARD.VIEW_METRICS}>
          <div className="metric-card">
            <h3>Total Clients</h3>
            <p className="text-3xl">245</p>
          </div>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.DASHBOARD.VIEW_PORTFOLIO_SUMMARY}>
          <div className="metric-card">
            <h3>Portfolio Value</h3>
            <p className="text-3xl">KES 12.5M</p>
          </div>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.DASHBOARD.VIEW_DISBURSEMENT_STATS}>
          <div className="metric-card">
            <h3>Disbursed (MTD)</h3>
            <p className="text-3xl">KES 2.8M</p>
          </div>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.DASHBOARD.VIEW_COLLECTION_STATS}>
          <div className="metric-card">
            <h3>Collections (MTD)</h3>
            <p className="text-3xl">KES 1.5M</p>
          </div>
        </PermissionGate>
      </div>

      {/* PAR Metrics - Sensitive data */}
      <PermissionGate permission={PERMISSIONS.DASHBOARD.VIEW_PAR_METRICS}>
        <div className="par-section mb-6">
          <h3 className="mb-4">Portfolio at Risk</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="metric-card">
              <h4>PAR 30</h4>
              <p className="text-2xl text-orange-600">2.3%</p>
            </div>
            <div className="metric-card">
              <h4>PAR 60</h4>
              <p className="text-2xl text-red-600">1.1%</p>
            </div>
            <div className="metric-card">
              <h4>PAR 90</h4>
              <p className="text-2xl text-red-800">0.5%</p>
            </div>
          </div>
        </div>
      </PermissionGate>

      {/* Loan Analytics Chart */}
      <PermissionGate permission={PERMISSIONS.DASHBOARD.VIEW_LOAN_ANALYTICS}>
        <div className="chart-section">
          <h3 className="mb-4">Loan Performance</h3>
          {/* Chart component would go here */}
        </div>
      </PermissionGate>

      {/* Export Button */}
      <PermissionButton
        permission={PERMISSIONS.DASHBOARD.EXPORT_DASHBOARD}
        className="btn-secondary mt-6"
      >
        <Download className="size-4 mr-2" />
        Export Dashboard
      </PermissionButton>
    </div>
  );
}

// ============================================
// EXAMPLE 7: Using Permissions Programmatically
// ============================================

export function useClientOperations() {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const canViewClients = hasPermission(PERMISSIONS.CLIENTS.VIEW_CLIENTS);
  const canManageClients = hasAnyPermission([
    PERMISSIONS.CLIENTS.ADD_CLIENT,
    PERMISSIONS.CLIENTS.EDIT_CLIENT,
    PERMISSIONS.CLIENTS.DELETE_CLIENT
  ]);
  const canFullyManageClients = hasAllPermissions([
    PERMISSIONS.CLIENTS.ADD_CLIENT,
    PERMISSIONS.CLIENTS.EDIT_CLIENT,
    PERMISSIONS.CLIENTS.DELETE_CLIENT,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_FINANCIALS
  ]);

  return {
    canViewClients,
    canManageClients,
    canFullyManageClients,
    canAddClient: hasPermission(PERMISSIONS.CLIENTS.ADD_CLIENT),
    canEditClient: hasPermission(PERMISSIONS.CLIENTS.EDIT_CLIENT),
    canDeleteClient: hasPermission(PERMISSIONS.CLIENTS.DELETE_CLIENT),
    canViewFinancials: hasPermission(PERMISSIONS.CLIENTS.VIEW_CLIENT_FINANCIALS),
    canSendCommunications: hasAnyPermission([
      PERMISSIONS.CLIENTS.SEND_SMS_TO_CLIENTS,
      PERMISSIONS.CLIENTS.SEND_EMAIL_TO_CLIENTS
    ])
  };
}

// Usage in component:
export function ClientManagementComponent() {
  const permissions = useClientOperations();

  return (
    <div>
      {permissions.canViewClients && <ClientsList />}
      {permissions.canManageClients && <ManagementTools />}
      {permissions.canSendCommunications && <CommunicationPanel />}
    </div>
  );
}
