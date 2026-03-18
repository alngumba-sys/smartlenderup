/**
 * Manual overrides for specific loans (use only if database AND disbursements are both wrong)
 */
export const KNOWN_LOAN_PRINCIPALS: Record<string, number> = {
  // 📋 Add manual overrides here ONLY if database AND disbursements both have wrong data
  // Format: 'loan_number': principal_amount,
  // Example: '5224': 300000,
  '5077': 100000, // ✅ Stephen Mulu Nzavi - Correct principal is KSh 100,000
};

/**
 * Get the correct principal amount for a loan
 * 
 * @param loanNumber - The loan number
 * @param dbPrincipal - The value from database's principal_amount column
 * @param dbTotal - The value from database's total_amount column
 * @param interestRate - The interest rate
 * @param termPeriod - The term period in months
 * @param disbursementPrincipal - The amount from disbursements table (verification)
 * @returns The correct principal amount
 */
export function getCorrectPrincipal(
  loanNumber: string,
  dbPrincipal: number,
  dbTotal: number,
  interestRate: number,
  termPeriod: number,
  disbursementPrincipal?: number | null
): number {
  // ✅ TIER 1: Check manual overrides for specific loans (HIGHEST PRIORITY)
  if (KNOWN_LOAN_PRINCIPALS[loanNumber] !== undefined) {
    return KNOWN_LOAN_PRINCIPALS[loanNumber];
  }
  
  // ✅ TIER 2: If database principal looks valid (not equal to total), TRUST IT
  // The principal_amount field is the source of truth from the loans table
  if (dbPrincipal > 0 && Math.abs(dbPrincipal - dbTotal) >= 1) {
    return dbPrincipal;
  }
  
  // ✅ TIER 3: Use disbursement amount as fallback (if database principal is invalid)
  if (disbursementPrincipal !== undefined && disbursementPrincipal !== null && disbursementPrincipal > 0) {
    return disbursementPrincipal;
  }
  
  // ✅ TIER 4: If database principal_amount equals total_amount, they're likely wrong - use reverse calculation
  if (dbPrincipal > 0 && Math.abs(dbPrincipal - dbTotal) < 1) {
    const divisor = 1 + (interestRate * termPeriod / 100);
    return divisor > 0 ? (dbTotal / divisor) : dbPrincipal;
  }
  
  // ✅ TIER 5: Last resort - return database principal even if it might be wrong
  return dbPrincipal;
}

/**
 * Check if a loan has known incorrect data
 */
export function hasKnownIncorrectData(loanNumber: string): boolean {
  return KNOWN_LOAN_PRINCIPALS[loanNumber] !== undefined;
}