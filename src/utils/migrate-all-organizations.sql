-- =====================================================
-- MIGRATION: Sync ALL project_states to individual tables
-- This migrates data for ALL organizations automatically
-- =====================================================

DO $$
DECLARE
  state_record RECORD;
  project_state JSONB;
  org_id TEXT;
  loan_record JSONB;
  bank_record JSONB;
  shareholder_record JSONB;
  product_record JSONB;
  total_orgs INTEGER := 0;
  total_loans INTEGER := 0;
  total_banks INTEGER := 0;
  total_shareholders INTEGER := 0;
  total_products INTEGER := 0;
BEGIN
  RAISE NOTICE '🔄 Starting migration for ALL organizations...';
  
  -- Loop through ALL project_states
  FOR state_record IN 
    SELECT id, organization_id, state 
    FROM project_states 
    WHERE state IS NOT NULL
  LOOP
    org_id := state_record.organization_id;
    project_state := state_record.state;
    total_orgs := total_orgs + 1;
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📋 Processing Organization ID: %', org_id;
    RAISE NOTICE '   Loans: %', COALESCE(jsonb_array_length(project_state->'loans'), 0);
    RAISE NOTICE '   Bank Accounts: %', COALESCE(jsonb_array_length(project_state->'bankAccounts'), 0);
    RAISE NOTICE '   Shareholders: %', COALESCE(jsonb_array_length(project_state->'shareholders'), 0);
    RAISE NOTICE '   Loan Products: %', COALESCE(jsonb_array_length(project_state->'loanProducts'), 0);
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    
    -- ========== MIGRATE LOAN PRODUCTS ==========
    IF project_state ? 'loanProducts' AND jsonb_array_length(project_state->'loanProducts') > 0 THEN
      RAISE NOTICE '📦 Migrating % loan products...', jsonb_array_length(project_state->'loanProducts');
      
      FOR product_record IN SELECT * FROM jsonb_array_elements(project_state->'loanProducts')
      LOOP
        BEGIN
          INSERT INTO loan_products (
            organization_id,
            product_code,
            name,
            description,
            min_amount,
            max_amount,
            min_term,
            max_term,
            term_unit,
            interest_rate,
            interest_method,
            repayment_frequency,
            processing_fee_percentage,
            processing_fee_fixed,
            guarantor_required,
            collateral_required,
            is_active
          ) VALUES (
            org_id,
            product_record->>'productCode',
            product_record->>'name',
            product_record->>'description',
            COALESCE((product_record->>'minimumAmount')::DECIMAL, 0),
            COALESCE((product_record->>'maximumAmount')::DECIMAL, 0),
            COALESCE((product_record->>'minimumTerm')::INTEGER, 1),
            COALESCE((product_record->>'maximumTerm')::INTEGER, 12),
            COALESCE(product_record->>'termUnit', 'Months'),
            COALESCE((product_record->>'interestRate')::DECIMAL, 0),
            COALESCE(product_record->>'interestMethod', 'Flat Rate'),
            COALESCE(product_record->>'repaymentFrequency', 'Monthly'),
            CASE WHEN product_record->>'processingFeeType' = 'Percentage' 
              THEN COALESCE((product_record->>'processingFee')::DECIMAL, 0) 
              ELSE 0 END,
            CASE WHEN product_record->>'processingFeeType' = 'Fixed' 
              THEN COALESCE((product_record->>'processingFee')::DECIMAL, 0) 
              ELSE 0 END,
            COALESCE((product_record->>'requireGuarantor')::BOOLEAN, false),
            COALESCE((product_record->>'requireCollateral')::BOOLEAN, false),
            true
          )
          ON CONFLICT (product_code, organization_id) DO NOTHING;
          
          total_products := total_products + 1;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE '  ⚠️  Error migrating product %: %', product_record->>'name', SQLERRM;
        END;
      END LOOP;
    END IF;
    
    -- ========== MIGRATE LOANS ==========
    IF project_state ? 'loans' AND jsonb_array_length(project_state->'loans') > 0 THEN
      RAISE NOTICE '💰 Migrating % loans...', jsonb_array_length(project_state->'loans');
      
      FOR loan_record IN SELECT * FROM jsonb_array_elements(project_state->'loans')
      LOOP
        BEGIN
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
            approval_date,
            disbursement_date,
            disbursement_method,
            disbursement_account,
            maturity_date
          ) VALUES (
            org_id,
            loan_record->>'id',
            loan_record->>'clientId',
            loan_record->>'productId',
            COALESCE((loan_record->>'principalAmount')::DECIMAL, 0),
            COALESCE((loan_record->>'interestRate')::DECIMAL, 0),
            COALESCE((loan_record->>'term')::INTEGER, 1),
            COALESCE(loan_record->>'termUnit', 'Months'),
            COALESCE(loan_record->>'repaymentFrequency', 'Monthly'),
            loan_record->>'purpose',
            COALESCE((loan_record->>'totalAmount')::DECIMAL, 0),
            COALESCE(loan_record->>'status', 'Pending'),
            COALESCE((loan_record->>'applicationDate')::DATE, CURRENT_DATE),
            (loan_record->>'approvalDate')::DATE,
            (loan_record->>'disbursementDate')::DATE,
            loan_record->>'disbursementMethod',
            loan_record->>'disbursementAccount',
            (loan_record->>'maturityDate')::DATE
          )
          ON CONFLICT (loan_number, organization_id) DO NOTHING;
          
          total_loans := total_loans + 1;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE '  ⚠️  Error migrating loan %: %', loan_record->>'id', SQLERRM;
        END;
      END LOOP;
    END IF;
    
    -- ========== MIGRATE BANK ACCOUNTS ==========
    IF project_state ? 'bankAccounts' AND jsonb_array_length(project_state->'bankAccounts') > 0 THEN
      RAISE NOTICE '🏦 Migrating % bank accounts...', jsonb_array_length(project_state->'bankAccounts');
      
      FOR bank_record IN SELECT * FROM jsonb_array_elements(project_state->'bankAccounts')
      LOOP
        BEGIN
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
          
          total_banks := total_banks + 1;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE '  ⚠️  Error migrating bank account %: %', bank_record->>'accountNumber', SQLERRM;
        END;
      END LOOP;
    END IF;
    
    -- ========== MIGRATE SHAREHOLDERS ==========
    IF project_state ? 'shareholders' AND jsonb_array_length(project_state->'shareholders') > 0 THEN
      RAISE NOTICE '👥 Migrating % shareholders...', jsonb_array_length(project_state->'shareholders');
      
      FOR shareholder_record IN SELECT * FROM jsonb_array_elements(project_state->'shareholders')
      LOOP
        BEGIN
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
          
          total_shareholders := total_shareholders + 1;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE '  ⚠️  Error migrating shareholder %: %', shareholder_record->>'name', SQLERRM;
        END;
      END LOOP;
    END IF;
    
    RAISE NOTICE '✅ Organization % complete', org_id;
    
  END LOOP;
  
  -- Final Summary
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ MIGRATION COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'Organizations processed: %', total_orgs;
  RAISE NOTICE 'Loan Products migrated: %', total_products;
  RAISE NOTICE 'Loans migrated: %', total_loans;
  RAISE NOTICE 'Bank Accounts migrated: %', total_banks;
  RAISE NOTICE 'Shareholders migrated: %', total_shareholders;
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  
END $$;
