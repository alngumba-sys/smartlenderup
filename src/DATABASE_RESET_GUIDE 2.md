# 🔄 Complete Database Reset Guide

## ⚠️ WARNING
**This will DELETE ALL DATA in your Supabase database!**

Only run this if you want to start completely fresh. Export any important data first!

---

## ⚡ Quick Steps

### 1️⃣ Open Supabase SQL Editor
- Go to **Supabase Dashboard**
- Click **SQL Editor** (left sidebar)
- Click **New Query**

### 2️⃣ Run the SQL
- Open `/COMPLETE_DATABASE_RESET.sql`
- Copy the **ENTIRE file** (all ~1000 lines)
- Paste into SQL Editor
- Click **Run** ▶️
- Wait ~10 seconds

### 3️⃣ Verify Success
You'll see a table showing all your new tables organized by category:
- 🏢 Core (3 tables)
- 👤 Clients (2 tables)
- 💰 Loans (7 tables)
- 💳 Payments (3 tables)
- 🏦 Savings (3 tables)
- 📊 Accounting (4 tables)
- 👔 HR (3 tables)
- 📈 Shareholders (2 tables)
- ⚙️ System (5 tables)

**Total: 30+ tables** ✅

---

## 📋 What Gets Created

### Core Tables (Multi-tenancy)
```
✅ organizations         → Mother companies, branches, chamas
✅ users                 → All system users
✅ user_organizations    → Multi-tenant access control
```

### Client Management
```
✅ clients               → Borrowers (CL001 format)
✅ kyc_records          → KYC documents & verification
```

### Loan Management (5-Phase Workflow)
```
✅ loan_products        → Product catalog
✅ loans                → Loan applications & active loans
✅ approvals            → 5-phase approval tracking
✅ collaterals          → Loan collateral records
✅ guarantors           → Loan guarantors
✅ loan_documents       → Uploaded documents
✅ disbursements        → Loan disbursement tracking
```

### Payments & Repayments
```
✅ repayments           → Loan repayments
✅ payments             → General payments
✅ payees               → Payee master list
```

### Savings & Groups
```
✅ groups               → Chamas/investment groups
✅ savings_accounts     → Member savings accounts
✅ savings_transactions → Deposits & withdrawals
```

### Accounting (Double-entry)
```
✅ journal_entries      → Main journal entries
✅ journal_entry_lines  → Journal entry lines (debit/credit)
✅ expenses             → Expense tracking
✅ bank_accounts        → Organization bank accounts
```

### HR & Payroll
```
✅ employees            → Employee master
✅ payroll_runs         → Monthly payroll batches
✅ payroll_records      → Individual payslips
```

### Shareholders
```
✅ shareholders         → Shareholder register
✅ shareholder_transactions → Share purchases/sales/dividends
```

### System Tables
```
✅ branches             → Branch management
✅ tasks                → Task management
✅ tickets              → Support tickets
✅ notifications        → User notifications
✅ audit_logs           → Complete audit trail
```

---

## ✅ Key Features of New Schema

### 1. Auto-Generated UUIDs
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```
- ✅ No more "null value in column 'id'" errors!
- ✅ Every table generates UUIDs automatically

### 2. Multi-Tenancy
```sql
organization_id UUID NOT NULL REFERENCES organizations(id)
```
- ✅ Every record belongs to an organization
- ✅ Perfect for mother companies, branches, and chamas
- ✅ Data isolation between organizations

### 3. Auto-Updating Timestamps
```sql
updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
```
- ✅ Triggers automatically update timestamps
- ✅ Complete audit trail

### 4. Proper Foreign Keys
```sql
client_id UUID REFERENCES clients(id) ON DELETE CASCADE
```
- ✅ Data integrity enforced
- ✅ Cascading deletes where appropriate
- ✅ Prevents orphaned records

### 5. Performance Indexes
```sql
CREATE INDEX idx_loans_organization ON loans(organization_id);
```
- ✅ Fast queries on organization_id
- ✅ Fast searches by client, status, date
- ✅ Optimized for common queries

### 6. No User ID Requirements!
```sql
created_by UUID REFERENCES users(id)  -- OPTIONAL!
```
- ✅ No more "user_id cannot be null" errors
- ✅ Created_by and updated_by are optional
- ✅ Works even when user context isn't available

---

## 🎯 Client ID Format

The schema supports your **CL001 format**:

```sql
clients (
  client_number VARCHAR(50) UNIQUE NOT NULL  -- 'CL001', 'CL002', etc.
)
```

Your code already generates this format, and the database will store it!

---

## 🌍 14-Country Currency Support

The schema includes currency fields:

```sql
organizations (
  country VARCHAR(100) DEFAULT 'Kenya',
  currency VARCHAR(10) DEFAULT 'KES'
)
```

Supports: KES, UGX, TZS, GHS, NGN, ZAR, USD, EUR, GBP, INR, CAD, AUD, ZMW, MWK

---

## 🔐 Security Features

### Row Level Security (RLS) Ready
The schema is designed for RLS but doesn't enable it by default. You can add policies later:

```sql
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own org clients"
  ON clients FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_organizations 
    WHERE user_id = auth.uid()
  ));
```

### Audit Logging
Every important action can be logged:

```sql
audit_logs (
  event_type,
  table_name,
  record_id,
  old_values JSONB,
  new_values JSONB,
  user_id,
  timestamp
)
```

---

## 🧪 After Running - Test Checklist

### 1. Check Table Count
```sql
SELECT COUNT(*) FROM pg_tables 
WHERE schemaname = 'public';
```
Should return **30+**

### 2. Check a Table Structure
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'loan_products';
```
Should show 30+ columns with UUID defaults

### 3. Test Insert
```sql
-- Insert test organization
INSERT INTO organizations (organization_name, organization_type, country, currency)
VALUES ('Test MFI', 'mother_company', 'Kenya', 'KES')
RETURNING *;
```

### 4. Check Your App
- Try creating a loan product
- Try creating a client
- Should work without errors! ✅

---

## 🚨 Troubleshooting

### Error: "relation already exists"
**Cause:** Tables weren't dropped  
**Fix:** The SQL uses `DROP TABLE IF EXISTS` - just run it again

### Error: "permission denied"
**Cause:** Insufficient permissions  
**Fix:** Make sure you're using the Supabase service role or have proper permissions

### SQL runs but no tables?
**Cause:** SQL had errors  
**Fix:** Check SQL Editor for red error messages

### Foreign key constraint errors?
**Cause:** Data references don't exist  
**Fix:** This is a fresh database - no data yet!

---

## 📊 Schema Diagram (Simplified)

```
organizations
    ↓
    ├─→ users → user_organizations
    ├─→ clients → kyc_records
    ├─→ loan_products
    ├─→ loans
    │     ├─→ approvals
    │     ├─→ collaterals
    │     ├─→ guarantors
    │     ├─→ loan_documents
    │     ├─→ disbursements
    │     └─→ repayments
    ├─→ groups
    ├─→ savings_accounts → savings_transactions
    ├─→ employees
    ├─→ payroll_runs → payroll_records
    ├─→ shareholders → shareholder_transactions
    ├─→ journal_entries → journal_entry_lines
    ├─→ expenses
    ├─→ bank_accounts
    ├─→ tasks
    ├─→ tickets
    ├─→ notifications
    └─→ audit_logs
```

---

## ✅ Success Indicators

After running the SQL, you should see:
1. ✅ No error messages in SQL Editor
2. ✅ Table list displayed with categories
3. ✅ 30+ tables created
4. ✅ All tables have UUID defaults
5. ✅ All tables have organization_id
6. ✅ Indexes created successfully
7. ✅ Triggers created successfully

---

## 🎉 Next Steps After Reset

### 1. Create Your Organization
```javascript
// In your app or via SQL
INSERT INTO organizations (
  organization_name, 
  organization_type, 
  country, 
  currency,
  trial_start_date,
  trial_end_date
) VALUES (
  'Your MFI Name',
  'mother_company',
  'Kenya',
  'KES',
  now(),
  now() + interval '14 days'
);
```

### 2. Create Admin User
```javascript
// Via Supabase Auth or direct insert
INSERT INTO users (email, full_name, role)
VALUES ('admin@yourmfi.com', 'Admin User', 'super_admin');
```

### 3. Link User to Organization
```sql
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES (
  'user-uuid-here',
  'org-uuid-here',
  'admin'
);
```

### 4. Start Using the Platform!
- ✅ Create loan products
- ✅ Add clients (CL001, CL002...)
- ✅ Create loan applications
- ✅ Process approvals through 5 phases
- ✅ Disburse loans
- ✅ Record repayments

---

## 💡 Pro Tips

1. **Export before running** - If you have any data you want to keep
2. **Run during off-hours** - If in production (but you're in dev, so no worries!)
3. **Test immediately** - Create a test product right after to verify
4. **Keep the SQL file** - Reuse for staging/production setups
5. **Enable RLS later** - Start without it, add when you understand it
6. **Use transactions** - The SQL is already wrapped conceptually

---

## 📞 Need Help?

If something goes wrong:
1. Check SQL Editor for error messages (usually at the top)
2. Look for the specific line number with the error
3. Check Supabase logs (Logs → Database)
4. Verify you have proper permissions
5. Try running just the DROP TABLE section first

---

**Ready to reset?** Copy `/COMPLETE_DATABASE_RESET.sql` and run it! 🚀

**Time required:** ~10 seconds  
**Tables created:** 30+  
**Your old problems:** Gone! ✅
