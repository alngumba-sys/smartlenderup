/**
 * ❌ DISABLED: Sample Data Population
 * 
 * This file has been DISABLED to enforce strict Supabase-only data storage.
 * NO mock data, NO localStorage fallbacks, NO sample data generation.
 * 
 * All data MUST come from Supabase database.
 * If database is offline, show "Database not reachable. Check your internet connection."
 */

export function populateSampleData(): boolean {
  console.warn('⚠️ Sample data population is DISABLED');
  console.warn('   All data must come from Supabase database');
  console.warn('   No localStorage fallbacks, no mock data');
  return false;
}

export function clearAllData(): void {
  console.warn('⚠️ clearAllData is DISABLED');
  console.warn('   Use Supabase database operations instead');
}

export function initializeSampleData(): void {
  console.warn('⚠️ Sample data initialization is DISABLED');
  console.warn('   All data must come from Supabase database');
}
