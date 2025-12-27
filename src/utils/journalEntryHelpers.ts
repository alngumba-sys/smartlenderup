import { JournalEntry, JournalEntryLine, Loan, Repayment, Expense } from '../contexts/DataContext';

// Helper to create journal entry lines
const createLine = (accountCode: string, accountName: string, description: string, debit: number, credit: number): JournalEntryLine => ({
  id: `LINE${Date.now()}-${Math.random()}`,
  accountCode,
  accountName,
  description,
  debit,
  credit,
});

// Generate journal entry for loan disbursement
export const createLoanDisbursementEntry = (
  loan: Loan,
  disbursementDate: string,
  createdBy: string
): Omit<JournalEntry, 'id' | 'entryNumber' | 'createdDate' | 'totalDebit' | 'totalCredit'> => {
  const lines: JournalEntryLine[] = [
    // Debit: Loan Portfolio (Asset increases)
    createLine(
      '1100',
      'Loan Portfolio',
      `Loan disbursed to ${loan.clientName}`,
      loan.principalAmount,
      0
    ),
    // Credit: Cash/Bank (Asset decreases - cash out)
    createLine(
      '1000',
      'Cash and Cash Equivalents',
      `Loan disbursement - ${loan.clientName}`,
      0,
      loan.principalAmount
    ),
  ];

  return {
    date: disbursementDate,
    description: `Loan Disbursement - ${loan.clientName} (${loan.productName})`,
    reference: loan.id,
    sourceType: 'Loan Disbursement',
    sourceId: loan.id,
    lines,
    status: 'Posted',
    createdBy,
    postedDate: disbursementDate,
  };
};

// Generate journal entry for loan repayment
export const createLoanRepaymentEntry = (
  repayment: Repayment,
  clientName: string,
  createdBy: string
): Omit<JournalEntry, 'id' | 'entryNumber' | 'createdDate' | 'totalDebit' | 'totalCredit'> => {
  const lines: JournalEntryLine[] = [];

  // Debit: Cash/Bank (Asset increases - cash in)
  lines.push(
    createLine(
      '1000',
      'Cash and Cash Equivalents',
      `Repayment from ${clientName}`,
      repayment.amount,
      0
    )
  );

  // Credit: Principal portion reduces Loan Portfolio
  if (repayment.principal > 0) {
    lines.push(
      createLine(
        '1100',
        'Loan Portfolio',
        `Principal repayment - ${clientName}`,
        0,
        repayment.principal
      )
    );
  }

  // Credit: Interest portion goes to Interest Income
  if (repayment.interest > 0) {
    lines.push(
      createLine(
        '4000',
        'Interest Income',
        `Interest received - ${clientName}`,
        0,
        repayment.interest
      )
    );
  }

  // Credit: Penalty portion goes to Fee Income
  if (repayment.penalty && repayment.penalty > 0) {
    lines.push(
      createLine(
        '4120',
        'Late Payment Penalties',
        `Penalty received - ${clientName}`,
        0,
        repayment.penalty
      )
    );
  }

  return {
    date: repayment.paymentDate,
    description: `Loan Repayment - ${clientName}`,
    reference: repayment.id,
    sourceType: 'Loan Repayment',
    sourceId: repayment.id,
    lines,
    status: 'Posted',
    createdBy,
    postedDate: repayment.paymentDate,
  };
};

// Generate journal entry for processing fee
export const createProcessingFeeEntry = (
  loanId: string,
  clientName: string,
  amount: number,
  date: string,
  createdBy: string
): Omit<JournalEntry, 'id' | 'entryNumber' | 'createdDate' | 'totalDebit' | 'totalCredit'> => {
  const lines: JournalEntryLine[] = [
    // Debit: Cash/Bank (Asset increases)
    createLine(
      '1000',
      'Cash and Cash Equivalents',
      `Processing fee from ${clientName}`,
      amount,
      0
    ),
    // Credit: Fee Income (Revenue increases)
    createLine(
      '4110',
      'Loan Processing Fees',
      `Processing fee - ${clientName}`,
      0,
      amount
    ),
  ];

  return {
    date,
    description: `Processing Fee - ${clientName}`,
    reference: loanId,
    sourceType: 'Processing Fee',
    sourceId: loanId,
    lines,
    status: 'Posted',
    createdBy,
    postedDate: date,
  };
};

// Generate journal entry for expense
export const createExpenseEntry = (
  expense: Expense,
  createdBy: string
): Omit<JournalEntry, 'id' | 'entryNumber' | 'createdDate' | 'totalDebit' | 'totalCredit'> => {
  const accountMapping: Record<string, { code: string; name: string }> = {
    'Salaries & Wages': { code: '5100', name: 'Salaries and Wages' },
    'Rent': { code: '5300', name: 'Rent and Utilities' },
    'Utilities': { code: '5300', name: 'Rent and Utilities' },
    'Office Supplies': { code: '5400', name: 'Office Supplies' },
    'Marketing': { code: '5500', name: 'Marketing and Advertising' },
    'Professional Fees': { code: '5800', name: 'Professional Fees' },
    'IT Services': { code: '5900', name: 'Technology and Software' },
    'Software': { code: '5900', name: 'Technology and Software' },
    'Insurance': { code: '6100', name: 'Insurance' },
    'Transport': { code: '6000', name: 'Transportation' },
    'Bank Charges': { code: '6200', name: 'Bank Charges' },
    'Other': { code: '6300', name: 'Other Operating Expenses' },
  };

  const account = accountMapping[expense.subcategory] || { code: '6300', name: 'Other Operating Expenses' };

  const lines: JournalEntryLine[] = [
    // Debit: Expense Account (Expense increases)
    createLine(
      account.code,
      account.name,
      `${expense.subcategory} - ${expense.payeeName}`,
      expense.amount,
      0
    ),
    // Credit: Cash/Bank (Asset decreases)
    createLine(
      '1000',
      'Cash and Cash Equivalents',
      `Payment to ${expense.payeeName}`,
      0,
      expense.amount
    ),
  ];

  return {
    date: expense.expenseDate,
    description: `Expense - ${expense.subcategory} - ${expense.payeeName}`,
    reference: expense.id,
    sourceType: 'Expense',
    sourceId: expense.id,
    lines,
    status: 'Posted',
    createdBy,
    postedDate: expense.expenseDate,
  };
};

// Generate journal entry for capital contribution
export const createCapitalContributionEntry = (
  shareholderName: string,
  amount: number,
  date: string,
  reference: string,
  createdBy: string
): Omit<JournalEntry, 'id' | 'entryNumber' | 'createdDate' | 'totalDebit' | 'totalCredit'> => {
  const lines: JournalEntryLine[] = [
    // Debit: Cash/Bank (Asset increases)
    createLine(
      '1000',
      'Cash and Cash Equivalents',
      `Capital contribution from ${shareholderName}`,
      amount,
      0
    ),
    // Credit: Share Capital (Equity increases)
    createLine(
      '3000',
      'Share Capital',
      `Capital from ${shareholderName}`,
      0,
      amount
    ),
  ];

  return {
    date,
    description: `Capital Contribution - ${shareholderName}`,
    reference,
    sourceType: 'Capital Contribution',
    sourceId: reference,
    lines,
    status: 'Posted',
    createdBy,
    postedDate: date,
  };
};

// Generate journal entry for dividend payment
export const createDividendPaymentEntry = (
  shareholderName: string,
  amount: number,
  date: string,
  reference: string,
  createdBy: string
): Omit<JournalEntry, 'id' | 'entryNumber' | 'createdDate' | 'totalDebit' | 'totalCredit'> => {
  const lines: JournalEntryLine[] = [
    // Debit: Retained Earnings (Equity decreases)
    createLine(
      '3100',
      'Retained Earnings',
      `Dividend payment to ${shareholderName}`,
      amount,
      0
    ),
    // Credit: Cash/Bank (Asset decreases)
    createLine(
      '1000',
      'Cash and Cash Equivalents',
      `Dividend paid to ${shareholderName}`,
      0,
      amount
    ),
  ];

  return {
    date,
    description: `Dividend Payment - ${shareholderName}`,
    reference,
    sourceType: 'Dividend Payment',
    sourceId: reference,
    lines,
    status: 'Posted',
    createdBy,
    postedDate: date,
  };
};

// Generate journal entry for opening balance
export const createOpeningBalanceEntry = (
  bankAccountId: string,
  bankAccountName: string,
  amount: number,
  date: string,
  createdBy: string
): Omit<JournalEntry, 'id' | 'entryNumber' | 'createdDate' | 'totalDebit' | 'totalCredit'> => {
  const lines: JournalEntryLine[] = [
    // Debit: Cash/Bank (Asset)
    createLine(
      '1000',
      'Cash and Cash Equivalents',
      `Opening balance - ${bankAccountName}`,
      amount,
      0
    ),
    // Credit: Share Capital (Equity - assuming opening balance represents initial funding)
    createLine(
      '3000',
      'Share Capital',
      `Opening balance - ${bankAccountName}`,
      0,
      amount
    ),
  ];

  return {
    date,
    description: `Opening Balance - ${bankAccountName}`,
    reference: `OB-${bankAccountId.slice(-6)}`,
    sourceType: 'Opening Balance',
    sourceId: bankAccountId,
    lines,
    status: 'Posted',
    createdBy,
    postedDate: date,
  };
};

// Generate journal entry for payroll
export const createPayrollEntry = (
  period: string,
  grossPay: number,
  deductions: number,
  netPay: number,
  date: string,
  createdBy: string,
  payrollId: string
): Omit<JournalEntry, 'id' | 'entryNumber' | 'createdDate' | 'totalDebit' | 'totalCredit'> => {
  const lines: JournalEntryLine[] = [
    // Debit: Salaries Expense
    createLine(
      '5100',
      'Salaries and Wages',
      `Payroll for ${period}`,
      grossPay,
      0
    ),
    // Credit: Cash/Bank (Net pay)
    createLine(
      '1000',
      'Cash and Cash Equivalents',
      `Net salary payments - ${period}`,
      0,
      netPay
    ),
    // Credit: Salaries Payable (Deductions - withheld amounts)
    createLine(
      '2400',
      'Salaries Payable',
      `Statutory deductions - ${period}`,
      0,
      deductions
    ),
  ];

  return {
    date,
    description: `Payroll - ${period}`,
    reference: payrollId,
    sourceType: 'Payroll',
    sourceId: payrollId,
    lines,
    status: 'Posted',
    createdBy,
    postedDate: date,
  };
};

// Generate journal entry for bank funding transaction
export const createFundingEntry = (
  bankAccountName: string,
  amount: number,
  date: string,
  description: string,
  shareholderName: string | undefined,
  reference: string,
  createdBy: string,
  fundingId: string
): Omit<JournalEntry, 'id' | 'entryNumber' | 'createdDate' | 'totalDebit' | 'totalCredit'> => {
  const lines: JournalEntryLine[] = [
    // Debit: Cash/Bank (Asset increases)
    createLine(
      '1000',
      'Cash and Cash Equivalents',
      `${description} - ${bankAccountName}`,
      amount,
      0
    ),
    // Credit: Share Capital (Equity - assuming funding is capital)
    createLine(
      '3000',
      'Share Capital',
      shareholderName ? `Funding from ${shareholderName}` : description,
      0,
      amount
    ),
  ];

  return {
    date,
    description: `Bank Funding - ${description}`,
    reference,
    sourceType: 'Funding',
    sourceId: fundingId,
    lines,
    status: 'Posted',
    createdBy,
    postedDate: date,
  };
};
