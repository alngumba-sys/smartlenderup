# Data Integration Guide for BV FUNGUO LTD Platform

## Overview
This document outlines the comprehensive data management system implemented to link all components of the BV FUNGUO LTD platform.

## DataContext Architecture

### Core Concept
A centralized `DataContext` (`/contexts/DataContext.tsx`) has been created that:
- Manages all application state in one place
- Provides methods to create, update, and delete records
- Automatically maintains relationships between entities
- Updates related records when changes occur

### Key Features
1. **Automatic Relationship Management**: When a client's name changes, all related loans, payments, and savings accounts are automatically updated
2. **Financial Integrity**: Payments automatically update loan balances; distributions update account entries
3. **Real-time Calculations**: All totals and balances are computed from actual data
4. **Consistent Data Flow**: All components read from and write to the same data source

## Data Models

### Core Entities
- **Clients**: Individual or business clients
- **Loans**: Loan records linked to clients and products
- **Payments**: Payment records linked to loans and clients
- **Savings Accounts**: Savings accounts linked to clients
- **Savings Transactions**: Transactions linked to savings accounts
- **Groups**: Chama/group entities
- **Group Members**: Linking clients to groups
- **Loan Products**: Product definitions

### Accounting Entities
- **Shareholders**: Company shareholders
- **Capital Deposits**: Shareholder capital contributions
- **Profit Distributions**: Profit distribution records
- **Operating Expenses**: Business expenses
- **Account Entries**: Chart of accounts entries
- **Reconciliation Records**: Bank reconciliation records

### Administrative Entities
- **Staff**: Staff members with performance metrics

## How to Use DataContext in Components

### 1. Import the Hook
```typescript
import { useData } from '../contexts/DataContext';
```

### 2. Use in Component
```typescript
export function MyComponent() {
  const { 
    clients, 
    loans, 
    addClient, 
    updateLoan,
    getClientLoans 
  } = useData();
  
  // Use the data and methods
}
```

## Linked Functionality

### ✅ Already Linked

1. **Client → Loans**
   - `getClientLoans(clientId)` returns all loans for a client
   - Client name changes propagate to loans

2. **Client → Payments**
   - `getClientPayments(clientId)` returns all payments by a client
   - Client name changes propagate to payments

3. **Client → Savings**
   - `getClientSavingsAccounts(clientId)` returns all savings accounts for a client

4. **Loan → Payments**
   - `getLoanPayments(loanId)` returns all payments for a loan
   - Adding payment automatically reduces loan outstanding balance
   - Loan status changes to "Fully Paid" when balance reaches zero

5. **Savings Account → Transactions**
   - `getSavingsTransactions(accountId)` returns all transactions
   - Adding transaction automatically updates account balance
   - Updates last transaction date

6. **Group → Members → Clients**
   - `getGroupMembers(groupId)` returns group membership
   - `getGroupClients(groupId)` returns actual client objects
   - Adding member updates client's group affiliation
   - Updates group member count

7. **Shareholder → Capital Deposits**
   - Adding deposit updates shareholder total contribution
   - Updates Share Capital account entry automatically

8. **Accounting Integration**
   - Loans update "Loans Receivable" account
   - Capital deposits update "Share Capital" account
   - All account entries maintain running balances

### Components That Should Use DataContext

#### High Priority - Core Functionality

1. **ClientsTab.tsx**
   - Replace dummy data with `clients` from context
   - Use `addClient`, `updateClient`, `deleteClient`
   - Use `getClientLoans` to show client's loans
   - Display real payment history with `getClientPayments`

2. **LoansTab.tsx**
   - Replace dummy data with `loans` from context
   - Use `addLoan`, `updateLoan`, `deleteLoan`
   - Use `getLoanPayments` to show payment history
   - Use `approveLoan`, `disburseLoan` for workflow

3. **PaymentsTab.tsx**
   - Replace dummy data with `payments` from context
   - Use `addPayment` to record new payments
   - Show M-Pesa transactions from actual payment data
   - Filter by client, loan, date range

4. **SavingsTab.tsx**
   - Use `savingsAccounts` and `savingsTransactions`
   - Use `addSavingsAccount`, `addSavingsTransaction`
   - Show real transaction history per account

5. **GroupsTab.tsx**
   - Use `groups`, `groupMembers`
   - Use `addGroup`, `addGroupMember`
   - Display actual member clients with `getGroupClients`

6. **AccountingTab.tsx** (Partially linked)
   - Already uses shareholders, capital deposits, profit distributions
   - Link to `accountEntries` for trial balance
   - Show real expenses from `operatingExpenses`

7. **LoanReconciliationTab.tsx**
   - Use `reconciliationRecords` from context
   - Link to actual `loans` data for platform balances
   - Use `addReconciliationRecord`, `updateReconciliationRecord`

#### Medium Priority - Enhanced Functionality

8. **DashboardTab.tsx**
   - Calculate metrics from actual data:
     - Total clients: `clients.length`
     - Active loans: `loans.filter(l => l.status === 'Active').length`
     - Total disbursed: `loans.reduce((sum, l) => sum + l.principalAmount, 0)`
     - Collections: `payments.reduce((sum, p) => sum + p.amount, 0)`

9. **ApprovalsTab.tsx**
   - Show loans with `approvalStatus === 'Pending'`
   - Use `approveLoan` to approve loans

10. **StaffManagementTab.tsx**
    - Use `staff` from context
    - Use `addStaff`, `updateStaff`
    - Calculate performance from actual loan and payment data

11. **LoanProductsTab.tsx**
    - Use `loanProducts` from context
    - Use `addLoanProduct`, `updateLoanProduct`
    - Show how many loans use each product

#### Lower Priority - Modals and Details

12. **ClientDetailsModal.tsx**
    - Accept client data from context
    - Show real loans with `getClientLoans`
    - Show real payments with `getClientPayments`
    - Show real savings with `getClientSavingsAccounts`

13. **LoanDetailsModal.tsx**
    - Accept loan data from context
    - Show real payment schedule and history
    - Show client details from `getClient`

14. **NewClientModal.tsx**
    - Use `addClient` on form submission
    - Show success toast on successful creation

15. **NewLoanModal.tsx**
    - Use `addLoan` on form submission
    - Pull available products from `loanProducts`
    - Pull clients from `clients`

16. **RecordPaymentModal.tsx**
    - Use `addPayment` on form submission
    - Auto-calculate new loan balance
    - Show M-Pesa integration fields

## Implementation Priority

### Phase 1: Core Operations (Immediate)
1. ClientsTab - Full DataContext integration
2. LoansTab - Full DataContext integration  
3. PaymentsTab - Full DataContext integration
4. DashboardTab - Pull from real data

### Phase 2: Extended Features
5. SavingsTab - Full integration
6. GroupsTab - Full integration
7. LoanReconciliationTab - Link to actual loans
8. ApprovalsTab - Link to pending loans

### Phase 3: Modals and Forms
9. All modals updated to use DataContext methods
10. Form validation with actual data constraints
11. Success/error toasts on all operations

### Phase 4: Reports and Analytics
12. All reports pull from actual data
13. AI Insights reference real data
14. Credit scoring uses actual payment history

## Benefits of This Architecture

1. **Single Source of Truth**: All data flows through one context
2. **Automatic Updates**: Changes propagate to all related entities
3. **Data Integrity**: Relationships are maintained automatically
4. **Easier Testing**: Mock the context for component testing
5. **Better Performance**: React's context handles re-renders efficiently
6. **Type Safety**: Full TypeScript support with proper types
7. **Scalability**: Easy to add new entities and relationships

## Migration Path for Existing Components

For any component using dummy data:

```typescript
// BEFORE
import { clients } from '../data/dummyData';

function MyComponent() {
  const [localClients, setLocalClients] = useState(clients);
  
  const handleAdd = (newClient) => {
    setLocalClients([...localClients, newClient]);
  };
}

// AFTER
import { useData } from '../contexts/DataContext';

function MyComponent() {
  const { clients, addClient } = useData();
  
  const handleAdd = (newClient) => {
    const id = addClient(newClient);
    toast.success('Client added successfully!');
  };
}
```

## Data Flow Examples

### Example 1: Recording a Payment
```typescript
const { addPayment, getLoan } = useData();

// When user records a payment
const handleRecordPayment = (paymentData) => {
  // Add the payment
  const paymentId = addPayment({
    loanId: 'LN-001',
    clientId: 'CL-001',
    clientName: 'Wanjiru Kamau',
    amount: 10000,
    method: 'M-Pesa',
    transactionId: 'RGH12345XY',
    date: '2024-12-11',
    status: 'Completed',
    recordedBy: 'Jane Muthoni'
  });
  
  // The loan balance is automatically updated!
  // The payment appears in loan payment history automatically!
  // No manual state management needed!
};
```

### Example 2: Creating a Loan
```typescript
const { addLoan, clients, loanProducts } = useData();

const handleCreateLoan = (formData) => {
  const client = clients.find(c => c.id === formData.clientId);
  const product = loanProducts.find(p => p.id === formData.productId);
  
  const loanId = addLoan({
    clientId: formData.clientId,
    clientName: client.name,
    productId: formData.productId,
    productName: product.name,
    principalAmount: formData.amount,
    // ... other fields
  });
  
  // Loan appears in loans list automatically!
  // Loan appears in client's loan history automatically!
  // Loans Receivable account is updated automatically!
};
```

### Example 3: Approving a Loan
```typescript
const { approveLoan, getLoan } = useData();

const handleApproveLoan = (loanId) => {
  approveLoan(loanId, 'Sarah Wambui'); // Current user
  
  // Loan status updates automatically!
  // Approval appears in audit trail!
  // Loan moves to disbursement queue!
};
```

## Next Steps

1. Update each component listed above to use DataContext
2. Remove all local state management of data
3. Remove imports from /data/dummyData.ts
4. Add success/error toasts for all operations
5. Add loading states for async operations (future: Supabase)
6. Implement proper error handling

## Future Enhancements

### When Connecting to Supabase
- Replace useState with database queries
- Add loading states
- Add optimistic updates
- Add error handling and retry logic
- Add real-time subscriptions for live updates

### Performance Optimizations
- Add React.memo for expensive components
- Use useMemo for computed values
- Implement virtual scrolling for large lists
- Add pagination for tables

### Advanced Features
- Audit logging for all changes
- Undo/redo functionality
- Offline support with sync
- Data export/import
- Automated backups

---

**Document Version**: 1.0  
**Last Updated**: December 11, 2024  
**Author**: BV FUNGUO LTD Development Team