/**
 * Super Admin Data Fix Utility
 * 
 * This utility ensures all data is properly synced to Supabase
 * so the Super Admin dashboard can display correct statistics
 */

import { supabase } from '../lib/supabase';
import { db } from './database';

interface SyncReport {
  clients: {
    local: number;
    supabase: number;
    synced: number;
    failed: number;
  };
  loans: {
    local: number;
    supabase: number;
    synced: number;
    failed: number;
  };
  repayments: {
    local: number;
    supabase: number;
    synced: number;
    failed: number;
  };
  organizations: {
    local: number;
    supabase: number;
    synced: number;
    failed: number;
  };
}

/**
 * Sync all localStorage data to Supabase for Super Admin visibility
 */
export async function syncAllDataToSupabase(): Promise<SyncReport> {
  console.log('🔄 ===== SUPER ADMIN DATA SYNC =====');
  
  const report: SyncReport = {
    clients: { local: 0, supabase: 0, synced: 0, failed: 0 },
    loans: { local: 0, supabase: 0, synced: 0, failed: 0 },
    repayments: { local: 0, supabase: 0, synced: 0, failed: 0 },
    organizations: { local: 0, supabase: 0, synced: 0, failed: 0 }
  };

  try {
    // SYNC ORGANIZATIONS
    console.log('\n📊 Syncing Organizations...');
    const localOrgs = db.getAllOrganizations();
    report.organizations.local = localOrgs.length;
    
    const { data: supabaseOrgs } = await supabase.from('organizations').select('id');
    report.organizations.supabase = supabaseOrgs?.length || 0;
    
    const existingOrgIds = new Set(supabaseOrgs?.map(o => o.id) || []);
    
    for (const org of localOrgs) {
      try {
        if (!existingOrgIds.has(org.id)) {
          const { error } = await supabase.from('organizations').insert({
            id: org.id,
            organization_name: org.organization_name,
            username: org.username,
            email: org.email,
            contact_person_email: org.contact_person_email,
            password_hash: org.password_hash,
            country: org.country,
            currency: org.currency,
            county: org.county,
            town: org.town,
            address: org.address,
            phone: org.phone,
            status: org.status || 'active',
            registration_number: org.registration_number,
            industry: org.industry,
            organization_type: org.organization_type,
            created_at: org.created_at,
            updated_at: org.updated_at
          });
          
          if (error) {
            console.error(`❌ Failed to sync org ${org.organization_name}:`, error);
            report.organizations.failed++;
          } else {
            console.log(`✅ Synced organization: ${org.organization_name}`);
            report.organizations.synced++;
          }
        }
      } catch (err) {
        console.error(`❌ Error syncing org ${org.organization_name}:`, err);
        report.organizations.failed++;
      }
    }

    // SYNC CLIENTS
    console.log('\n📊 Syncing Clients...');
    const localClients = db.getAllClients();
    report.clients.local = localClients.length;
    
    const { data: supabaseClients } = await supabase.from('clients').select('id');
    report.clients.supabase = supabaseClients?.length || 0;
    
    const existingClientIds = new Set(supabaseClients?.map(c => c.id) || []);
    
    for (const client of localClients) {
      try {
        if (!existingClientIds.has(client.id)) {
          const { error } = await supabase.from('clients').insert({
            id: client.id,
            organization_id: client.organization_id,
            client_number: client.client_number,
            name: client.name,
            email: client.email,
            phone: client.phone,
            id_number: client.id_number,
            date_of_birth: client.date_of_birth,
            gender: client.gender,
            marital_status: client.marital_status,
            occupation: client.occupation,
            employer: client.employer,
            monthly_income: client.monthly_income,
            county: client.county,
            town: client.town,
            address: client.address,
            credit_score: client.credit_score || 0,
            status: client.status || 'active',
            type: client.type || 'individual',
            created_at: client.created_at,
            updated_at: client.updated_at
          });
          
          if (error) {
            console.error(`❌ Failed to sync client ${client.name}:`, error);
            report.clients.failed++;
          } else {
            console.log(`✅ Synced client: ${client.name}`);
            report.clients.synced++;
          }
        }
      } catch (err) {
        console.error(`❌ Error syncing client ${client.name}:`, err);
        report.clients.failed++;
      }
    }

    // SYNC LOANS
    console.log('\n📊 Syncing Loans...');
    const localLoans = db.getAllLoans();
    report.loans.local = localLoans.length;
    
    const { data: supabaseLoans } = await supabase.from('loans').select('id');
    report.loans.supabase = supabaseLoans?.length || 0;
    
    const existingLoanIds = new Set(supabaseLoans?.map(l => l.id) || []);
    
    for (const loan of localLoans) {
      try {
        if (!existingLoanIds.has(loan.id)) {
          const { error } = await supabase.from('loans').insert({
            id: loan.id,
            organization_id: loan.organization_id,
            client_id: loan.client_id,
            loan_number: loan.loan_number,
            product_id: loan.product_id,
            amount: loan.amount,
            interest_rate: loan.interest_rate,
            term_period: loan.term_period,
            term_period_unit: loan.term_period_unit || 'months',
            repayment_frequency: loan.repayment_frequency,
            purpose: loan.purpose,
            disbursement_method: loan.disbursement_method,
            disbursement_account: loan.disbursement_account,
            status: loan.status,
            phase: loan.phase || 'application',
            application_date: loan.application_date,
            approval_date: loan.approval_date,
            disbursement_date: loan.disbursement_date,
            maturity_date: loan.maturity_date,
            total_amount: loan.total_amount,
            balance: loan.balance,
            created_at: loan.created_at,
            updated_at: loan.updated_at
          });
          
          if (error) {
            console.error(`❌ Failed to sync loan ${loan.loan_number}:`, error);
            report.loans.failed++;
          } else {
            console.log(`✅ Synced loan: ${loan.loan_number}`);
            report.loans.synced++;
          }
        }
      } catch (err) {
        console.error(`❌ Error syncing loan ${loan.loan_number}:`, err);
        report.loans.failed++;
      }
    }

    // SYNC REPAYMENTS
    console.log('\n📊 Syncing Repayments...');
    const localRepayments = db.getAllRepayments();
    report.repayments.local = localRepayments.length;
    
    const { data: supabaseRepayments } = await supabase.from('repayments').select('id');
    report.repayments.supabase = supabaseRepayments?.length || 0;
    
    const existingRepaymentIds = new Set(supabaseRepayments?.map(r => r.id) || []);
    
    for (const repayment of localRepayments) {
      try {
        if (!existingRepaymentIds.has(repayment.id)) {
          const { error } = await supabase.from('repayments').insert({
            id: repayment.id,
            organization_id: repayment.organization_id,
            loan_id: repayment.loan_id,
            client_id: repayment.client_id,
            amount: repayment.amount,
            payment_date: repayment.payment_date,
            payment_method: repayment.payment_method,
            transaction_ref: repayment.transaction_ref,
            status: repayment.status,
            created_at: repayment.created_at,
            updated_at: repayment.updated_at
          });
          
          if (error) {
            console.error(`❌ Failed to sync repayment ${repayment.id}:`, error);
            report.repayments.failed++;
          } else {
            console.log(`✅ Synced repayment: ${repayment.id}`);
            report.repayments.synced++;
          }
        }
      } catch (err) {
        console.error(`❌ Error syncing repayment ${repayment.id}:`, err);
        report.repayments.failed++;
      }
    }

    console.log('\n✅ ===== SYNC COMPLETE =====');
    console.log('📊 Sync Report:', report);
    
  } catch (error) {
    console.error('❌ Fatal error during sync:', error);
  }

  return report;
}

/**
 * Check if data exists in Supabase
 */
export async function checkSupabaseData(): Promise<void> {
  console.log('🔍 ===== CHECKING SUPABASE DATA =====');
  
  try {
    const [orgsResult, clientsResult, loansResult, repaymentsResult] = await Promise.all([
      supabase.from('organizations').select('id, organization_name', { count: 'exact' }),
      supabase.from('clients').select('id, name', { count: 'exact' }),
      supabase.from('loans').select('id, loan_number, status', { count: 'exact' }),
      supabase.from('repayments').select('id, amount', { count: 'exact' })
    ]);

    console.log('\n📊 Supabase Data:');
    console.log(`  Organizations: ${orgsResult.count || 0}`);
    console.log(`  Clients: ${clientsResult.count || 0}`);
    console.log(`  Loans: ${loansResult.count || 0}`);
    console.log(`  Repayments: ${repaymentsResult.count || 0}`);

    console.log('\n📋 Sample Data:');
    console.log('  Organizations:', orgsResult.data?.slice(0, 3));
    console.log('  Clients:', clientsResult.data?.slice(0, 3));
    console.log('  Loans:', loansResult.data?.slice(0, 3));
    console.log('  Repayments:', repaymentsResult.data?.slice(0, 3));

    console.log('\n📦 LocalStorage Data:');
    console.log(`  Organizations: ${db.getAllOrganizations().length}`);
    console.log(`  Clients: ${db.getAllClients().length}`);
    console.log(`  Loans: ${db.getAllLoans().length}`);
    console.log(`  Repayments: ${db.getAllRepayments().length}`);
    
  } catch (error) {
    console.error('❌ Error checking Supabase data:', error);
  }
}

// Register global functions
if (typeof window !== 'undefined') {
  (window as any).syncAllDataToSupabase = syncAllDataToSupabase;
  (window as any).checkSupabaseData = checkSupabaseData;
  
  console.log('✅ Super Admin Data Fix utilities registered:');
  console.log('   - window.syncAllDataToSupabase()');
  console.log('   - window.checkSupabaseData()');
}
