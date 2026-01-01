# Supabase Integration Setup Instructions

## Step 1: Run the Database Migration

1. Go to your Supabase SQL Editor:
   https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/sql

2. Click "New Query"

3. Copy the entire contents of `/supabase-migration.sql` 

4. Paste it into the SQL Editor

5. Click "Run" to execute the migration

This will create all 25 tables with proper relationships, indexes, and Row Level Security policies.

## Step 2: Get Your Supabase API Keys

1. Go to your Supabase Project Settings:
   https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/settings/api

2. Copy your **anon/public** key (it starts with `eyJ...`)

3. Open `/lib/supabaseClient.ts` in your code

4. Replace `'YOUR_SUPABASE_ANON_KEY'` with your actual anon key:

```typescript
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Your actual key
```

## Step 3: Verify Installation

After completing steps 1 and 2, your Supabase integration will be ready! The system will:

✅ Automatically save all data to Supabase in real-time
✅ Load data from Supabase on page refresh
✅ Maintain organization-level data isolation
✅ Track all changes with audit logs
✅ Support offline-first with localStorage fallback

## Database Schema Overview

Your Supabase database now includes:

### Core Tables
- **organizations** - Organization profiles and settings
- **clients** - Client/borrower records
- **loans** - Loan applications and active loans
- **loan_products** - Loan product definitions
- **repayments** - Payment records
- **savings_accounts** - Client savings accounts
- **savings_transactions** - Savings deposits/withdrawals

### Financial Management
- **shareholders** - Shareholder information
- **shareholder_transactions** - Share purchases/dividends
- **expenses** - Operating expenses
- **payees** - Vendor/payee directory
- **bank_accounts** - Organization bank accounts
- **funding_transactions** - Funding sources
- **processing_fee_records** - Loan processing fees
- **disbursements** - Loan disbursement records
- **payroll_runs** - Payroll processing
- **journal_entries** - Double-entry bookkeeping

### Operations & Compliance
- **tasks** - Task management
- **kyc_records** - KYC verification status
- **approvals** - Loan approval workflow
- **audit_logs** - System activity logs
- **tickets** - Support tickets
- **groups** - Group lending
- **guarantors** - Loan guarantors
- **collaterals** - Loan collateral
- **loan_documents** - Document tracking

## Features

### Organization-Scoped Data
All data is automatically scoped to your organization using `organization_id`. Users from different organizations cannot access each other's data.

### Row Level Security (RLS)
All tables have RLS enabled with policies that ensure data security and proper access control.

### Automatic Timestamps
All records automatically track `created_at` and `updated_at` timestamps.

### Real-time Sync
Changes made in the platform are instantly saved to Supabase.

### Offline Support
The system maintains localStorage as a fallback, ensuring the app works even if Supabase is temporarily unavailable.

## Troubleshooting

### Issue: "Cannot read properties of undefined"
**Solution**: Make sure you've updated the anon key in `/lib/supabaseClient.ts`

### Issue: "relation does not exist"
**Solution**: Make sure you've run the complete migration script in the Supabase SQL Editor

### Issue: "Insert violates foreign key constraint"
**Solution**: Make sure an organization record exists before adding other data. The registration flow handles this automatically.

### Issue: "Row Level Security policy violation"
**Solution**: Verify that RLS policies were created during migration. Check the SQL Editor for any errors.

## Next Steps

Once Supabase is configured:

1. **Test the Integration**: Create a new client or loan and verify it appears in your Supabase database
2. **Check Real-time Sync**: Open Supabase Table Editor and watch records appear as you create them
3. **Backup Your Data**: You can export data directly from Supabase as an additional backup
4. **Monitor Usage**: Check your Supabase dashboard for database size and query performance

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your API key is correct
3. Ensure the migration script ran without errors
4. Check the Supabase logs in your dashboard
