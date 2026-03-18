/**
 * Utility to Calculate and Fix Payment Allocations
 * 
 * This utility helps populate principal, interest, and penalty fields
 * for payments that don't have proper allocation, ensuring historical
 * payment records are correctly split between principal and interest.
 */

import type { Loan, Repayment } from '../contexts/DataContext';
import { allocatePayment } from './paymentAllocation';

export interface PaymentAllocationResult {
  paymentId: string;
  principal: number;
  interest: number;
  penalty: number;
  allocatedTotal: number;
}

export interface PaymentUpdate {
  paymentId: string;
  updates: {
    principal: number;
    interest: number;
    penalty: number;
  };
}

/**
 * Calculate allocations for all payments of a single loan
 * Processes payments chronologically to maintain accurate outstanding balances
 * 
 * @param loan - The loan
 * @param payments - All payments for this loan (will be sorted by date)
 * @returns Array of payment allocation results
 */
export function calculateLoanPaymentAllocations(
  loan: Loan,
  payments: Repayment[]
): PaymentAllocationResult[] {
  // Sort payments by date (oldest first)
  const sortedPayments = [...payments].sort((a, b) => {
    const dateA = new Date(a.paymentDate || a.date || 0).getTime();
    const dateB = new Date(b.paymentDate || b.date || 0).getTime();
    return dateA - dateB;
  });

  // Initialize running balances
  let runningPrincipalOutstanding = loan.principalOutstanding ?? loan.outstandingBalance ?? loan.principalAmount ?? 0;
  let runningInterestOutstanding = loan.interestOutstanding ?? loan.totalInterest ?? 0;

  console.log(`📊 Calculating allocations for loan ${loan.loanNumber || loan.id}:`, {
    initialPrincipalOutstanding: runningPrincipalOutstanding,
    initialInterestOutstanding: runningInterestOutstanding,
    paymentsToProcess: sortedPayments.length,
  });

  const results: PaymentAllocationResult[] = [];

  for (const payment of sortedPayments) {
    const paymentAmount = payment.amount || 0;
    const existingPenalty = payment.penalty || payment.penaltyAmount || 0;

    // Create a temporary loan object with current outstanding balances
    const loanWithCurrentBalances: Loan = {
      ...loan,
      principalOutstanding: runningPrincipalOutstanding,
      interestOutstanding: runningInterestOutstanding,
    };

    // Calculate allocation using the standard allocation function
    const allocation = allocatePayment(paymentAmount, loanWithCurrentBalances, existingPenalty);

    console.log(`  💸 Payment ${payment.id.slice(0, 8)}... (${paymentAmount}):`, {
      allocated: {
        principal: allocation.principal,
        interest: allocation.interest,
        penalty: allocation.penalty,
      },
      remainingBalances: {
        principal: Math.max(0, runningPrincipalOutstanding - allocation.principal),
        interest: Math.max(0, runningInterestOutstanding - allocation.interest),
      },
    });

    // Update running balances (reduce by what was paid)
    runningPrincipalOutstanding = Math.max(0, runningPrincipalOutstanding - allocation.principal);
    runningInterestOutstanding = Math.max(0, runningInterestOutstanding - allocation.interest);

    results.push({
      paymentId: payment.id,
      principal: allocation.principal,
      interest: allocation.interest,
      penalty: allocation.penalty,
      allocatedTotal: allocation.principal + allocation.interest + allocation.penalty,
    });
  }

  return results;
}

/**
 * Calculate allocations for all payments across all loans
 * 
 * @param loans - Array of all loans
 * @param payments - Array of all payments
 * @returns Map of payment ID to allocation result
 */
export function calculateAllPaymentAllocations(
  loans: Loan[],
  payments: Repayment[]
): Map<string, PaymentAllocationResult> {
  const results = new Map<string, PaymentAllocationResult>();

  // Group payments by loan
  const paymentsByLoan = new Map<string, Repayment[]>();
  
  payments.forEach(payment => {
    const loanId = payment.loanId || payment.loan_id;
    if (!loanId) return;

    if (!paymentsByLoan.has(loanId)) {
      paymentsByLoan.set(loanId, []);
    }
    paymentsByLoan.get(loanId)!.push(payment);
  });

  // Process each loan's payments
  loans.forEach(loan => {
    const loanPayments = paymentsByLoan.get(loan.id) || [];
    if (loanPayments.length === 0) return;

    const allocations = calculateLoanPaymentAllocations(loan, loanPayments);
    
    allocations.forEach(allocation => {
      results.set(allocation.paymentId, allocation);
    });
  });

  return results;
}

/**
 * Identify payments that need allocation fixes
 * 
 * @param payments - Array of payments to check
 * @returns Array of payment IDs that need fixes
 */
export function identifyPaymentsNeedingFixes(payments: Repayment[]): string[] {
  return payments
    .filter(payment => {
      const principalPaid = payment.principal || payment.principalAmount || payment.principalPortion || payment.principalPaid || 0;
      const interestPaid = payment.interest || payment.interestAmount || payment.interestPortion || payment.interestPaid || 0;
      
      // Payment needs fix if it has no allocation at all
      return principalPaid === 0 && interestPaid === 0;
    })
    .map(payment => payment.id);
}

/**
 * Generate update objects for payments that need allocation fixes
 * 
 * @param loans - Array of loans
 * @param payments - Array of payments
 * @returns Array of update objects { paymentId, updates }
 */
export function generatePaymentUpdates(
  loans: Loan[],
  payments: Repayment[]
): PaymentUpdate[] {
  const paymentsNeedingFix = payments.filter(payment => 
    identifyPaymentsNeedingFixes([payment]).length > 0
  );

  console.log(`🔧 Generating payment updates for ${paymentsNeedingFix.length} payments...`);

  if (paymentsNeedingFix.length === 0) {
    return [];
  }

  // Calculate allocations for all payments
  const allocations = calculateAllPaymentAllocations(loans, payments);

  console.log(`📊 Calculated allocations for ${allocations.size} payments`);

  // Generate updates only for payments that need fixes
  const updates = paymentsNeedingFix.map(payment => {
    const allocation = allocations.get(payment.id);
    
    if (!allocation) {
      // Fallback: if we can't calculate allocation, set to 0
      console.warn(`⚠️ No allocation found for payment ${payment.id}`);
      return {
        paymentId: payment.id,
        updates: {
          principal: 0,
          interest: 0,
          penalty: 0,
        },
      };
    }

    console.log(`✅ Generated update for payment ${payment.id.slice(0, 8)}:`, {
      principal: allocation.principal,
      interest: allocation.interest,
      penalty: allocation.penalty,
    });

    return {
      paymentId: payment.id,
      updates: {
        principal: allocation.principal,
        interest: allocation.interest,
        penalty: allocation.penalty,
      },
    };
  });

  console.log(`📦 Generated ${updates.length} payment updates`);
  return updates;
}

/**
 * Generate a summary report of payment allocations
 * 
 * @param loans - Array of loans
 * @param payments - Array of payments
 * @returns Summary statistics
 */
export function generatePaymentAllocationReport(
  loans: Loan[],
  payments: Repayment[]
) {
  const paymentsNeedingFix = identifyPaymentsNeedingFixes(payments);
  const allAllocations = calculateAllPaymentAllocations(loans, payments);

  let totalPrincipalAllocated = 0;
  let totalInterestAllocated = 0;
  let totalPenaltyAllocated = 0;
  let paymentsWithAllocation = 0;
  let paymentsWithoutAllocation = 0;

  payments.forEach(payment => {
    const existingPrincipal = payment.principal || payment.principalAmount || payment.principalPortion || payment.principalPaid || 0;
    const existingInterest = payment.interest || payment.interestAmount || payment.interestPortion || payment.interestPaid || 0;
    const existingPenalty = payment.penalty || payment.penaltyAmount || 0;

    const hasAllocation = existingPrincipal > 0 || existingInterest > 0 || existingPenalty > 0;

    if (hasAllocation) {
      paymentsWithAllocation++;
      totalPrincipalAllocated += existingPrincipal;
      totalInterestAllocated += existingInterest;
      totalPenaltyAllocated += existingPenalty;
    } else {
      paymentsWithoutAllocation++;
      // Use calculated allocation for summary
      const allocation = allAllocations.get(payment.id);
      if (allocation) {
        totalPrincipalAllocated += allocation.principal;
        totalInterestAllocated += allocation.interest;
        totalPenaltyAllocated += allocation.penalty;
      }
    }
  });

  return {
    totalPayments: payments.length,
    paymentsWithAllocation,
    paymentsWithoutAllocation,
    paymentsNeedingFix: paymentsNeedingFix.length,
    paymentsNeedingFixIds: paymentsNeedingFix,
    totalPrincipalAllocated,
    totalInterestAllocated,
    totalPenaltyAllocated,
    totalAllocated: totalPrincipalAllocated + totalInterestAllocated + totalPenaltyAllocated,
    allCalculatedAllocations: allAllocations,
  };
}

/**
 * Log diagnostic information about payment allocations
 */
export function logPaymentAllocationDiagnostic(
  loans: Loan[],
  payments: Repayment[]
): void {
  const report = generatePaymentAllocationReport(loans, payments);

  console.group('💰 Payment Allocation Diagnostic Report');
  console.log('Total Payments:', report.totalPayments);
  console.log('Payments with Allocation:', report.paymentsWithAllocation);
  console.log('Payments without Allocation:', report.paymentsWithoutAllocation);
  console.log('Payments Needing Fix:', report.paymentsNeedingFix);
  console.log('---');
  console.log('Total Principal Allocated:', report.totalPrincipalAllocated.toLocaleString());
  console.log('Total Interest Allocated:', report.totalInterestAllocated.toLocaleString());
  console.log('Total Penalty Allocated:', report.totalPenaltyAllocated.toLocaleString());
  console.log('Total Allocated:', report.totalAllocated.toLocaleString());
  
  if (report.paymentsNeedingFixIds.length > 0) {
    console.log('---');
    console.log('Payment IDs needing fix:', report.paymentsNeedingFixIds.slice(0, 10));
    if (report.paymentsNeedingFixIds.length > 10) {
      console.log(`... and ${report.paymentsNeedingFixIds.length - 10} more`);
    }
  }
  
  console.groupEnd();
}
