# Loan Product Persistence Issue - Diagnostic Report

## Problem
Loan products are being created in the app but are NOT appearing in Supabase. The `loan_products` table in Supabase is empty.

## What We Know

### 1. Current Flow
When you create a loan product:
1. **DataContext.tsx** - `addLoanProduct()` is called (line 1825)
   - Creates product with ID like `PRD1735511234567`
   - Updates local state: `setLoanProducts([...loanProducts, newProduct])`
   - Calls: `syncToSupabase('create', 'loan_product', newProduct)`

2. **supabaseSync.ts** - `syncToSupabase()` handles the sync (line 44-52)
   - Calls: `supabaseService.createLoanProduct(data)`

3. **supabaseService.ts** - `createLoanProduct()` inserts to DB (line 995)
   - Transforms product data for Supabase
   - Inserts into `loan_products` table
   - Returns `true` if successful, `false` if error

### 2. Data Loading Flow
When the app loads:
1. **DataContext.tsx** - `useEffect` runs on mount (line 806)
2. Calls `loadFromSupabase()` from **supabaseSync.ts**
3. Fetches ALL data from Supabase including loan products
4. Sets state: `setLoanProducts(supabaseData.loanProducts || [])`
5. ⚠️ **If Supabase table is empty, state becomes empty array**

### 3. The Problem
- Every page refresh loads from Supabase (primary source)
- If Supabase is empty, local state becomes empty
- Created products don't persist because sync is failing silently

## Possible Causes

### A. Silent Sync Failure
The sync might be failing but errors are being caught and logged without user notification.

**Location**: `/utils/supabaseSync.ts` lines 220-223
```typescript
} catch (error) {
  console.error(`Error syncing ${entity} to Supabase:`, error);
  // Don't show error toast - fail silently to not disrupt user experience
}
```

### B. Organization ID Mismatch
The product might be created with a different `organization_id` than what's being queried.

**Check**:
- Creating: `organization_id` set in `createLoanProduct()` (line 1000)
- Fetching: `organization_id` filtered in `fetchLoanProducts()` (line 986)

### C. Row Level Security (RLS) Policy
Supabase RLS might be blocking inserts or selects.

### D. Supabase Connection Issues
The Supabase client might not be properly initialized or authenticated.

### E. Transform Function Removing Required Fields
The `transformLoanProductForSupabase()` might be removing or incorrectly mapping required fields.

## How to Debug

### Step 1: Use the Debug Panel
I've added a debug panel to the Loan Products tab:

1. Navigate to **Admin → Loan Products**
2. Look for the debug panel in the bottom-right corner
3. Click **"Test Create"** to directly insert a product to Supabase
4. Click **"Refresh"** to see current Supabase state
5. Watch the browser console for detailed logs

### Step 2: Check Console Logs
When creating a product, look for:
- ✅ `Synced loan_product to Supabase` - Success
- ⚠️ `Failed to sync loan_product to Supabase` - Sync failed
- ❌ `Error syncing loan_product to Supabase:` - Exception thrown

### Step 3: Check Supabase Directly
1. Open Supabase Dashboard
2. Go to Table Editor → `loan_products`
3. Check if products appear momentarily then disappear
4. Check the `organization_id` column values

### Step 4: Enable Verbose Logging
Edit `/utils/supabaseSync.ts`:
```typescript
// Line 6: Change to true
const SHOW_SYNC_TOASTS = true;
```
This will show toast notifications for every sync operation.

### Step 5: Check for Auto-Deletion
Search for any code that might be deleting products:
```bash
# Search for deletion patterns
grep -r "deleteLoanProduct" --include="*.tsx" --include="*.ts"
grep -r "delete.*loan_products" --include="*.tsx" --include="*.ts"
```

## Immediate Fix Options

### Option 1: Catch and Display Errors
Update `syncToSupabase()` to show error toasts:

```typescript
if (!success) {
  toast.error(`Failed to sync ${entity} to cloud database`);
  console.error(`Sync failed for ${entity}`);
}
```

### Option 2: Add Retry Logic
Implement retry mechanism for failed syncs:

```typescript
let retries = 3;
while (retries > 0 && !success) {
  success = await supabaseService.createLoanProduct(data);
  retries--;
  if (!success && retries > 0) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

### Option 3: Hybrid Storage
Keep products in localStorage as backup:

```typescript
// After creating product
localStorage.setItem(`loan_products_${orgId}`, JSON.stringify(loanProducts));

// When loading, try Supabase first, then localStorage
const supabaseProducts = await fetchLoanProducts();
if (supabaseProducts.length === 0) {
  const localProducts = localStorage.getItem(`loan_products_${orgId}`);
  if (localProducts) {
    return JSON.parse(localProducts);
  }
}
```

## Testing Steps

1. **Create a product** through the UI
2. **Check browser console** for sync messages
3. **Use debug panel** to verify Supabase state
4. **Refresh the page** and check if product persists
5. **Check Supabase table** directly in dashboard

## Files Involved

- `/contexts/DataContext.tsx` - State management & CRUD operations
- `/utils/supabaseSync.ts` - Sync orchestration
- `/lib/supabaseService.ts` - Supabase operations
- `/components/tabs/LoanProductsTab.tsx` - UI & debug panel
- `/components/LoanProductDebugPanel.tsx` - Real-time diagnostic tool

## Next Steps

1. Use the debug panel to test direct Supabase inserts
2. Monitor console logs during product creation
3. Check if RLS policies are blocking operations
4. Verify organization ID consistency
5. Consider implementing better error handling and user feedback
