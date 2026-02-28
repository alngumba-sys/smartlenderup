/**
 * ✅ CORRECT PRINCIPAL CALCULATION - v4.0 DYNAMIC APPROACH
 * 
 * This module gets correct principal amounts using a 4-tier system:
 * 1. Disbursements table (source of truth - actual money disbursed)
 * 2. Known correct values (manual overrides for verified amounts)
 * 3. Reverse calculation (when principal_amount = total_amount in DB)
 * 4. Trust database (when data looks correct)
 */

/**
 * Manual overrides for specific loans (use only if disbursements data is also wrong)
 */
export const KNOWN_LOAN_PRINCIPALS: Record<string, number> = {
  // 📋 Add manual overrides here ONLY if disbursements table also has wrong data
  // Format: 'loan_number': principal_amount,
  // Example: '5224': 300000,
};

/**
 * Get the correct principal amount for a loan
 * 
 * @param loanNumber - The loan number
 * @param dbPrincipal - The value from database's principal_amount column (unreliable)
 * @param dbTotal - The value from database's total_amount column (may be unreliable)
 * @param interestRate - The interest rate
 * @param termPeriod - The term period in months
 * @param disbursementPrincipal - The amount from disbursements table (most reliable)
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
  // ✅ TIER 1: Use disbursement amount (SOURCE OF TRUTH - actual money disbursed)
  if (disbursementPrincipal !== undefined && disbursementPrincipal !== null && disbursementPrincipal > 0) {
    return disbursementPrincipal;
  }
  
  // ✅ TIER 2: Check manual overrides for specific loans
  if (KNOWN_LOAN_PRINCIPALS[loanNumber] !== undefined) {
    return KNOWN_LOAN_PRINCIPALS[loanNumber];
  }
  
  // ✅ TIER 3: If database principal_amount equals total_amount, they're likely wrong - use reverse calculation
  if (Math.abs(dbPrincipal - dbTotal) < 1) {
    const divisor = 1 + (interestRate * termPeriod / 100);
    return divisor > 0 ? (dbTotal / divisor) : dbPrincipal;
  }
  
  // ✅ TIER 4: Otherwise, trust the database's principal_amount
  return dbPrincipal;
}

/**
 * Check if a loan has known incorrect data
 */
export function hasKnownIncorrectData(loanNumber: string): boolean {
  return KNOWN_LOAN_PRINCIPALS[loanNumber] !== undefined;
}
