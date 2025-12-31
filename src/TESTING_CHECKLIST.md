# ✅ Loan Products - Complete Testing Checklist

## 🎯 Pre-Testing Setup

### 1. Run Database Migration
- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Copy contents of `/supabase/migrations/add_loan_product_fields.sql`
- [ ] Paste and Run
- [ ] Verify success messages appear

### 2. Verify Columns Exist
Run this SQL query:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'loan_products'
ORDER BY column_name;
```

Expected columns (minimum):
- ✅ collateral_required
- ✅ description
- ✅ guarantor_required
- ✅ id
- ✅ insurance_fee_fixed ← NEW
- ✅ interest_method
- ✅ interest_rate
- ✅ max_amount
- ✅ max_duration_months
- ✅ min_amount
- ✅ min_duration_months
- ✅ organization_id
- ✅ processing_fee_fixed
- ✅ processing_fee_percentage
- ✅ product_code
- ✅ product_name
- ✅ repayment_frequency ← NEW
- ✅ status

## 🧪 Test Cases

### Test 1: Create Loan Product with All Fields
1. Navigate to Settings → Loan Products
2. Click "Create New Loan Product"
3. Fill in the form:
   - **Product Name:** Test Product 1
   - **Status:** Active
   - **Description:** This is a test product
   - **Interest Rate:** 12.5
   - **Interest Type:** Declining Balance
   - **Repayment Frequency:** Monthly
   - **Minimum Amount:** 10,000
   - **Maximum Amount:** 500,000
   - **Minimum Tenor:** 3
   - **Maximum Tenor:** 24
   - **Processing Fee:** 1,000
   - **Insurance Fee:** 500
4. Click "Create Product"
5. Check console for:
   ```
   📤 Creating loan product in Supabase:
   📦 Full transformed product: {
     ...
     "interest_method": "reducing_balance",
     "repayment_frequency": "monthly",
     "insurance_fee_fixed": 500,
     ...
   }
   ✅ Loan product created successfully in Supabase
   ```

**Expected Result:** 
- ✅ Success message appears
- ✅ Product appears in list
- ✅ No console errors

### Test 2: Verify Data Persistence (Critical!)
1. **Refresh the page** (F5 or Cmd+R)
2. Look at the newly created product in the list
3. Click to view/edit the product

**Expected Result:**
- ✅ Interest Type shows "Declining Balance" (NOT "Flat")
- ✅ Repayment Frequency shows "Monthly"
- ✅ Insurance Fee shows 500 (NOT 0)
- ✅ All other fields match what you entered

### Test 3: Create Product with Different Interest Types
Repeat Test 1 with each interest type:
- [ ] Flat Rate
- [ ] Declining Balance
- [ ] Simple Interest
- [ ] Compound Interest
- [ ] Reducing Balance
- [ ] Amortized

After each creation:
1. Refresh page
2. Verify interest type is preserved

### Test 4: Create Product with Different Repayment Frequencies
Repeat Test 1 with each frequency:
- [ ] Daily
- [ ] Weekly
- [ ] Monthly
- [ ] Quarterly

After each creation:
1. Refresh page
2. Verify frequency is preserved

### Test 5: Edit Existing Product
1. Open an existing loan product
2. Change these fields:
   - Interest Type: Change to "Compound"
   - Repayment Frequency: Change to "Quarterly"
   - Insurance Fee: Change to 750
3. Click "Save"
4. Refresh page
5. Open the product again

**Expected Result:**
- ✅ Interest Type shows "Compound"
- ✅ Repayment Frequency shows "Quarterly"
- ✅ Insurance Fee shows 750

### Test 6: Test with Zero/Empty Values
1. Create new product
2. Set Insurance Fee to 0
3. Leave Processing Fee as 0
4. Save and refresh

**Expected Result:**
- ✅ Values show as 0 (not blank or N/A)
- ✅ No errors in console

### Test 7: Verify Field Mappings
Check console logs when creating a product:

Look for transformation:
```json
{
  "product_name": "Test Product 1",
  "interest_method": "reducing_balance",    // ← lowercase
  "repayment_frequency": "monthly",          // ← lowercase
  "insurance_fee_fixed": 500,                // ← number
  "processing_fee_fixed": 1000,              // ← number
  "status": "active"                         // ← lowercase
}
```

**Expected Result:**
- ✅ All values are properly transformed (lowercase where needed)
- ✅ Numbers are actual numbers, not strings
- ✅ No undefined or null required fields

### Test 8: Check Supabase Database Directly
1. Go to Supabase Dashboard → Table Editor
2. Open `loan_products` table
3. Find your test product
4. Check these columns:
   - interest_method: Should be "reducing_balance"
   - repayment_frequency: Should be "monthly"
   - insurance_fee_fixed: Should be 500.00
   - status: Should be "active"

**Expected Result:**
- ✅ All values are stored correctly in database
- ✅ No NULL values for required fields

## 🐛 Common Issues & Solutions

### Issue: "Could not find the 'repayment_frequency' column"
**Solution:** Migration not run. Go back to Pre-Testing Setup Step 1.

### Issue: "Could not find the 'insurance_fee_fixed' column"
**Solution:** Migration not run. Go back to Pre-Testing Setup Step 1.

### Issue: Interest Type resets to "Flat" after refresh
**Possible Causes:**
1. ❌ Migration not run → Run migration
2. ❌ Wrong transformation → Check console for transformation output
3. ❌ Database error → Check Supabase logs

### Issue: Values show as 0 or N/A
**Possible Causes:**
1. ❌ Field not mapped → Check transformation in console
2. ❌ Column doesn't exist → Run migration
3. ❌ Wrong field name → Check console errors

### Issue: Product saves but shows error
**Solution:** Check console for specific error message. Most likely:
- Status value not lowercase
- Required field missing
- Numeric overflow (values too large)

## ✅ Sign-Off Checklist

Before marking this as complete:
- [ ] Migration ran successfully
- [ ] All 3 new columns exist in database
- [ ] Can create loan product with all fields
- [ ] Fields persist after page refresh
- [ ] Interest Type saves correctly
- [ ] Repayment Frequency saves correctly
- [ ] Insurance Fee saves correctly
- [ ] Can edit and update products
- [ ] No console errors during save
- [ ] No console errors after refresh
- [ ] Database shows correct values
- [ ] All dropdown options work correctly

## 📊 Success Metrics

**Before Fix:**
- ❌ 3 fields not saving (interest_method, repayment_frequency, insurance_fee_fixed)
- ❌ Values reset to defaults after refresh
- ❌ Data loss on every edit

**After Fix:**
- ✅ All 14 form fields save correctly
- ✅ Values persist after refresh
- ✅ Complete data integrity
- ✅ No data loss

## 🎉 Expected Final State

When everything is working:
1. Create a loan product with ALL fields filled
2. Close the browser completely
3. Reopen the browser
4. Navigate back to Loan Products
5. **ALL FIELDS SHOULD MATCH EXACTLY WHAT YOU ENTERED**

If any field doesn't match → Check the specific test case for that field above.

---

**Status:** Ready for Testing  
**Next Step:** Run migration, then start with Test 1
