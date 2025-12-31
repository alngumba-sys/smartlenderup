# Sync Call Removal Status

## Completed Removals ✅
- addClient
- updateClient
- deleteClient  
- addLoan (await calls removed)
- updateLoan
- deleteLoan
- addGuarantor
- addCollateral
- addLoanDocument
- addRepayment
- deleteLoanProduct
- addShareholder
- updateShareholder
- deleteShareholder
- Bank account update in loan disbursement
- Funding transaction in loan disbursement

## Remaining To Remove (40 calls)
All remaining syncToSupabase calls follow this pattern and need to be removed:

```typescript
// Pattern 1: Simple sync call
syncToSupabase('create', 'entity_name', data);

// Pattern 2: Sync with comment
// ✅ SYNC TO SUPABASE
syncToSupabase('update', 'entity_name', data, id);

// Pattern 3: Conditional sync
if (something) {
  syncToSupabase('delete', 'entity_name', {}, id);
}
```

## Replacement Strategy

All these calls should be REMOVED completely. The debounced auto-sync in the useEffect handles all syncing automatically.

**Replace:**
```typescript
setExpenses([...expenses, newExpense]);

// Sync to Supabase
syncToSupabase('create', 'expense', newExpense);
```

**With:**
```typescript
setExpenses([...expenses, newExpense]);
// ✅ Debounced sync handles this automatically
```

Or simply remove the sync line entirely if there's no comment.

## Entities Still Needing Sync Removal

1. ✅ ShareholderTransaction (add, update, delete)
2. ❌ Expense (add, update, delete, approve)
3. ❌ Payee (add, update, delete)
4. ❌ PayrollRun (add, update)
5. ❌ BankAccount (add, update, delete)
6. ❌ FundingTransaction (add)
7. ❌ Task (add, update, delete)
8. ❌ KYCRecord (add, update, delete)
9. ❌ AuditLog (add)
10. ❌ Ticket (add, update, delete)
11. ❌ Group (add, update, delete)
12. ❌ Approval (add, update, delete)
13. ❌ Disbursement (add)
14. ❌ ProcessingFeeRecord (add)

## Next Steps

Continue removing sync calls using the edit_tool for each entity group, or manually edit the file to remove all lines containing `syncToSupabase(`.

After all removals, the file should have:
- ✅ NO syncToSupabase calls
- ✅ Debounced auto-sync handling all updates
- ✅ ONE API call per second (at most) instead of 40+
