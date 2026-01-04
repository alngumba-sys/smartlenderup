# Migration Instructions - Add 119 Missing Columns

## ⚠️ IMPORTANT: Run these scripts IN ORDER

Run each script **one at a time** in your Supabase SQL Editor. Wait for each one to complete successfully before running the next one.

### Order of Execution:

1. **PART_1_shareholders_banks.sql** 
   - Adds: shareholders (3), shareholder_transactions (1), bank_accounts (2)
   - Total: 6 columns

2. **PART_2_expenses_payees.sql**
   - Adds: expenses (7), payees (8)
   - Total: 15 columns

3. **PART_3_groups_tasks.sql**
   - Adds: groups (12), tasks (6)
   - Total: 18 columns

4. **PART_4_payroll_funding.sql**
   - Adds: payroll_runs (12), funding_transactions (3)
   - Total: 15 columns

5. **PART_5_disbursements.sql**
   - Adds: disbursements (14)
   - Total: 14 columns

6. **PART_6_approvals.sql**
   - Adds: approvals (18)
   - Total: 18 columns

7. **PART_7_journal_fees.sql**
   - Adds: journal_entries (9), processing_fee_records (4)
   - Total: 13 columns

8. **PART_8_tickets_kyc_audit.sql**
   - Adds: tickets (7), kyc_records (10), audit_logs (3)
   - Total: 20 columns

### Total: 119 columns added across 16 tables ✅

---

## How to Run:

1. Open Supabase Dashboard → SQL Editor
2. Copy the content of **PART_1_shareholders_banks.sql**
3. Paste and click "Run"
4. Wait for success message
5. Repeat for PART_2, PART_3, etc.

## What Each Script Does:
- ✅ Adds missing columns with `IF NOT EXISTS` (safe to re-run)
- ✅ Creates performance indexes
- ✅ Enables Row Level Security (RLS)
- ✅ Adds proper foreign key relationships

## Troubleshooting:

**If you get "Failed to fetch":**
- The script might be too large
- Try refreshing the page and running again
- Make sure you're connected to the internet

**If you get "column already exists":**
- This is fine! The scripts use `IF NOT EXISTS`
- Just continue to the next part

**If you get "relation does not exist":**
- Make sure all tables were created first
- Check that the initial table creation migration was run

---

After all 8 parts complete successfully, all 119 missing columns will be added! 🎉
