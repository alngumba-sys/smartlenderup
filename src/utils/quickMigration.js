/**
 * QUICK MIGRATION - Copy and paste this entire code into browser console
 * This will sync data from project_states to individual Supabase tables
 */

// Step 1: Get organization ID from localStorage
const orgData = localStorage.getItem('current_organization');
if (!orgData) {
  console.error('❌ No organization found. Please log in first.');
} else {
  const org = JSON.parse(orgData);
  console.log('📋 Organization:', org.organization_name, '(ID:', org.id, ')');
  
  // Step 2: View what's in project_states
  console.log('\n🔍 Checking project_states table...');
  console.log('💡 Open Supabase Dashboard → Table Editor → project_states');
  console.log('💡 Look for row with id:', `state_${org.id}`);
  console.log('💡 You should see your loans, bank accounts, and shareholders in the "state" column (JSON)');
  
  console.log('\n📊 Current data in project_states will be migrated to individual tables.');
  console.log('⚠️  Note: This is a one-way sync. Data in individual tables will be created.');
}

// Alternative: Direct SQL query to run in Supabase SQL Editor
console.log('\n\n🔧 ALTERNATIVE APPROACH - SQL MIGRATION');
console.log('════════════════════════════════════════════════════════════════');
console.log('Copy and paste this SQL in Supabase SQL Editor to migrate data:');
console.log('════════════════════════════════════════════════════════════════\n');

const sqlMigration = `
-- MIGRATION SCRIPT: Sync project_states to individual tables
-- Replace 'YOUR_ORG_ID' with your actual organization ID

DO $$
DECLARE
  org_id TEXT := 'YOUR_ORG_ID'; -- ⚠️ REPLACE THIS
  project_state JSONB;
  loan_record JSONB;
  bank_record JSONB;
  shareholder_record JSONB;
BEGIN
  -- Get project state
  SELECT state INTO project_state 
  FROM project_states 
  WHERE id = 'state_' || org_id;
  
  IF project_state IS NULL THEN
    RAISE NOTICE 'No project state found for organization %', org_id;
    RETURN;
  END IF;
  
  RAISE NOTICE 'Found project state with % loans, % bank accounts, % shareholders',
    COALESCE(jsonb_array_length(project_state->'loans'), 0),
    COALESCE(jsonb_array_length(project_state->'bankAccounts'), 0),
    COALESCE(jsonb_array_length(project_state->'shareholders'), 0);
  
  -- Migrate Loans
  FOR loan_record IN SELECT * FROM jsonb_array_elements(project_state->'loans')
  LOOP
    INSERT INTO loans (
      organization_id,
      loan_number,
      client_id,
      product_id,
      principal_amount,
      interest_rate,
      term,
      term_unit,
      repayment_frequency,
      purpose,
      total_amount,
      status,
      application_date,
      disbursement_method,
      disbursement_account
    ) VALUES (
      org_id,
      loan_record->>'id',
      loan_record->>'clientId',
      loan_record->>'productId',
      (loan_record->>'principalAmount')::DECIMAL,
      (loan_record->>'interestRate')::DECIMAL,
      (loan_record->>'term')::INTEGER,
      loan_record->>'termUnit',
      loan_record->>'repaymentFrequency',
      loan_record->>'purpose',
      (loan_record->>'totalAmount')::DECIMAL,
      COALESCE(loan_record->>'status', 'Pending'),
      COALESCE((loan_record->>'applicationDate')::DATE, CURRENT_DATE),
      loan_record->>'disbursementMethod',
      loan_record->>'disbursementAccount'
    )
    ON CONFLICT (loan_number, organization_id) DO NOTHING;
  END LOOP;
  
  -- Migrate Bank Accounts
  FOR bank_record IN SELECT * FROM jsonb_array_elements(project_state->'bankAccounts')
  LOOP
    INSERT INTO bank_accounts (
      organization_id,
      bank_name,
      account_name,
      account_number,
      account_type,
      currency,
      balance,
      branch,
      swift_code,
      notes
    ) VALUES (
      org_id,
      bank_record->>'bankName',
      bank_record->>'accountName',
      bank_record->>'accountNumber',
      COALESCE(bank_record->>'accountType', 'checking'),
      COALESCE(bank_record->>'currency', 'KES'),
      COALESCE((bank_record->>'balance')::DECIMAL, 0),
      bank_record->>'branch',
      bank_record->>'swiftCode',
      bank_record->>'notes'
    )
    ON CONFLICT (account_number, organization_id) DO NOTHING;
  END LOOP;
  
  -- Migrate Shareholders
  FOR shareholder_record IN SELECT * FROM jsonb_array_elements(project_state->'shareholders')
  LOOP
    INSERT INTO shareholders (
      organization_id,
      name,
      national_id,
      email,
      phone,
      address,
      shares_owned,
      share_capital,
      ownership_percentage,
      date_joined
    ) VALUES (
      org_id,
      shareholder_record->>'name',
      shareholder_record->>'nationalId',
      shareholder_record->>'email',
      shareholder_record->>'phone',
      shareholder_record->>'address',
      COALESCE((shareholder_record->>'sharesOwned')::INTEGER, 0),
      COALESCE((shareholder_record->>'shareCapital')::DECIMAL, 0),
      COALESCE((shareholder_record->>'ownershipPercentage')::DECIMAL, 0),
      COALESCE((shareholder_record->>'dateJoined')::DATE, CURRENT_DATE)
    )
    ON CONFLICT (national_id, organization_id) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Migration complete!';
END $$;
`;

console.log(sqlMigration);

console.log('\n════════════════════════════════════════════════════════════════');
console.log('📝 INSTRUCTIONS:');
console.log('1. Find your organization ID above');
console.log('2. Copy the SQL script above');
console.log('3. Go to Supabase → SQL Editor → New Query');
console.log('4. Replace YOUR_ORG_ID with your actual organization ID');
console.log('5. Click "Run"');
console.log('6. Check individual tables (loans, bank_accounts, shareholders)');
console.log('════════════════════════════════════════════════════════════════\n');
