/**
 * Payment Allocation Utility
 * 
 * This utility calculates how a loan payment should be split between principal and interest
 * based on the loan's current outstanding balances and standard microfinance practices.
 */

import type { Loan } from '../contexts/DataContext';

export interface PaymentAllocation {
  principal: number;
  interest: number;
  penalty: number;
}

/**
 * Allocates a payment amount to principal, interest, and penalties
 * 
 * Standard microfinance allocation order:
 * 1. Penalties first
 * 2. Interest second
 * 3. Principal last
 * 
 * @param amount - Total payment amount
 * @param loan - The loan being paid
 * @param existingPenalty - Any penalty amount (optional, defaults to 0)
 * @returns Allocation breakdown
 */
export function allocatePayment(
  amount: number,
  loan: Loan,
  existingPenalty: number = 0
): PaymentAllocation {
  if (amount <= 0) {
    return { principal: 0, interest: 0, penalty: 0 };
  }

  // Get outstanding balances from loan
  const principalOutstanding = loan.principalOutstanding ?? loan.outstandingBalance ?? 0;
  const interestOutstanding = loan.interestOutstanding ?? 0;
  const penaltyOutstanding = existingPenalty || loan.penaltyAmount || 0;

  let remainingAmount = amount;
  let allocatedPenalty = 0;
  let allocatedInterest = 0;
  let allocatedPrincipal = 0;

  // Step 1: Allocate to penalties first
  if (penaltyOutstanding > 0) {
    allocatedPenalty = Math.min(remainingAmount, penaltyOutstanding);
    remainingAmount -= allocatedPenalty;
  }

  // Step 2: Allocate to interest second
  if (remainingAmount > 0 && interestOutstanding > 0) {
    allocatedInterest = Math.min(remainingAmount, interestOutstanding);
    remainingAmount -= allocatedInterest;
  }

  // Step 3: Allocate remaining to principal
  if (remainingAmount > 0) {
    allocatedPrincipal = Math.min(remainingAmount, principalOutstanding);
    remainingAmount -= allocatedPrincipal;
  }

  // Note: If remainingAmount > 0 after this, it means overpayment
  // This should be handled at a higher level (e.g., create a credit balance)

  return {
    principal: allocatedPrincipal,
    interest: allocatedInterest,
    penalty: allocatedPenalty
  };
}

/**
 * Alternative allocation method: Proportional split
 * 
 * Splits payment proportionally based on outstanding principal and interest
 * This might be used for partial payments where you want to maintain the ratio
 * 
 * @param amount - Total payment amount
 * @param loan - The loan being paid
 * @returns Allocation breakdown
 */
export function allocatePaymentProportional(
  amount: number,
  loan: Loan
): PaymentAllocation {
  if (amount <= 0) {
    return { principal: 0, interest: 0, penalty: 0 };
  }

  const principalOutstanding = loan.principalOutstanding ?? loan.outstandingBalance ?? 0;
  const interestOutstanding = loan.interestOutstanding ?? 0;
  const totalOutstanding = principalOutstanding + interestOutstanding;

  if (totalOutstanding === 0) {
    return { principal: 0, interest: 0, penalty: 0 };
  }

  // Calculate proportional allocation
  const principalRatio = principalOutstanding / totalOutstanding;
  const interestRatio = interestOutstanding / totalOutstanding;

  const allocatedPrincipal = Math.min(amount * principalRatio, principalOutstanding);
  const allocatedInterest = Math.min(amount * interestRatio, interestOutstanding);

  return {
    principal: allocatedPrincipal,
    interest: allocatedInterest,
    penalty: 0
  };
}

/**
 * Calculates expected principal and interest outstanding for a loan
 * based on the total interest and payments made
 * 
 * This is useful for loans that don't have principalOutstanding/interestOutstanding populated
 * 
 * @param loan - The loan
 * @param totalPaid - Total amount paid so far
 * @returns Estimated outstanding balances
 */
export function calculateOutstandingBalances(
  loan: Loan,
  totalPaid: number = 0
): { principalOutstanding: number; interestOutstanding: number } {
  // Total amounts
  const totalPrincipal = loan.principalAmount;
  const totalInterest = loan.totalInterest;
  const totalPayable = loan.totalRepayable;

  // If we have explicit outstanding values, use them
  if (loan.principalOutstanding !== undefined && loan.interestOutstanding !== undefined) {
    return {
      principalOutstanding: loan.principalOutstanding,
      interestOutstanding: loan.interestOutstanding
    };
  }

  // Otherwise, calculate based on allocation order (interest first, then principal)
  let remainingPayment = totalPaid;
  
  // First, deduct from interest
  const interestPaid = Math.min(remainingPayment, totalInterest);
  remainingPayment -= interestPaid;
  
  // Then, deduct from principal
  const principalPaid = Math.min(remainingPayment, totalPrincipal);
  
  return {
    principalOutstanding: totalPrincipal - principalPaid,
    interestOutstanding: totalInterest - interestPaid
  };
}

/**
 * Debug function to log payment allocation details
 */
export function logPaymentAllocation(
  amount: number,
  loan: Loan,
  allocation: PaymentAllocation
): void {
  console.group('💰 Payment Allocation');
  console.log('Payment Amount:', amount);
  console.log('Loan ID:', loan.loanNumber || loan.id);
  console.log('Principal Outstanding:', loan.principalOutstanding);
  console.log('Interest Outstanding:', loan.interestOutstanding);
  console.log('Penalty Outstanding:', loan.penaltyAmount);
  console.log('---');
  console.log('Allocated to Principal:', allocation.principal);
  console.log('Allocated to Interest:', allocation.interest);
  console.log('Allocated to Penalty:', allocation.penalty);
  console.log('Total Allocated:', allocation.principal + allocation.interest + allocation.penalty);
  console.groupEnd();
}
