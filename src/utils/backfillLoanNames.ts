/**
 * Utility script to backfill missing first_name, last_name, and staff_member_name
 * in the loans table by looking them up from the clients and users tables.
 * 
 * Run this once to populate all existing loans with the missing names.
 */

import { supabase } from '../lib/supabase';

export async function backfillLoanNames(organizationId: string): Promise<{
  total: number;
  updated: number;
  errors: number;
}> {
  console.log('🔄 Starting backfill of loan names...');
  
  let totalLoans = 0;
  let updatedLoans = 0;
  let errors = 0;
  
  try {
    // Step 1: Fetch all loans with their client_id and staff_member_id
    const { data: loans, error: fetchError } = await supabase
      .from('loans')
      .select('id, loan_number, client_id, staff_member_id, first_name, last_name, staff_member_name')
      .eq('organization_id', organizationId);
    
    if (fetchError) {
      console.error('❌ Error fetching loans:', fetchError);
      throw fetchError;
    }
    
    if (!loans || loans.length === 0) {
      console.log('ℹ️ No loans found for organization:', organizationId);
      return { total: 0, updated: 0, errors: 0 };
    }
    
    totalLoans = loans.length;
    console.log(`📊 Found ${totalLoans} loans to process`);
    
    // Step 2: Process each loan
    for (const loan of loans) {
      const updates: any = {};
      let needsUpdate = false;
      
      // Check if client names are missing
      if (loan.client_id && (!loan.first_name || !loan.last_name)) {
        console.log(`🔍 Loan ${loan.loan_number || loan.id}: Fetching client names for ${loan.client_id}`);
        
        try {
          const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('first_name, last_name')
            .eq('id', loan.client_id)
            .eq('organization_id', organizationId)
            .single();
          
          if (clientError) {
            console.warn(`⚠️ Could not fetch client for loan ${loan.loan_number}:`, clientError.message);
            errors++;
          } else if (clientData) {
            if (clientData.first_name) updates.first_name = clientData.first_name;
            if (clientData.last_name) updates.last_name = clientData.last_name;
            needsUpdate = true;
            console.log(`   ✅ Found client: ${clientData.first_name} ${clientData.last_name}`);
          }
        } catch (err) {
          console.warn(`⚠️ Error fetching client for loan ${loan.loan_number}:`, err);
          errors++;
        }
      }
      
      // Check if staff member name is missing
      if (loan.staff_member_id && !loan.staff_member_name) {
        console.log(`🔍 Loan ${loan.loan_number || loan.id}: Fetching staff name for ${loan.staff_member_id}`);
        
        try {
          const { data: staffData, error: staffError } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('id', loan.staff_member_id)
            .single();
          
          if (staffError) {
            console.warn(`⚠️ Could not fetch staff member for loan ${loan.loan_number}:`, staffError.message);
            errors++;
          } else if (staffData) {
            const staffName = `${staffData.first_name || ''} ${staffData.last_name || ''}`.trim() || null;
            if (staffName) {
              updates.staff_member_name = staffName;
              needsUpdate = true;
              console.log(`   ✅ Found staff: ${staffName}`);
            }
          }
        } catch (err) {
          console.warn(`⚠️ Error fetching staff member for loan ${loan.loan_number}:`, err);
          errors++;
        }
      }
      
      // Step 3: Update the loan if we have any updates
      if (needsUpdate && Object.keys(updates).length > 0) {
        console.log(`💾 Updating loan ${loan.loan_number || loan.id} with:`, updates);
        
        try {
          const { error: updateError } = await supabase
            .from('loans')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', loan.id)
            .eq('organization_id', organizationId);
          
          if (updateError) {
            console.error(`❌ Error updating loan ${loan.loan_number}:`, updateError);
            errors++;
          } else {
            updatedLoans++;
            console.log(`   ✅ Updated successfully`);
          }
        } catch (err) {
          console.error(`❌ Error updating loan ${loan.loan_number}:`, err);
          errors++;
        }
      } else {
        console.log(`ℹ️ Loan ${loan.loan_number || loan.id}: No updates needed`);
      }
    }
    
    console.log('\n✅ Backfill complete!');
    console.log(`   Total loans: ${totalLoans}`);
    console.log(`   Updated: ${updatedLoans}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Skipped (already had names): ${totalLoans - updatedLoans - errors}`);
    
    return {
      total: totalLoans,
      updated: updatedLoans,
      errors: errors
    };
    
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    throw error;
  }
}

/**
 * Run backfill for the current organization
 * Call this function from the browser console or add a button in the UI
 */
export async function runBackfillForCurrentOrg() {
  const orgData = localStorage.getItem('currentOrganization');
  if (!orgData) {
    console.error('❌ No organization found in localStorage');
    return;
  }
  
  const org = JSON.parse(orgData);
  console.log('🏢 Running backfill for organization:', org.organization_name);
  
  return await backfillLoanNames(org.id);
}