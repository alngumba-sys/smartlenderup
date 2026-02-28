import { supabase } from '../lib/supabase';

// Cache to avoid reloading on every call
let disbursementPrincipalsCache: Map<string, number> | null = null;
let cacheOrganizationId: string | null = null;

/**
 * Load all disbursements from journal entries and create a principal mapping
 */
export async function loadDisbursementPrincipals(organizationId: string): Promise<Map<string, number>> {
  // Return cache if available for this organization
  if (disbursementPrincipalsCache && cacheOrganizationId === organizationId) {
    return disbursementPrincipalsCache;
  }
  
  console.log('💰 Loading disbursement principals from journal entries...');
  console.log('🔍 Organization ID:', organizationId);
  
  try {
    // First, get all loans to map loan ID to loan number
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('id, loan_number')
      .eq('organization_id', organizationId);
    
    if (loansError) {
      console.error('❌ Error loading loans:', loansError);
      return new Map();
    }
    
    console.log(`📋 Found ${loans?.length || 0} loans in database`);
    console.log('📋 Sample loans:', loans?.slice(0, 3));
    
    // Create a map of loan ID to loan number
    const loanIdToNumber = new Map<string, string>();
    if (loans) {
      loans.forEach((loan: any) => {
        if (loan.id && loan.loan_number) {
          loanIdToNumber.set(loan.id, String(loan.loan_number));
        }
      });
    }
    
    console.log(`📋 Created loan ID map with ${loanIdToNumber.size} entries`);
    
    // Query journal entries for loan disbursements
    // These entries have source_type = 'Loan Disbursement' and contain the loan ID in source_id
    const { data: journalEntries, error } = await supabase
      .from('journal_entries')
      .select('id, source_id, source_type, description, entry_date')
      .eq('organization_id', organizationId)
      .eq('source_type', 'Loan Disbursement');
    
    if (error) {
      console.error('❌ Error loading journal entries:', error);
      return new Map();
    }
    
    console.log(`📒 Found ${journalEntries?.length || 0} journal entries with source_type='Loan Disbursement'`);
    console.log('📒 Sample journal entries:', journalEntries?.slice(0, 3));
    
    const principalMap = new Map<string, number>();
    
    if (journalEntries && journalEntries.length > 0) {
      // Get all journal entry line IDs
      const journalEntryIds = journalEntries.map((je: any) => je.id);
      
      // Fetch all journal entry lines for these entries
      const { data: lines, error: linesError } = await supabase
        .from('journal_entry_lines')
        .select('journal_entry_id, debit, credit, account_code, account_name, description')
        .in('journal_entry_id', journalEntryIds);
      
      if (linesError) {
        console.error('❌ Error loading journal entry lines:', linesError);
        return new Map();
      }
      
      console.log(`📊 Found ${lines?.length || 0} journal entry lines total`);
      console.log('📊 Sample lines (all):', lines?.slice(0, 10));
      
      // Filter for account 1200 only
      const account1200Lines = lines?.filter((line: any) => line.account_code === '1200');
      console.log(`📊 Found ${account1200Lines?.length || 0} lines with account_code='1200'`);
      console.log('📊 Account 1200 lines:', account1200Lines?.slice(0, 10));
      
      // Create a map of journal entry ID to debit amount (principal)
      const journalEntryToPrincipal = new Map<string, number>();
      if (account1200Lines) {
        account1200Lines.forEach((line: any) => {
          // The principal is the DEBIT to Loans Receivable (account 1200)
          if (line.debit && parseFloat(line.debit) > 0) {
            const debit = parseFloat(line.debit);
            const currentDebit = journalEntryToPrincipal.get(line.journal_entry_id) || 0;
            console.log(`  💵 Journal Entry ${line.journal_entry_id}: Adding debit ${debit} to account 1200`);
            // Sum all debits to account 1200 (in case there are multiple lines)
            journalEntryToPrincipal.set(line.journal_entry_id, currentDebit + debit);
          }
        });
      }
      
      console.log(`📊 Journal Entry to Principal map has ${journalEntryToPrincipal.size} entries`);
      
      // Now map journal entries to loan numbers and extract principals
      journalEntries.forEach((entry: any) => {
        if (entry.source_id && entry.id) {
          const principal = journalEntryToPrincipal.get(entry.id);
          const loanNumber = loanIdToNumber.get(entry.source_id);
          
          console.log(`  🔗 Journal Entry ${entry.id} -> Loan ID ${entry.source_id} -> Loan Number ${loanNumber} -> Principal ${principal}`);
          
          if (principal && loanNumber) {
            // If multiple disbursements for same loan, sum them
            if (principalMap.has(loanNumber)) {
              principalMap.set(loanNumber, principalMap.get(loanNumber)! + principal);
            } else {
              principalMap.set(loanNumber, principal);
            }
          }
        }
      });
      
      console.log(`✅ Loaded ${principalMap.size} loan principals from ${journalEntries.length} journal entries`);
      console.log('📋 Sample disbursement principals:', 
        Array.from(principalMap.entries()).slice(0, 5)
      );
    } else {
      console.log('ℹ️ No loan disbursement journal entries found');
    }
    
    // Cache the result
    disbursementPrincipalsCache = principalMap;
    cacheOrganizationId = organizationId;
    
    return principalMap;
  } catch (error) {
    console.error('❌ Exception loading disbursement principals:', error);
    return new Map();
  }
}

/**
 * Clear the cache (call when disbursements change)
 */
export function clearDisbursementPrincipalsCache() {
  disbursementPrincipalsCache = null;
  cacheOrganizationId = null;
  console.log('🗑️ Cleared disbursement principals cache');
}

/**
 * Get principal from disbursements map
 */
export function getPrincipalFromDisbursements(
  loanNumber: string,
  disbursementPrincipals: Map<string, number>
): number | null {
  const principal = disbursementPrincipals.get(loanNumber);
  return principal !== undefined ? principal : null;
}