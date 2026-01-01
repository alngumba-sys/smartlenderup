import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

/**
 * ============================================
 * DUAL STORAGE SYNC PATTERN
 * ============================================
 * 
 * This utility saves data to BOTH:
 * 1. project_states table (JSON blob) - for fast bulk operations
 * 2. Individual tables (normalized) - for Super Admin queries
 * 
 * This ensures compatibility with both the manager view
 * (using project_states) and Super Admin view (using individual tables)
 */

// ============================================
// SYNC FUNCTIONS
// ============================================

/**
 * Sync clients to individual 'clients' table
 */
export async function syncClientsToTable(
  userId: string,
  organizationId: string,
  clients: any[]
): Promise<boolean> {
  try {
    if (!clients || clients.length === 0) {
      console.log('ℹ️ No clients to sync');
      return true;
    }

    // Delete existing clients for this organization
    await supabase
      .from('clients')
      .delete()
      .eq('user_id', userId);

    // Insert all clients
    const clientRecords = clients.map(client => ({
      id: client.id,
      user_id: userId,
      name: client.name,
      email: client.email || null,
      phone: client.phone || null,
      id_number: client.idNumber || null,
      address: client.address || null,
      city: client.city || null,
      county: client.county || null,
      occupation: client.occupation || null,
      employer: client.employer || null,
      monthly_income: client.monthlyIncome || null,
      date_of_birth: client.dateOfBirth || null,
      gender: client.gender || null,
      marital_status: client.maritalStatus || null,
      next_of_kin: client.nextOfKin || null,
      status: client.status || 'Active',
      photo: client.photo || null,
      documents: client.documents || null,
      group_membership: client.groupMembership || null,
      credit_score: client.creditScore || null,
      risk_rating: client.riskRating || null,
      client_type: client.clientType || null,
      business_type: client.businessType || null,
      branch: client.branch || null,
      join_date: client.joinDate || new Date().toISOString().split('T')[0],
      created_by: client.createdBy || 'system',
      last_updated: client.lastUpdated || new Date().toISOString(),
      created_at: client.createdAt || new Date().toISOString(),
      updated_at: client.updatedAt || new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('clients')
      .insert(clientRecords);

    if (error) {
      console.error('❌ Error syncing clients:', error);
      return false;
    }

    console.log(`✅ Synced ${clients.length} clients to table`);
    return true;
  } catch (error) {
    console.error('❌ Exception syncing clients:', error);
    return false;
  }
}

/**
 * Sync loans to individual 'loans' table
 */
export async function syncLoansToTable(
  userId: string,
  organizationId: string,
  loans: any[]
): Promise<boolean> {
  try {
    if (!loans || loans.length === 0) {
      console.log('ℹ️ No loans to sync');
      return true;
    }

    // Delete existing loans for this organization
    await supabase
      .from('loans')
      .delete()
      .eq('user_id', userId);

    // Insert all loans
    const loanRecords = loans.map(loan => ({
      id: loan.id,
      user_id: userId,
      client_id: loan.clientId,
      client_name: loan.clientName || null,
      product_id: loan.productId || null,
      product_name: loan.productName || null,
      principal_amount: loan.principalAmount || 0,
      interest_rate: loan.interestRate || 0,
      interest_type: loan.interestType || 'Flat',
      term: loan.term || 0,
      term_unit: loan.termUnit || 'Months',
      repayment_frequency: loan.repaymentFrequency || 'Monthly',
      disbursement_date: loan.disbursementDate || null,
      first_repayment_date: loan.firstRepaymentDate || null,
      maturity_date: loan.maturityDate || null,
      status: loan.status || 'Pending',
      approved_by: loan.approvedBy || null,
      approved_date: loan.approvedDate || null,
      disbursed_by: loan.disbursedBy || null,
      disbursed_date: loan.disbursedDate || null,
      payment_source: loan.paymentSource || null,
      collateral: loan.collateral || null,
      guarantors: loan.guarantors || null,
      total_interest: loan.totalInterest || 0,
      total_repayable: loan.totalRepayable || 0,
      installment_amount: loan.installmentAmount || 0,
      number_of_installments: loan.numberOfInstallments || 0,
      paid_amount: loan.paidAmount || 0,
      outstanding_balance: loan.outstandingBalance || 0,
      principal_outstanding: loan.principalOutstanding || 0,
      interest_outstanding: loan.interestOutstanding || 0,
      days_in_arrears: loan.daysInArrears || 0,
      arrears_amount: loan.arrearsAmount || 0,
      overdue_amount: loan.overdueAmount || 0,
      penalty_amount: loan.penaltyAmount || 0,
      purpose: loan.purpose || null,
      application_date: loan.applicationDate || null,
      created_by: loan.createdBy || 'system',
      last_payment_date: loan.lastPaymentDate || null,
      last_payment_amount: loan.lastPaymentAmount || null,
      next_payment_date: loan.nextPaymentDate || null,
      next_payment_amount: loan.nextPaymentAmount || null,
      loan_officer: loan.loanOfficer || null,
      notes: loan.notes || null,
      created_date: loan.createdDate || null,
      last_updated: loan.lastUpdated || new Date().toISOString(),
      created_at: loan.createdAt || new Date().toISOString(),
      updated_at: loan.updatedAt || new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('loans')
      .insert(loanRecords);

    if (error) {
      console.error('❌ Error syncing loans:', error);
      return false;
    }

    console.log(`✅ Synced ${loans.length} loans to table`);
    return true;
  } catch (error) {
    console.error('❌ Exception syncing loans:', error);
    return false;
  }
}

/**
 * Sync repayments to individual 'repayments' table
 */
export async function syncRepaymentsToTable(
  userId: string,
  organizationId: string,
  repayments: any[]
): Promise<boolean> {
  try {
    if (!repayments || repayments.length === 0) {
      console.log('ℹ️ No repayments to sync');
      return true;
    }

    // Delete existing repayments for this organization
    await supabase
      .from('repayments')
      .delete()
      .eq('user_id', userId);

    // Insert all repayments
    const repaymentRecords = repayments.map(repayment => ({
      id: repayment.id,
      user_id: userId,
      loan_id: repayment.loanId,
      client_id: repayment.clientId,
      client_name: repayment.clientName || null,
      amount: repayment.amount || 0,
      principal: repayment.principal || 0,
      interest: repayment.interest || 0,
      penalty: repayment.penalty || 0,
      payment_method: repayment.paymentMethod || null,
      payment_reference: repayment.paymentReference || null,
      payment_date: repayment.paymentDate,
      receipt_number: repayment.receiptNumber || null,
      received_by: repayment.receivedBy || null,
      notes: repayment.notes || null,
      status: repayment.status || 'Completed',
      approved_by: repayment.approvedBy || null,
      approved_date: repayment.approvedDate || null,
      bank_account_id: repayment.bankAccountId || null,
      created_date: repayment.createdDate || null,
      created_at: repayment.createdAt || new Date().toISOString(),
      updated_at: repayment.updatedAt || new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('repayments')
      .insert(repaymentRecords);

    if (error) {
      console.error('❌ Error syncing repayments:', error);
      return false;
    }

    console.log(`✅ Synced ${repayments.length} repayments to table`);
    return true;
  } catch (error) {
    console.error('❌ Exception syncing repayments:', error);
    return false;
  }
}

/**
 * Sync all other entities to their respective tables
 */
export async function syncAllEntitiesToTables(
  userId: string,
  organizationId: string,
  projectState: any
): Promise<boolean> {
  try {
    console.log('🔄 Starting dual storage sync...');

    // Sync clients
    if (projectState.clients) {
      await syncClientsToTable(userId, organizationId, projectState.clients);
    }

    // Sync loans
    if (projectState.loans) {
      await syncLoansToTable(userId, organizationId, projectState.loans);
    }

    // Sync repayments
    if (projectState.repayments) {
      await syncRepaymentsToTable(userId, organizationId, projectState.repayments);
    }

    // TODO: Add more entity syncs as needed (savings, shareholders, etc.)

    console.log('✅ Dual storage sync complete');
    return true;
  } catch (error) {
    console.error('❌ Error in dual storage sync:', error);
    return false;
  }
}
