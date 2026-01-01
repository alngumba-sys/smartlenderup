# 🚀 Supabase Primary Storage - Quick Reference

## Key Principle

```
✅ SUPABASE = PRIMARY (Source of Truth)
💾 LOCALSTORAGE = CACHE (Performance Only)
```

---

## Data Flow

### ✅ CORRECT Flow
```
User Action → Supabase FIRST → LocalStorage Cache → UI Update
```

### ❌ OLD Flow (Don't Use)
```
User Action → LocalStorage → Maybe Supabase Later
```

---

## Configuration

File: `/config/supabaseConfig.ts`

```typescript
ENABLED: true,           // ✅ Supabase is PRIMARY
REQUIRED: true,          // ✅ Must succeed
AUTO_SYNC: true,         // ✅ Immediate sync
USE_CACHE: true,         // ✅ Cache for speed
```

---

## CRUD Operations

### CREATE
```typescript
// 1. Write to Supabase FIRST
const success = await syncToSupabase('create', 'client', newClient);

// 2. If failed, STOP
if (!success) {
  toast.error('Failed to save');
  return;
}

// 3. Update cache (optional)
localStorage.setItem('bvfunguo_clients', JSON.stringify([...clients, newClient]));
```

### READ
```typescript
// 1. Check cache first (fast)
const cached = localStorage.getItem('bvfunguo_clients');
if (cached && cacheIsFresh) {
  return JSON.parse(cached);
}

// 2. Load from Supabase (source of truth)
const data = await loadFromSupabase();

// 3. Update cache
localStorage.setItem('bvfunguo_clients', JSON.stringify(data.clients));
```

### UPDATE
```typescript
// 1. Update Supabase FIRST
const success = await syncToSupabase('update', 'client', updatedClient, id);

// 2. Update cache
updateLocalStorageCache('bvfunguo_clients', updatedClient);
```

### DELETE
```typescript
// 1. Delete from Supabase FIRST
const success = await syncToSupabase('delete', 'client', null, id);

// 2. Remove from cache
removeFromLocalStorageCache('bvfunguo_clients', id);
```

---

## All Tables

| Entity | Supabase Table | Cache Key |
|--------|----------------|-----------|
| Clients | `clients` | `bvfunguo_clients` |
| Loans | `loans` | `bvfunguo_loans` |
| Products | `loan_products` | `bvfunguo_loan_products` |
| Repayments | `repayments` | `bvfunguo_repayments` |
| Savings | `savings_accounts` | `bvfunguo_savings_accounts` |
| Shareholders | `shareholders` | `bvfunguo_shareholders` |
| Bank Accounts | `bank_accounts` | `bvfunguo_bank_accounts` |
| Expenses | `expenses` | `bvfunguo_expenses` |
| Employees | `employees` | `bvfunguo_employees` |
| Payroll | `payroll_records` | `bvfunguo_payroll_records` |
| Journals | `journal_entries` | `bvfunguo_journal_entries` |
| Approvals | `approvals` | `bvfunguo_approvals` |
| Groups | `groups` | `bvfunguo_groups` |

**See `/SUPABASE_PRIMARY_STORAGE_GUIDE.md` for complete list**

---

## Adding New Features

1. **Create Supabase table first**
   ```sql
   CREATE TABLE new_table (...);
   ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
   CREATE POLICY ...;
   ```

2. **Add to `supabaseService.ts`**
   ```typescript
   export const createNewEntity = async (data) => { ... };
   export const fetchNewEntities = async () => { ... };
   ```

3. **Add to `supabaseSync.ts`**
   ```typescript
   case 'new_entity':
     success = await supabaseService.createNewEntity(data);
     break;
   ```

4. **Use in components**
   ```typescript
   const save = async () => {
     await syncToSupabase('create', 'new_entity', data);
   };
   ```

---

## Common Commands

```javascript
// Clear cache and reload from Supabase
clearAllFrontendData()

// Migrate old localStorage data to Supabase
migrateToSupabase()

// Check sync status
// (Add this function to your console utilities)
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Data not saving | Check console for Supabase errors |
| Data not loading | Run `clearAllFrontendData()` |
| Sync conflicts | Supabase is truth - reload from it |
| RLS errors | Check user is authenticated |

---

## Benefits

✅ Data persists across devices  
✅ No data loss on cache clear  
✅ Real-time multi-device sync  
✅ Automatic backups  
✅ Secure with RLS policies  
✅ Scalable (no localStorage limits)  

---

## Remember

🎯 **Supabase = PRIMARY**  
💾 **LocalStorage = CACHE**  
🔄 **Always sync to Supabase first**  
❌ **Never trust localStorage as source**  

---

Read full guide: `/SUPABASE_PRIMARY_STORAGE_GUIDE.md`
