# Loan Creation Fields Summary

## Fields Comparison: Form → Code → Database

### ✅ Fields in schema.sql (Already Defined)
These columns are defined in `/supabase/schema.sql` line 172-205:

| Field Name | Type | Required | Default | Purpose |
|------------|------|----------|---------|---------|
| `id` | UUID | Yes | uuid_generate_v4() | Primary key |
| `loan_number` | TEXT | Yes | - | Unique loan identifier |
| `client_id` | UUID | Yes | - | References clients table |
| `organization_id` | UUID | No | - | References organizations table |
| `loan_product_id` | UUID | No | - | References loan_products table |
| `loan_officer_id` | UUID | No | - | References users table |
| `principal_amount` | DECIMAL(15,2) | Yes | - | Loan amount |
| `interest_rate` | DECIMAL(5,2) | Yes | - | Interest rate percentage |
| `duration_months` | INTEGER | Yes | - | Loan term in months |
| `processing_fee` | DECIMAL(10,2) | No | 0 | Processing fee |
| `insurance_fee` | DECIMAL(10,2) | No | 0 | Insurance fee |
| `total_amount` | DECIMAL(15,2) | Yes | - | Total amount (principal + interest) |
| `monthly_installment` | DECIMAL(15,2) | Yes | - | Monthly payment amount |
| `outstanding_balance` | DECIMAL(15,2) | Yes | - | Remaining balance |
| `paid_amount` | DECIMAL(15,2) | No | 0 | Amount paid so far |
| `purpose` | TEXT | No | - | Loan purpose |
| `status` | TEXT | No | 'pending' | Loan status |
| `application_date` | TIMESTAMP | No | NOW() | Application date |
| `first_payment_date` | DATE | No | - | First payment due date |
| `maturity_date` | DATE | No | - | Loan maturity date |
| `notes` | TEXT | No | - | Additional notes |
| `created_at` | TIMESTAMP | No | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | No | NOW() | Last update timestamp |

### ⚠️ Fields NOT in schema.sql (Need to be Added)

These fields are used in the loan creation form but are NOT in the schema.sql:

| Field Name | Type | Purpose | Add to Schema? |
|------------|------|---------|----------------|
| `total_interest` | DECIMAL(15,2) | Total interest amount | ✅ YES - Useful for reporting |
| `total_repayable` | DECIMAL(15,2) | Total to repay (principal + interest + fees) | ✅ YES - Useful for reporting |
| `facilitation_fee` | DECIMAL(10,2) | Facilitation fee from form | ✅ YES - From loan creation form |
| `staff_member_id` | UUID | Staff who brought this deal | ✅ YES - From loan creation form |
| `collateral_type` | TEXT | Type of collateral | ✅ YES - From loan creation form |
| `collateral_value` | DECIMAL(15,2) | Value of collateral | ✅ YES - From loan creation form |
| `loan_term` | INTEGER | Alternative to duration_months | ⚠️ OPTIONAL - Duplicate of duration_months |
| `creation_date` | DATE | Date loan was created | ⚠️ OPTIONAL - Duplicate of application_date |

### 📋 Loan Creation Form Fields

From `/components/modals/NewLoanModal.tsx`:

```typescript
formData = {
  clientId: '',           // → client_id (UUID)
  productId: '',          // → loan_product_id (UUID)
  principalAmount: '',    // → principal_amount (DECIMAL)
  interestRate: '',       // → interest_rate (DECIMAL)
  loanTerm: '',           // → duration_months (INTEGER)
  termUnit: 'months',     // (processed in frontend)
  disbursementDate: '',   // → creation_date (DATE)
  purpose: '',            // → purpose (TEXT)
  collateralType: '',     // → collateral_type (TEXT) - MISSING
  collateralValue: '',    // → collateral_value (DECIMAL) - MISSING
  guarantorName: '',      // → loan_guarantors table
  guarantorPhone: '',     // → loan_guarantors table
  facilitationFee: '',    // → facilitation_fee (DECIMAL) - MISSING
  staffMemberId: ''       // → staff_member_id (UUID) - MISSING
}
```

## ✅ Fields Being Sent by Code

From `/services/supabaseDataService.ts` (after our fix):

### Core Fields (Always Sent):
- `id` - UUID
- `organization_id` - UUID
- `client_id` - UUID
- `principal_amount` - DECIMAL
- `interest_rate` - DECIMAL
- `duration_months` - INTEGER ✅ NOW INCLUDED
- `status` - TEXT
- `total_amount` - DECIMAL
- `monthly_installment` - DECIMAL ✅ NOW INCLUDED
- `outstanding_balance` - DECIMAL
- `paid_amount` - DECIMAL ✅ NOW INCLUDED
- `total_interest` - DECIMAL ✅ NOW INCLUDED
- `total_repayable` - DECIMAL ✅ NOW INCLUDED
- `application_date` - TIMESTAMP ✅ NOW INCLUDED

### Conditional Fields (Sent if Provided):
- `loan_number` - TEXT (if generated)
- `loan_product_id` - UUID ✅ NOW INCLUDED (if productId provided)
- `purpose` - TEXT (if provided)
- `facilitation_fee` - DECIMAL ✅ NOW INCLUDED (if provided)
- `processing_fee` - DECIMAL (if provided)
- `insurance_fee` - DECIMAL (if provided)
- `staff_member_id` - UUID ✅ NOW INCLUDED (if provided)
- `collateral_type` - TEXT ✅ NOW INCLUDED (if provided)
- `collateral_value` - DECIMAL ✅ NOW INCLUDED (if provided)
- `loan_term` - INTEGER ✅ NOW INCLUDED (always = duration_months)
- `creation_date` - DATE ✅ NOW INCLUDED (if provided)
- `first_payment_date` - DATE ✅ NOW INCLUDED (if provided)
- `maturity_date` - DATE ✅ NOW INCLUDED (if provided)
- `notes` - TEXT (if provided)

## 🔧 What the Fix Does

### 1. SQL Migration (`/FIX_LOAN_CREATION_SCHEMA.sql`)

Adds these columns to the `loans` table:
- `total_interest` (DECIMAL)
- `total_repayable` (DECIMAL)
- `facilitation_fee` (DECIMAL)
- `staff_member_id` (UUID)
- `collateral_type` (TEXT)
- `collateral_value` (DECIMAL)
- `loan_term` (INTEGER)
- `creation_date` (DATE)

AND ensures these exist (from schema.sql):
- `paid_amount` (DECIMAL)
- `monthly_installment` (DECIMAL)
- `duration_months` (INTEGER)
- `loan_product_id` (UUID)
- `loan_officer_id` (UUID)
- `application_date` (TIMESTAMP)
- `first_payment_date` (DATE)
- `maturity_date` (DATE)

### 2. Code Update (`/services/supabaseDataService.ts`)

**Before (Broken):**
- Commented out `duration_months` - "doesn't exist in database"
- Commented out `monthly_installment` - "doesn't exist in database"
- Sent `paid_amount` but it wasn't in database
- Didn't send loan_product_id, facilitation_fee, etc.

**After (Fixed):**
- ✅ Sends `duration_months`
- ✅ Sends `monthly_installment`
- ✅ Sends `paid_amount`
- ✅ Sends `total_interest`
- ✅ Sends `total_repayable`
- ✅ Sends `loan_product_id`
- ✅ Sends `facilitation_fee`
- ✅ Sends `staff_member_id`
- ✅ Sends `collateral_type` and `collateral_value`
- ✅ Sends all date fields
- ✅ Updated safety filter to only remove camelCase duplicates

## 🎯 Interest Calculation Formula

The platform uses **FLAT RATE** interest calculation:

```
Interest = (Principal × Rate × Term) / 100
```

Example:
- Principal: 100,000 KES
- Rate: 7.5% per month
- Term: 1 month

```
Interest = (100,000 × 7.5 × 1) / 100 = 7,500 KES
Total Repayable = 100,000 + 7,500 = 107,500 KES
Monthly Installment = 107,500 / 1 = 107,500 KES
```

For 2 months:
```
Interest = (100,000 × 7.5 × 2) / 100 = 15,000 KES
Total Repayable = 100,000 + 15,000 = 115,000 KES
Monthly Installment = 115,000 / 2 = 57,500 KES
```

## ✅ Complete Loan Creation Flow

1. **User fills form** in `NewLoanModal`
2. **Form data sent** to `handleNewLoan` in `LoansTab`
3. **Calculations performed:**
   - Total Interest = (Principal × Rate × Term) / 100
   - Total Repayable = Principal + Total Interest + Facilitation Fee
   - Monthly Installment = Total Repayable / Term
4. **Loan object created** with all calculated values
5. **addLoan called** in `DataContext`
6. **supabaseDataService.loans.create** called with complete data
7. **Database insert** with all fields
8. **Success!** Loan created in Supabase

## 📝 Notes

- The `loan_number` is auto-generated with organization prefix (e.g., "BVFG-LN-00001")
- Guarantor data is stored separately in `loan_guarantors` table
- Collateral can be stored in both the loans table (type & value) and `loan_collaterals` table (detailed entries)
- Documents are stored in `loan_documents` table
- Interest calculation happens in frontend before sending to database
- All calculated fields are stored for reporting purposes

---

**Created:** March 12, 2026
**Purpose:** Document loan creation schema and data flow
**Status:** ✅ Complete and Accurate
