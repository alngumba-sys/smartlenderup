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
    
    // Create a map of loan ID to loan number
    const loanIdToNumber = new Map<string, string>();
    if (loans) {
      loans.forEach((loan: any) => {
        if (loan.id && loan.loan_number) {
          loanIdToNumber.set(loan.id, String(loan.loan_number));
        }
      });
    }
    
    // Query journal entries for loan disbursements
    // These entries have source_type = 'Loan Disbursement' and contain the loan ID in source_id
    const { data: journalEntries, error } = await supabase
      .from('journal_entries')
      .select('id, source_id')
      .eq('organization_id', organizationId)
      .eq('source_type', 'Loan Disbursement');
    
    if (error) {
      console.error('❌ Error loading journal entries:', error);
      return new Map();
    }
    
    const principalMap = new Map<string, number>();
    
    if (journalEntries && journalEntries.length > 0) {
      // Get all journal entry line IDs
      const journalEntryIds = journalEntries.map((je: any) => je.id);
      
      // Fetch all journal entry lines for these entries
      const { data: lines, error: linesError } = await supabase
        .from('journal_entry_lines')
        .select('journal_entry_id, credit, account_code')
        .in('journal_entry_id', journalEntryIds);
      
      if (linesError) {
        console.error('❌ Error loading journal entry lines:', linesError);
        return new Map();
      }
      
      // Create a map of journal entry ID to credit amount
      const journalEntryToCredit = new Map<string, number>();
      if (lines) {
        lines.forEach((line: any) => {
          if (line.credit && parseFloat(line.credit) > 0) {
            const credit = parseFloat(line.credit);
            const currentCredit = journalEntryToCredit.get(line.journal_entry_id) || 0;
            // Sum all credits (in case there are multiple credit lines)
            journalEntryToCredit.set(line.journal_entry_id, currentCredit + credit);
          }
        });
      }
      
      // Now map journal entries to loan numbers and extract principals
      journalEntries.forEach((entry: any) => {
        if (entry.source_id && entry.id) {
          const creditAmount = journalEntryToCredit.get(entry.id);
          const loanNumber = loanIdToNumber.get(entry.source_id);
          
          if (creditAmount && loanNumber) {
            // If multiple disbursements for same loan, sum them
            if (principalMap.has(loanNumber)) {
              principalMap.set(loanNumber, principalMap.get(loanNumber)! + creditAmount);
            } else {
              principalMap.set(loanNumber, creditAmount);
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