/**
 * ONE-TIME MIGRATION UTILITY
 * 
 * This script syncs all data from project_states (JSON blob) 
 * to individual Supabase tables (loans, bank_accounts, shareholders, etc.)
 * 
 * Run this once to migrate your existing data, then delete this file.
 */

import { supabase } from '../lib/supabase';
import { supabaseDataService } from '../services/supabaseDataService';

export async function syncProjectStatesToIndividualTables(organizationId: string): Promise<void> {
  try {
    console.log('🔄 Starting migration from project_states to individual tables...');
    
    // 1. Load project state
    const { data: projectStateData, error: loadError } = await supabase
      .from('project_states')
      .select('state')
      .eq('id', `state_${organizationId}`)
      .single();
    
    if (loadError) {
      console.error('❌ Error loading project state:', loadError);
      throw loadError;
    }
    
    if (!projectStateData || !projectStateData.state) {
      console.log('ℹ️  No project state found. Nothing to migrate.');
      return;
    }
    
    const projectState = projectStateData.state;
    console.log('📦 Project state loaded:', {
      loans: projectState.loans?.length || 0,
      bankAccounts: projectState.bankAccounts?.length || 0,
      shareholders: projectState.shareholders?.length || 0,
      loanProducts: projectState.loanProducts?.length || 0,
    });
    
    // 2. Sync Loans
    if (projectState.loans && projectState.loans.length > 0) {
      console.log(`\n📝 Syncing ${projectState.loans.length} loans...`);
      
      for (const loan of projectState.loans) {
        try {
          // Check if loan already exists
          const { data: existingLoan } = await supabase
            .from('loans')
            .select('id')
            .eq('loan_number', loan.id)
            .eq('organization_id', organizationId)
            .maybeSingle();
          
          if (existingLoan) {
            console.log(`  ⏭️  Loan ${loan.id} already exists, skipping...`);
            continue;
          }
          
          // Create loan in Supabase
          await supabaseDataService.loans.create({
            clientId: loan.clientId,
            productId: loan.productId,
            amount: loan.principalAmount,
            principalAmount: loan.principalAmount,
            interestRate: loan.interestRate,
            term: loan.term,
            termUnit: loan.termUnit,
            repaymentFrequency: loan.repaymentFrequency,
            purpose: loan.purpose,
            totalAmount: loan.totalAmount,
            disbursementMethod: loan.disbursementMethod,
            disbursementAccount: loan.disbursementAccount,
          }, organizationId);
          
          console.log(`  ✅ Loan ${loan.id} synced`);
        } catch (error: any) {
          console.error(`  ❌ Error syncing loan ${loan.id}:`, error.message);
        }
      }
    }
    
    // 3. Sync Bank Accounts
    if (projectState.bankAccounts && projectState.bankAccounts.length > 0) {
      console.log(`\n💰 Syncing ${projectState.bankAccounts.length} bank accounts...`);
      
      for (const account of projectState.bankAccounts) {
        try {
          // Check if account already exists
          const { data: existingAccount } = await supabase
            .from('bank_accounts')
            .select('id')
            .eq('account_number', account.accountNumber)
            .eq('organization_id', organizationId)
            .maybeSingle();
          
          if (existingAccount) {
            console.log(`  ⏭️  Account ${account.accountNumber} already exists, skipping...`);
            continue;
          }
          
          // Create bank account in Supabase
          await supabaseDataService.bankAccounts.create({
            bank_name: account.bankName,
            account_name: account.accountName,
            account_number: account.accountNumber,
            account_type: account.accountType || 'checking',
            currency: account.currency || 'KES',
            balance: account.balance || 0,
            branch: account.branch,
            swift_code: account.swiftCode,
            notes: account.notes,
          }, organizationId);
          
          console.log(`  ✅ Account ${account.accountNumber} synced`);
        } catch (error: any) {
          console.error(`  ❌ Error syncing account ${account.accountNumber}:`, error.message);
        }
      }
    }
    
    // 4. Sync Shareholders
    if (projectState.shareholders && projectState.shareholders.length > 0) {
      console.log(`\n👥 Syncing ${projectState.shareholders.length} shareholders...`);
      
      for (const shareholder of projectState.shareholders) {
        try {
          // Check if shareholder already exists
          const { data: existingShareholder } = await supabase
            .from('shareholders')
            .select('id')
            .eq('national_id', shareholder.nationalId)
            .eq('organization_id', organizationId)
            .maybeSingle();
          
          if (existingShareholder) {
            console.log(`  ⏭️  Shareholder ${shareholder.name} already exists, skipping...`);
            continue;
          }
          
          // Create shareholder in Supabase
          await supabaseDataService.shareholders.create({
            name: shareholder.name,
            national_id: shareholder.nationalId,
            email: shareholder.email,
            phone: shareholder.phone,
            address: shareholder.address,
            shares_owned: shareholder.sharesOwned || 0,
            share_capital: shareholder.shareCapital || 0,
            ownership_percentage: shareholder.ownershipPercentage || 0,
            date_joined: shareholder.dateJoined,
          }, organizationId);
          
          console.log(`  ✅ Shareholder ${shareholder.name} synced`);
        } catch (error: any) {
          console.error(`  ❌ Error syncing shareholder ${shareholder.name}:`, error.message);
        }
      }
    }
    
    // 5. Sync Loan Products (if any missing)
    if (projectState.loanProducts && projectState.loanProducts.length > 0) {
      console.log(`\n📦 Syncing ${projectState.loanProducts.length} loan products...`);
      
      for (const product of projectState.loanProducts) {
        try {
          // Check if product already exists
          const { data: existingProduct } = await supabase
            .from('loan_products')
            .select('id')
            .eq('product_code', product.productCode)
            .eq('organization_id', organizationId)
            .maybeSingle();
          
          if (existingProduct) {
            console.log(`  ⏭️  Product ${product.name} already exists, skipping...`);
            continue;
          }
          
          // Create loan product in Supabase
          await supabaseDataService.loanProducts.create({
            name: product.name,
            productCode: product.productCode,
            description: product.description,
            minAmount: product.minimumAmount,
            maxAmount: product.maximumAmount,
            minTerm: product.minimumTerm,
            maxTerm: product.maximumTerm,
            termUnit: product.termUnit,
            interestRate: product.interestRate,
            interestMethod: product.interestMethod,
            repaymentFrequency: product.repaymentFrequency,
            processingFeePercentage: product.processingFeeType === 'Percentage' ? product.processingFee : 0,
            processingFeeFixed: product.processingFeeType === 'Fixed' ? product.processingFee : 0,
            guarantorRequired: product.requireGuarantor,
            collateralRequired: product.requireCollateral,
          }, organizationId);
          
          console.log(`  ✅ Product ${product.name} synced`);
        } catch (error: any) {
          console.error(`  ❌ Error syncing product ${product.name}:`, error.message);
        }
      }
    }
    
    console.log('\n✅ Migration complete!');
    console.log('💡 You can now view your data in individual Supabase tables.');
    console.log('💡 Future operations will write directly to these tables.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Register global function for easy access
if (typeof window !== 'undefined') {
  (window as any).migrateToIndividualTables = async () => {
    const orgData = localStorage.getItem('current_organization');
    if (!orgData) {
      console.error('❌ No organization found in localStorage');
      return;
    }
    const org = JSON.parse(orgData);
    
    console.log('🚀 Starting migration for organization:', org.organization_name);
    console.log('⏳ This may take a few moments...');
    
    try {
      await syncProjectStatesToIndividualTables(org.id);
      console.log('🎉 Migration successful!');
    } catch (error) {
      console.error('💥 Migration failed:', error);
    }
  };
  
  console.log('✅ Migration utility loaded');
  console.log('💡 Run: window.migrateToIndividualTables()');
}
