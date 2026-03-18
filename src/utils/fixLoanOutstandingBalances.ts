/**
 * Utility to Calculate and Fix Outstanding Balances for Existing Loans
 * 
 * This utility helps populate principalOutstanding and interestOutstanding
 * for loans that don't have these fields set, ensuring the payment allocation
 * system works correctly.
 */

import type { Loan, Repayment } from '../contexts/DataContext';

export interface OutstandingBalances {
  principalOutstanding: number;
  interestOutstanding: number;
  totalOutstanding: number;
}

/**
 * Calculate outstanding balances for a single loan
 * 
 * Allocation order (standard microfinance practice):
 * 1. Payments first reduce interest
 * 2. Remaining amount reduces principal
 * 
 * @param loan - The loan to calculate balances for
 * @param payments - Array of all payments for this loan
 * @returns Outstanding balances
 */
export function calculateLoanOutstandingBalances(
  loan: Loan,
  payments: Repayment[] = []
): OutstandingBalances {
  // If loan already has explicit outstanding balances, use them
  if (
    loan.principalOutstanding !== undefined &&
    loan.interestOutstanding !== undefined
  ) {
    return {
      principalOutstanding: loan.principalOutstanding,
      interestOutstanding: loan.interestOutstanding,
      totalOutstanding: loan.principalOutstanding + loan.interestOutstanding,
    };
  }

  // Starting balances
  const totalPrincipal = loan.principalAmount;
  const totalInterest = loan.totalInterest;

  // Calculate total paid from payment records
  // Check if payments have explicit principal/interest breakdown
  const paymentsWithAllocation = payments.filter(
    p => (p.principal !== undefined && p.principal > 0) || (p.interest !== undefined && p.interest > 0)
  );

  let principalPaid = 0;
  let interestPaid = 0;

  if (paymentsWithAllocation.length > 0) {
    // Use explicit allocations if available
    principalPaid = payments.reduce((sum, p) => sum + (p.principal || 0), 0);
    interestPaid = payments.reduce((sum, p) => sum + (p.interest || 0), 0);
  } else {
    // If no explicit allocations, use the standard allocation order
    // (Interest first, then Principal)
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    // First, pay off interest
    interestPaid = Math.min(totalPaid, totalInterest);
    
    // Remaining amount goes to principal
    const remainingForPrincipal = totalPaid - interestPaid;
    principalPaid = Math.min(remainingForPrincipal, totalPrincipal);
  }

  // Calculate outstanding amounts
  const principalOutstanding = Math.max(0, totalPrincipal - principalPaid);
  const interestOutstanding = Math.max(0, totalInterest - interestPaid);

  return {
    principalOutstanding,
    interestOutstanding,
    totalOutstanding: principalOutstanding + interestOutstanding,
  };
}

/**
 * Calculate outstanding balances for multiple loans
 * 
 * @param loans - Array of loans to process
 * @param payments - Array of all payments
 * @returns Map of loan ID to outstanding balances
 */
export function calculateAllLoanOutstandingBalances(
  loans: Loan[],
  payments: Repayment[]
): Map<string, OutstandingBalances> {
  const results = new Map<string, OutstandingBalances>();

  loans.forEach(loan => {
    // Get all payments for this loan
    const loanPayments = payments.filter(
      p => p.loanId === loan.id || p.loanId === loan.loanNumber
    );

    const balances = calculateLoanOutstandingBalances(loan, loanPayments);
    results.set(loan.id, balances);
  });

  return results;
}

/**
 * Identify loans that need outstanding balance fixes
 * 
 * @param loans - Array of loans to check
 * @returns Array of loan IDs that need fixes
 */
export function identifyLoansNeedingFixes(loans: Loan[]): string[] {
  return loans
    .filter(loan => {
      // Check if loan is missing outstanding balances
      const missingPrincipal = loan.principalOutstanding === undefined || loan.principalOutstanding === null;
      const missingInterest = loan.interestOutstanding === undefined || loan.interestOutstanding === null;
      
      // Only fix active loans (not fully paid or closed)
      const isActive = !['Fully Paid', 'Closed', 'Written Off'].includes(loan.status);
      
      return (missingPrincipal || missingInterest) && isActive;
    })
    .map(loan => loan.id);
}

/**
 * Generate a summary report of outstanding balances
 * 
 * @param loans - Array of loans
 * @param payments - Array of payments
 * @returns Summary statistics
 */
export function generateOutstandingBalancesReport(
  loans: Loan[],
  payments: Repayment[]
) {
  const loansNeedingFix = identifyLoansNeedingFixes(loans);
  const balances = calculateAllLoanOutstandingBalances(loans, payments);

  let totalPrincipalOutstanding = 0;
  let totalInterestOutstanding = 0;
  let loansWithAllocation = 0;
  let loansWithoutAllocation = 0;

  loans.forEach(loan => {
    const hasAllocation = 
      loan.principalOutstanding !== undefined && 
      loan.interestOutstanding !== undefined;

    if (hasAllocation) {
      loansWithAllocation++;
      totalPrincipalOutstanding += loan.principalOutstanding!;
      totalInterestOutstanding += loan.interestOutstanding!;
    } else {
      loansWithoutAllocation++;
      const calculated = balances.get(loan.id);
      if (calculated) {
        totalPrincipalOutstanding += calculated.principalOutstanding;
        totalInterestOutstanding += calculated.interestOutstanding;
      }
    }
  });

  return {
    totalLoans: loans.length,
    loansWithAllocation,
    loansWithoutAllocation,
    loansNeedingFix: loansNeedingFix.length,
    loansNeedingFixIds: loansNeedingFix,
    totalPrincipalOutstanding,
    totalInterestOutstanding,
    totalOutstanding: totalPrincipalOutstanding + totalInterestOutstanding,
    allCalculatedBalances: balances,
  };
}

/**
 * Create update objects for loans that need outstanding balance fixes
 * 
 * @param loans - Array of loans
 * @param payments - Array of payments
 * @returns Array of update objects { loanId, updates }
 */
export function generateLoanUpdates(
  loans: Loan[],
  payments: Repayment[]
): Array<{ loanId: string; updates: Partial<Loan> }> {
  const loansNeedingFix = loans.filter(loan => 
    identifyLoansNeedingFixes([loan]).length > 0
  );

  return loansNeedingFix.map(loan => {
    const loanPayments = payments.filter(
      p => p.loanId === loan.id || p.loanId === loan.loanNumber
    );

    const balances = calculateLoanOutstandingBalances(loan, loanPayments);

    return {
      loanId: loan.id,
      updates: {
        principalOutstanding: balances.principalOutstanding,
        interestOutstanding: balances.interestOutstanding,
        outstandingBalance: balances.totalOutstanding,
      },
    };
  });
}

/**
 * Log diagnostic information about outstanding balances
 */
export function logOutstandingBalancesDiagnostic(
  loans: Loan[],
  payments: Repayment[]
): void {
  const report = generateOutstandingBalancesReport(loans, payments);

  console.group('📊 Outstanding Balances Diagnostic Report');
  console.log('Total Loans:', report.totalLoans);
  console.log('Loans with Allocation:', report.loansWithAllocation);
  console.log('Loans without Allocation:', report.loansWithoutAllocation);
  console.log('Loans Needing Fix:', report.loansNeedingFix);
  console.log('---');
  console.log('Total Principal Outstanding:', report.totalPrincipalOutstanding.toLocaleString());
  console.log('Total Interest Outstanding:', report.totalInterestOutstanding.toLocaleString());
  console.log('Total Outstanding:', report.totalOutstanding.toLocaleString());
  
  if (report.loansNeedingFixIds.length > 0) {
    console.log('---');
    console.log('Loan IDs needing fix:', report.loansNeedingFixIds);
  }
  
  console.groupEnd();
}
