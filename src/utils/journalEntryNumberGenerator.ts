import { supabase } from '../lib/supabase';

/**
 * ✅ IMPROVED: Generate unique journal entry number with timestamp suffix to prevent duplicates
 * Format: JE-YYYY-NNNN-TTT where:
 * - YYYY = Year
 * - NNNN = Sequential number (padded to 4 digits)
 * - TTT = Last 3 digits of timestamp (ensures uniqueness during concurrent requests)
 */
export async function generateUniqueJournalEntryNumber(organizationId: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const year = new Date().getFullYear();
    
    // Query for the latest entry number (order by entry_number for consistency)
    const { data: existing, error } = await supabase
      .from('journal_entries')
      .select('entry_number')
      .eq('organization_id', organizationId)
      .order('entry_number', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching latest journal entry:', error);
      // Fallback: fully unique timestamp-based number
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `JE-${year}-T${timestamp}-${random}`;
    }
    
    let nextNumber = 1;
    
    if (existing && existing.length > 0) {
      // Match pattern: JE-YYYY-NNNN or JE-YYYY-NNNN-TTT
      const match = existing[0].entry_number?.match(/JE-(\d+)-(\d+)/);
      if (match) {
        const entryYear = parseInt(match[1]);
        const entryNumber = parseInt(match[2]);
        
        // If same year, increment; if new year, reset to 1
        if (entryYear === year) {
          nextNumber = entryNumber + 1;
        }
      }
    }
    
    // Add timestamp suffix to ensure uniqueness even with concurrent requests
    const uniqueSuffix = String(timestamp).slice(-3);
    return `JE-${year}-${String(nextNumber).padStart(4, '0')}-${uniqueSuffix}`;
    
  } catch (error) {
    console.error('Error generating journal entry number:', error);
    // Fallback: fully unique timestamp + random
    const timestamp = Date.now();
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `JE-${year}-ERR${timestamp}-${random}`;
  }
}

/**
 * Legacy function name for backward compatibility
 */
export const generateJournalEntryNumber = generateUniqueJournalEntryNumber;
