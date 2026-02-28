/**
 * Utility to fix incorrect loan data in the database using CSV data as source of truth
 * Updates: principal_amount, interest_rate, term_period, outstanding_balance, amount_paid
 */

import { supabase } from '../lib/supabase';

// CSV data from loans_rows-3.csv (source of truth)
const CORRECT_LOAN_DATA = [
  { loan_number: "LN018", principal_amount: 15000, interest_rate: 2.50, term_period: 3, outstanding_balance: 16125, amount_paid: 0 },
  { loan_number: "4867", principal_amount: 50000, interest_rate: 10.00, term_period: 1, outstanding_balance: 10000, amount_paid: 55000 },
  { loan_number: "5110", principal_amount: 50000, interest_rate: 7.50, term_period: 2, outstanding_balance: 2500, amount_paid: 57500 },
  { loan_number: "LN019", principal_amount: 100000, interest_rate: 7.50, term_period: 1, outstanding_balance: 107500, amount_paid: 0 },
  { loan_number: "5396", principal_amount: 100000, interest_rate: 7.50, term_period: 1, outstanding_balance: 2500, amount_paid: 107500 },
  { loan_number: "4863", principal_amount: 100000, interest_rate: 10.00, term_period: 1, outstanding_balance: 20000, amount_paid: 110000 },
  { loan_number: "4860", principal_amount: 100000, interest_rate: 5.00, term_period: 1, outstanding_balance: 5000, amount_paid: 105000 },
  { loan_number: "LN013", principal_amount: 20000, interest_rate: 2.50, term_period: 3, outstanding_balance: 21500, amount_paid: 0 },
  { loan_number: "LN007", principal_amount: 170000, interest_rate: 7.50, term_period: 3, outstanding_balance: 208250, amount_paid: 0 },
  { loan_number: "LN008", principal_amount: 60000, interest_rate: 7.50, term_period: 1, outstanding_balance: 64500, amount_paid: 0 },
  { loan_number: "LN005", principal_amount: 20000, interest_rate: 10.00, term_period: 1, outstanding_balance: 0, amount_paid: 22000 },
  { loan_number: "4859", principal_amount: 50000, interest_rate: 5.00, term_period: 1, outstanding_balance: 10000, amount_paid: 52500 },
  { loan_number: "4928", principal_amount: 200000, interest_rate: 7.50, term_period: 2, outstanding_balance: 10000, amount_paid: 230000 },
  { loan_number: "LN012", principal_amount: 30000, interest_rate: 2.50, term_period: 3, outstanding_balance: 32250, amount_paid: 0 },
  { loan_number: "LN011", principal_amount: 300000, interest_rate: 7.50, term_period: 3, outstanding_balance: 367500, amount_paid: 0 },
  { loan_number: "LN004", principal_amount: 100000, interest_rate: 7.50, term_period: 2, outstanding_balance: 115000, amount_paid: 0 },
  { loan_number: "5471", principal_amount: 150000, interest_rate: 7.50, term_period: 2, outstanding_balance: 172500, amount_paid: 0 },
  { loan_number: "4862", principal_amount: 75000, interest_rate: 5.00, term_period: 1, outstanding_balance: 3750, amount_paid: 78750 },
  { loan_number: "5054", principal_amount: 100000, interest_rate: 10.00, term_period: 1, outstanding_balance: 20000, amount_paid: 110000 },
  { loan_number: "5328", principal_amount: 300000, interest_rate: 2.50, term_period: 3, outstanding_balance: 390000, amount_paid: 0 },
  { loan_number: "5276", principal_amount: 35000, interest_rate: 7.50, term_period: 1, outstanding_balance: 875, amount_paid: 37625 },
  { loan_number: "4865", principal_amount: 50000, interest_rate: 10.00, term_period: 1, outstanding_balance: 10000, amount_paid: 55000 },
  { loan_number: "4866", principal_amount: 50000, interest_rate: 10.00, term_period: 1, outstanding_balance: 10000, amount_paid: 55000 },
  { loan_number: "LN015", principal_amount: 30000, interest_rate: 2.50, term_period: 3, outstanding_balance: 32250, amount_paid: 0 },
  { loan_number: "4858", principal_amount: 250000, interest_rate: 10.00, term_period: 1, outstanding_balance: 50000, amount_paid: 275000 },
  { loan_number: "4845", principal_amount: 50000, interest_rate: 10.00, term_period: 1, outstanding_balance: 10000, amount_paid: 55000 },
  { loan_number: "LN014", principal_amount: 20000, interest_rate: 2.50, term_period: 3, outstanding_balance: 21500, amount_paid: 0 },
  { loan_number: "5224", principal_amount: 300000, interest_rate: 7.50, term_period: 2, outstanding_balance: 20000, amount_paid: 340000 },
  { loan_number: "5220", principal_amount: 300000, interest_rate: 7.50, term_period: 2, outstanding_balance: 217500, amount_paid: 172500 },
  { loan_number: "LN016", principal_amount: 12000, interest_rate: 2.50, term_period: 3, outstanding_balance: 12900, amount_paid: 0 },
  { loan_number: "5343", principal_amount: 150000, interest_rate: 7.50, term_period: 1, outstanding_balance: 3750, amount_paid: 161250 },
  { loan_number: "5044", principal_amount: 200000, interest_rate: 10.00, term_period: 1, outstanding_balance: 220000, amount_paid: 220000 },
  { loan_number: "4864", principal_amount: 100000, interest_rate: 10.00, term_period: 1, outstanding_balance: 20000, amount_paid: 110000 },
  { loan_number: "5002", principal_amount: 150000, interest_rate: 10.00, term_period: 1, outstanding_balance: 30000, amount_paid: 165000 },
  { loan_number: "4926", principal_amount: 200000, interest_rate: 2.50, term_period: 3, outstanding_balance: 188333, amount_paid: 71700 },
  { loan_number: "LN006", principal_amount: 20000, interest_rate: 10.00, term_period: 1, outstanding_balance: 22000, amount_paid: 0 },
  { loan_number: "LN001", principal_amount: 200000, interest_rate: 7.50, term_period: 1, outstanding_balance: 161250, amount_paid: 0 },
  { loan_number: "5344", principal_amount: 33000, interest_rate: 7.50, term_period: 1, outstanding_balance: 825, amount_paid: 35475 },
  { loan_number: "4869", principal_amount: 50000, interest_rate: 30.00, term_period: 3, outstanding_balance: 0, amount_paid: 60600 },
  { loan_number: "4875", principal_amount: 100000, interest_rate: 10.00, term_period: 1, outstanding_balance: 20000, amount_paid: 110000 },
  { loan_number: "LN017", principal_amount: 15000, interest_rate: 2.50, term_period: 3, outstanding_balance: 16125, amount_paid: 0 },
  { loan_number: "4895", principal_amount: 40000, interest_rate: 10.00, term_period: 1, outstanding_balance: 8000, amount_paid: 44000 },
  { loan_number: "4878", principal_amount: 150000, interest_rate: 2.39, term_period: 3, outstanding_balance: 18750, amount_paid: 160750 },
  { loan_number: "LN010", principal_amount: 35000, interest_rate: 10.00, term_period: 1, outstanding_balance: 38500, amount_paid: 0 },
  { loan_number: "4861", principal_amount: 30000, interest_rate: 5.00, term_period: 1, outstanding_balance: 6000, amount_paid: 31500 },
  { loan_number: "LN009", principal_amount: 25000, interest_rate: 7.50, term_period: 1, outstanding_balance: 26875, amount_paid: 0 },
  { loan_number: "LN003", principal_amount: 100000, interest_rate: 10.00, term_period: 1, outstanding_balance: 110000, amount_paid: 0 },
  { loan_number: "LN002", principal_amount: 100000, interest_rate: 10.00, term_period: 1, outstanding_balance: 0, amount_paid: 110000 },
];

export async function fixPrincipalAmounts(organizationId: string) {
  try {
    console.log('🔧 Starting loan data fix from CSV...');
    console.log(`📊 CSV has ${CORRECT_LOAN_DATA.length} loan records`);
    
    let successCount = 0;
    let notFoundCount = 0;
    const errors: any[] = [];
    
    for (const correctData of CORRECT_LOAN_DATA) {
      try {
        // Find the loan by loan_number
        const { data: existingLoans, error: findError } = await supabase
          .from('loans')
          .select('id, loan_number, principal_amount, interest_rate, term_period, outstanding_balance, amount_paid')
          .eq('organization_id', organizationId)
          .eq('loan_number', correctData.loan_number);
        
        if (findError) throw findError;
        
        if (!existingLoans || existingLoans.length === 0) {
          console.log(`⚠️ Loan ${correctData.loan_number} not found in database`);
          notFoundCount++;
          continue;
        }
        
        const existing = existingLoans[0];
        
        // Check if any field needs updating
        const needsUpdate = 
          Math.abs(parseFloat(existing.principal_amount) - correctData.principal_amount) > 0.01 ||
          Math.abs(parseFloat(existing.interest_rate) - correctData.interest_rate) > 0.01 ||
          parseInt(existing.term_period) !== correctData.term_period ||
          Math.abs(parseFloat(existing.outstanding_balance) - correctData.outstanding_balance) > 0.01 ||
          Math.abs(parseFloat(existing.amount_paid) - correctData.amount_paid) > 0.01;
        
        if (needsUpdate) {
          console.log(`🔧 Updating ${correctData.loan_number}:`, {
            principal: `${parseFloat(existing.principal_amount).toLocaleString()} → ${correctData.principal_amount.toLocaleString()}`,
            rate: `${existing.interest_rate}% → ${correctData.interest_rate}%`,
            term: `${existing.term_period} → ${correctData.term_period}`,
            outstanding: `${parseFloat(existing.outstanding_balance).toLocaleString()} → ${correctData.outstanding_balance.toLocaleString()}`,
            paid: `${parseFloat(existing.amount_paid).toLocaleString()} → ${correctData.amount_paid.toLocaleString()}`
          });
          
          // Update the loan
          const { error: updateError } = await supabase
            .from('loans')
            .update({
              principal_amount: correctData.principal_amount,
              interest_rate: correctData.interest_rate,
              term_period: correctData.term_period,
              outstanding_balance: correctData.outstanding_balance,
              amount_paid: correctData.amount_paid,
            })
            .eq('id', existing.id);
          
          if (updateError) {
            console.error(`❌ Error updating ${correctData.loan_number}:`, updateError);
            errors.push({ loan: correctData.loan_number, error: updateError.message });
          } else {
            successCount++;
            console.log(`✅ Updated ${correctData.loan_number}`);
          }
        } else {
          console.log(`✅ ${correctData.loan_number}: already correct`);
          successCount++;
        }
        
      } catch (err: any) {
        console.error(`❌ Exception processing ${correctData.loan_number}:`, err);
        errors.push({ loan: correctData.loan_number, error: err.message });
      }
    }
    
    console.log(`\n✅ Loan data fix complete!`);
    console.log(`   Updated: ${successCount}/${CORRECT_LOAN_DATA.length}`);
    console.log(`   Not found: ${notFoundCount}`);
    if (errors.length > 0) {
      console.log(`   Errors: ${errors.length}`);
      console.log('   Error details:', errors);
    }
    
    return {
      fixed: successCount,
      notFound: notFoundCount,
      errors
    };
    
  } catch (error: any) {
    console.error('❌ Error in fixPrincipalAmounts:', error);
    throw error;
  }
}
