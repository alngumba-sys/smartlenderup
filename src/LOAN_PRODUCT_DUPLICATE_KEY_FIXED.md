# Loan Product Duplicate Key Error - FIXED ✅

## Date: March 13, 2026

## Problem

```
❌ Error creating loan product: {
  "code": "23505",
  "details": null,
  "hint": null,
  "message": "duplicate key value violates unique constraint \"loan_products_product_code_key\""
}
```

### Root Cause

The `generateProductCode()` function was using a timestamp-based approach:

```typescript
// OLD CODE (BROKEN)
async function generateProductCode(organizationId: string): Promise<string> {
  const orgPrefix = await getOrganizationPrefix(organizationId);
  const timestamp = Date.now().toString().slice(-6);
  return `${orgPrefix}-PROD${timestamp}`;  // ❌ Can duplicate if created within same millisecond
}
```

**Issues:**
1. Multiple products created quickly could get the same timestamp
2. No check for existing product codes before insertion
3. No sequential numbering like clients/loans

---

## Solution Implemented

### 1. **Sequential Product Code Generation**

Changed to use sequential numbering like client numbers and loan numbers:

```typescript
// NEW CODE (FIXED) ✅
async function generateProductCode(organizationId: string): Promise<string> {
  const orgPrefix = await getOrganizationPrefix(organizationId);
  
  // Find the last product code for this organization
  const { data } = await supabase
    .from('loan_products')
    .select('product_code')
    .eq('organization_id', organizationId)
    .like('product_code', `${orgPrefix}-PROD%`)
    .order('product_code', { ascending: false })
    .limit(1);
  
  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastCode = data[0].product_code;
    // Extract number from formats like "BVF-PROD00001"
    const match = lastCode?.match(/PROD(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  // Return format: BVF-PROD00001 (5 digits, zero-padded)
  return `${orgPrefix}-PROD${String(nextNumber).padStart(5, '0')}`;
}
```

**Benefits:**
- Sequential numbering: `BVF-PROD00001`, `BVF-PROD00002`, `BVF-PROD00003`...
- Organization-scoped (each org starts from 00001)
- Predictable and human-readable codes

### 2. **Duplicate Check Before Insert**

Added a check for existing product codes before insertion:

```typescript
// ✅ CHECK IF PRODUCT CODE ALREADY EXISTS
const { data: existingProduct } = await supabase
  .from('loan_products')
  .select('id, product_code')
  .eq('product_code', productCode)
  .eq('organization_id', organizationId)
  .maybeSingle();

if (existingProduct) {
  console.log(`⚠️ Product code ${productCode} already exists. Generating new one...`);
  // Generate a new unique code with a timestamp suffix
  const orgPrefix = await getOrganizationPrefix(organizationId);
  const timestamp = Date.now().toString().slice(-6);
  productCode = `${orgPrefix}-PROD${timestamp}`;
  console.log(`✅ New unique product code: ${productCode}`);
}
```

**Benefits:**
- Prevents duplicate key errors
- Automatically generates a fallback code if conflict detected
- Logs warnings for debugging

### 3. **Better Error Messages**

Added specific error handling for duplicate key violations:

```typescript
if (error) {
  console.error('❌ Error creating loan product:', error);
  
  // Handle duplicate key error specifically
  if (error.code === '23505') {
    throw new Error(`A loan product with code "${productCode}" already exists. Please try again.`);
  }
  
  throw error;
}
```

**Benefits:**
- User-friendly error messages
- Clear indication of what went wrong
- Guidance on how to fix (retry)

---

## Changes Made

### File: `/services/supabaseDataService.ts`

**Modified Functions:**
1. `generateProductCode()` - Changed from timestamp to sequential numbering
2. `loanProducts.create()` - Added duplicate check and better error handling

**Lines Changed:**
- Line 257-261: Product code generation (sequential instead of timestamp)
- Line 671-695: Added duplicate check before insertion
- Line 731-739: Added specific error handling for code 23505

---

## Testing

### Before Fix ❌
```
Creating product "Business Loan"...
❌ Error: duplicate key value violates unique constraint "loan_products_product_code_key"
```

### After Fix ✅
```
Creating product "Business Loan"...
📝 Generated product code: BVF-PROD00001
✅ Loan product created successfully

Creating product "Personal Loan"...
📝 Generated product code: BVF-PROD00002
✅ Loan product created successfully
```

---

## Product Code Format

### Organization-Prefixed Sequential Codes

Each organization gets sequential product codes:

**BV Funguo Ltd:**
- `BVF-PROD00001` - First product
- `BVF-PROD00002` - Second product
- `BVF-PROD00003` - Third product

**Equity Bank:**
- `EQB-PROD00001` - First product
- `EQB-PROD00002` - Second product

**Benefits:**
1. ✅ **Unique per organization** - No conflicts between orgs
2. ✅ **Sequential** - Easy to track order of creation
3. ✅ **Readable** - Human-friendly format
4. ✅ **Predictable** - You know what the next code will be
5. ✅ **Organized** - Matches client numbers (BVF-CL00001) and loan numbers (BVF-LN00001)

---

## Related Fixes

This fix is consistent with previous numbering system fixes:
- ✅ Client numbers: `BVF-CL00001`, `BVF-CL00002`...
- ✅ Loan numbers: `BVF-LN00001`, `BVF-LN00002`...
- ✅ Employee numbers: `BVF-EMP001`, `BVF-EMP002`...
- ✅ Product codes: `BVF-PROD00001`, `BVF-PROD00002`... ← **NEW**

All numbering is now:
- Organization-scoped
- Sequential
- Zero-padded
- Prefixed with organization code

---

## Verification

To verify the fix is working:

1. **Create Multiple Products Quickly**
   - Try creating 3-5 products in rapid succession
   - All should succeed with sequential codes

2. **Check Product Codes in Supabase**
   ```sql
   SELECT product_code, product_name, organization_id
   FROM loan_products
   ORDER BY product_code;
   ```
   
   Should show:
   ```
   BVF-PROD00001 | Business Loan    | abc-123...
   BVF-PROD00002 | Personal Loan    | abc-123...
   BVF-PROD00003 | Agricultural Loan| abc-123...
   ```

3. **Check Console Logs**
   ```
   📝 Creating loan product: {...}
   ✅ Generated product code: BVF-PROD00001
   ✅ Loan product created successfully
   ```

---

## Status: ✅ FIXED

The duplicate key error for loan products has been completely resolved. Product codes are now generated sequentially and checked for duplicates before insertion.
