import { useState } from 'react';
import React from 'react';
import { BookOpen, Plus, Download, Search, Filter, Edit, Trash2, ChevronDown, ChevronUp, Calendar, CheckCircle, XCircle, TrendingUp, TrendingDown, FileText, Eye, DollarSign, AlertCircle, Receipt, Users, Wallet, FileCheck } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ShareholderFormModal, CapitalDepositModal, ProfitDistributionModal } from '../modals/ShareholderModals';
import { BankAccountsTab } from './BankAccountsTab';
import { toast } from 'sonner';
import { getCurrencyCode, getMobileMoneyProviders, formatCurrency } from '../../utils/currencyUtils';

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  subcategory?: string;
  parentAccount?: string;
  balance: number;
  debit: number;
  credit: number;
  status: 'active' | 'inactive';
  description?: string;
}

interface TrialBalanceEntry {
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
  balance: number;
}

interface OperatingExpense {
  id: string;
  date: string;
  accountCode: string;
  accountName: string;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'mpesa' | 'cheque';
  reference: string;
  vendor?: string;
  branch: string;
  recordedBy: string;
  status: 'pending' | 'approved' | 'paid';
  approvedBy?: string;
  approvedDate?: string;
}

interface Shareholder {
  id: string;
  name: string;
  nationalId: string;
  email: string;
  phone: string;
  joinedDate: string;
  status: 'active' | 'inactive';
  totalContribution: number;
  percentageOwnership: number;
}

interface CapitalDeposit {
  id: string;
  shareholderId: string;
  shareholderName: string;
  date: string;
  amount: number;
  paymentMethod: 'bank' | 'mpesa';
  reference: string;
  description: string;
  recordedBy: string;
}

interface ProfitDistribution {
  id: string;
  shareholderId: string;
  shareholderName: string;
  date: string;
  amount: number;
  paymentMethod: 'bank' | 'mpesa' | 'cheque';
  reference: string;
  description: string;
  period: string; // e.g., "Q1 2025" or "FY 2024"
  recordedBy: string;
  status: 'pending' | 'approved' | 'paid';
  approvedBy?: string;
  approvedDate?: string;
}

export function AccountingTab() {
  const { isDark } = useTheme();
  const currencyCode = getCurrencyCode();
  const mobileMoneyProviders = getMobileMoneyProviders();
  const primaryMobileMoney = mobileMoneyProviders.length > 0 ? mobileMoneyProviders[0] : 'Mobile Money';
  const { 
    shareholders, 
    shareholderTransactions,
    expenses,
    loans,
    repayments,
    processingFeeRecords,
    bankAccounts,
    payees,
    journalEntries,
    addShareholder,
    updateShareholder,
    addShareholderTransaction,
    updateShareholderTransaction,
    addExpense,
    updateExpense
  } = useData();

  // Calculate dynamic values from real data
  // Only include loans that have been DISBURSED (completed all 5 approval steps) and are in Active/Disbursed status
  const totalLoansDisbursed = loans.filter(l => l.status === 'Active' || l.status === 'Disbursed').reduce((sum, l) => sum + (l.principalAmount || 0), 0);
  const totalLoansOutstanding = loans.filter(l => l.status === 'Active' || l.status === 'Disbursed').reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
  const totalProcessingFeeRevenue = processingFeeRecords.filter(r => r.status === 'Collected').reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const totalIndividualLoans = loans.filter(l => (l.status === 'Active' || l.status === 'Disbursed') && l.clientType !== 'Group').reduce((sum, l) => sum + (l.principalAmount || 0), 0);
  const totalGroupLoans = loans.filter(l => (l.status === 'Active' || l.status === 'Disbursed') && l.clientType === 'Group').reduce((sum, l) => sum + (l.principalAmount || 0), 0);

  // Calculate expense balances by category
  const calculateExpensesByCategory = (categoryName: string) => {
    return expenses
      .filter(e => e.subcategory === categoryName)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const totalSalariesExpenses = calculateExpensesByCategory('Salaries & Wages');
  const totalRentExpenses = calculateExpensesByCategory('Rent');
  const totalUtilitiesExpenses = calculateExpensesByCategory('Utilities');
  const totalOfficeSuppliesExpenses = calculateExpensesByCategory('Office Supplies');
  const totalMarketingExpenses = calculateExpensesByCategory('Marketing');
  const totalInsuranceExpenses = calculateExpensesByCategory('Insurance');
  const totalProfessionalFeesExpenses = calculateExpensesByCategory('Professional Fees');
  const totalITServicesExpenses = calculateExpensesByCategory('IT Services');
  const totalSoftwareExpenses = calculateExpensesByCategory('Software');

  // Calculate total share capital from shareholders
  const totalShareCapital = shareholders
    .filter(s => s.status === 'Active')
    .reduce((sum, s) => sum + s.shareCapital, 0);

  // Calculate total dividends paid
  const totalDividendsPaid = shareholderTransactions
    .filter(t => t.type === 'Dividend Payment')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate interest income from repayments
  const totalInterestIncome = repayments.reduce((sum, r) => sum + Number(r.interest || 0), 0);
  
  // Calculate interest income by loan type (need to get loan info for each repayment)
  const getRepaymentInterestByLoanType = (loanType: string) => {
    return repayments
      .filter(r => {
        const loan = loans.find(l => l.id === r.loanId);
        return loan && loan.clientType === loanType;
      })
      .reduce((sum, r) => sum + Number(r.interest || 0), 0);
  };

  const totalIndividualLoanInterest = getRepaymentInterestByLoanType('Individual');
  const totalGroupLoanInterest = getRepaymentInterestByLoanType('Group');
  
  // Calculate penalty income from repayments
  const totalPenaltyIncome = repayments.reduce((sum, r) => sum + Number(r.penalty || 0), 0);

  // Calculate total revenue (all income)
  const totalRevenue = totalInterestIncome + totalProcessingFeeRevenue + totalPenaltyIncome;

  // Calculate total operating expenses for equity calculation
  const totalOperatingExpenses = totalSalariesExpenses + totalRentExpenses + totalUtilitiesExpenses + 
                        totalOfficeSuppliesExpenses + totalMarketingExpenses + totalInsuranceExpenses +
                        totalProfessionalFeesExpenses + totalITServicesExpenses + totalSoftwareExpenses;

  // Calculate Current Year Earnings (Net Income)
  const currentYearEarnings = totalRevenue - totalOperatingExpenses;

  // Calculate Retained Earnings
  // This represents accumulated profits from previous years minus dividends paid
  // Retained Earnings = (Total Capital Contributions - Share Capital) could represent prior earnings
  const totalCapitalContributions = shareholderTransactions
    .filter(t => t.type === 'Capital Contribution')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Retained Earnings = Previous period earnings that were not distributed as dividends
  // For simplicity: Any capital contributions beyond initial share capital represent retained earnings
  const retainedEarnings = totalCapitalContributions > totalShareCapital 
    ? totalCapitalContributions - totalShareCapital - totalDividendsPaid 
    : -totalDividendsPaid; // If dividends were paid from retained earnings

  // Map shareholder transactions to capital deposits and profit distributions
  // Note: AccountingTab uses local sample data for now, but keeps DataContext integration for future
  const capitalDeposits: CapitalDeposit[] = [];
  const profitDistributions: ProfitDistribution[] = [];
  const [operatingExpenses, setOperatingExpenses] = useState<OperatingExpense[]>([]);
  
  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'chart-of-accounts' | 'trial-balance' | 'journal-entries' | 'operating-expenses' | 'shareholder-capital'>('accounts');
  const [view, setView] = useState<'chart-of-accounts' | 'trial-balance' | 'journal-entries' | 'operating-expenses' | 'shareholder-capital'>('chart-of-accounts');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));
  const [selectedPeriod, setSelectedPeriod] = useState('2025-12');
  const [isEditing, setIsEditing] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<OperatingExpense | null>(null);
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [expenseFilterStatus, setExpenseFilterStatus] = useState<string>('all');
  const [expenseFilterAccount, setExpenseFilterAccount] = useState<string>('all');
  const [expenseFormData, setExpenseFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    accountCode: '',
    description: '',
    amount: '',
    paymentMethod: '',
    vendor: ''
  });
  const [showShareholderModal, setShowShareholderModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [selectedShareholder, setSelectedShareholder] = useState<Shareholder | null>(null);
  const [selectedDistribution, setSelectedDistribution] = useState<ProfitDistribution | null>(null);
  const [capitalSearchTerm, setCapitalSearchTerm] = useState('');
  const [capitalFilterShareholder, setCapitalFilterShareholder] = useState<string>('all');
  const [distributionSearchTerm, setDistributionSearchTerm] = useState('');
  const [distributionFilterStatus, setDistributionFilterStatus] = useState<string>('all');
  const [distributionPeriodFilter, setDistributionPeriodFilter] = useState<'all' | 'this-year' | 'last-year'>('all');

  // Chart of Accounts Data
  const accounts: Account[] = [
    // ASSETS
    { id: 'ACC-1000', code: '1000', name: 'Cash and Cash Equivalents', type: 'asset', category: 'Current Assets', balance: 0, debit: 0, credit: 0, status: 'active', description: 'Cash in hand and bank accounts' },
    { id: 'ACC-1010', code: '1010', name: 'Cash in Hand', type: 'asset', category: 'Current Assets', subcategory: 'Cash', parentAccount: '1000', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-1020', code: '1020', name: 'Bank - KCB Main Account', type: 'asset', category: 'Current Assets', subcategory: 'Cash', parentAccount: '1000', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-1030', code: '1030', name: 'Bank - Equity Bank', type: 'asset', category: 'Current Assets', subcategory: 'Cash', parentAccount: '1000', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-1040', code: '1040', name: `${primaryMobileMoney} Float`, type: 'asset', category: 'Current Assets', subcategory: 'Cash', parentAccount: '1000', balance: 0, debit: 0, credit: 0, status: 'active' },
    
    { id: 'ACC-1100', code: '1100', name: 'Loan Portfolio', type: 'asset', category: 'Current Assets', balance: totalLoansOutstanding, debit: totalLoansOutstanding, credit: 0, status: 'active', description: 'Total outstanding loans to clients' },
    { id: 'ACC-1110', code: '1110', name: 'Individual Loans', type: 'asset', category: 'Current Assets', subcategory: 'Loans', parentAccount: '1100', balance: totalIndividualLoans, debit: totalIndividualLoans, credit: 0, status: 'active' },
    { id: 'ACC-1120', code: '1120', name: 'Group Loans', type: 'asset', category: 'Current Assets', subcategory: 'Loans', parentAccount: '1100', balance: totalGroupLoans, debit: totalGroupLoans, credit: 0, status: 'active' },
    { id: 'ACC-1130', code: '1130', name: 'Emergency Loans', type: 'asset', category: 'Current Assets', subcategory: 'Loans', parentAccount: '1100', balance: 0, debit: 0, credit: 0, status: 'active' },
    
    { id: 'ACC-1200', code: '1200', name: 'Loan Loss Provision', type: 'asset', category: 'Current Assets', balance: 0, debit: 0, credit: 0, status: 'active', description: 'Provision for bad debts' },
    
    { id: 'ACC-1300', code: '1300', name: 'Interest Receivable', type: 'asset', category: 'Current Assets', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-1400', code: '1400', name: 'Accounts Receivable', type: 'asset', category: 'Current Assets', balance: 0, debit: 0, credit: 0, status: 'active' },
    
    { id: 'ACC-1500', code: '1500', name: 'Fixed Assets', type: 'asset', category: 'Non-Current Assets', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-1510', code: '1510', name: 'Office Equipment', type: 'asset', category: 'Non-Current Assets', subcategory: 'Fixed Assets', parentAccount: '1500', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-1520', code: '1520', name: 'Computer Equipment', type: 'asset', category: 'Non-Current Assets', subcategory: 'Fixed Assets', parentAccount: '1500', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-1530', code: '1530', name: 'Furniture & Fixtures', type: 'asset', category: 'Non-Current Assets', subcategory: 'Fixed Assets', parentAccount: '1500', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-1540', code: '1540', name: 'Motor Vehicles', type: 'asset', category: 'Non-Current Assets', subcategory: 'Fixed Assets', parentAccount: '1500', balance: 0, debit: 0, credit: 0, status: 'active' },
    
    { id: 'ACC-1600', code: '1600', name: 'Accumulated Depreciation', type: 'asset', category: 'Non-Current Assets', balance: 0, debit: 0, credit: 0, status: 'active' },

    // LIABILITIES
    { id: 'ACC-2000', code: '2000', name: 'Client Savings Deposits', type: 'liability', category: 'Current Liabilities', balance: 0, debit: 0, credit: 0, status: 'active', description: 'Total client savings deposits' },
    { id: 'ACC-2010', code: '2010', name: 'Regular Savings', type: 'liability', category: 'Current Liabilities', subcategory: 'Savings', parentAccount: '2000', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-2020', code: '2020', name: 'Fixed Deposits', type: 'liability', category: 'Current Liabilities', subcategory: 'Savings', parentAccount: '2000', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-2030', code: '2030', name: 'Chama Savings', type: 'liability', category: 'Current Liabilities', subcategory: 'Savings', parentAccount: '2000', balance: 0, debit: 0, credit: 0, status: 'active' },
    
    { id: 'ACC-2100', code: '2100', name: 'Bank Borrowings', type: 'liability', category: 'Current Liabilities', balance: 0, debit: 0, credit: 0, status: 'active', description: 'Short-term loans from partner banks' },
    { id: 'ACC-2110', code: '2110', name: 'KCB Credit Line', type: 'liability', category: 'Current Liabilities', subcategory: 'Bank Loans', parentAccount: '2100', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-2120', code: '2120', name: 'Equity Bank Facility', type: 'liability', category: 'Current Liabilities', subcategory: 'Bank Loans', parentAccount: '2100', balance: 0, debit: 0, credit: 0, status: 'active' },
    
    { id: 'ACC-2200', code: '2200', name: 'Interest Payable', type: 'liability', category: 'Current Liabilities', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-2300', code: '2300', name: 'Accounts Payable', type: 'liability', category: 'Current Liabilities', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-2400', code: '2400', name: 'Salaries Payable', type: 'liability', category: 'Current Liabilities', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-2500', code: '2500', name: 'Tax Payable', type: 'liability', category: 'Current Liabilities', balance: 0, debit: 0, credit: 0, status: 'active' },
    
    { id: 'ACC-2600', code: '2600', name: 'Long-term Debt', type: 'liability', category: 'Non-Current Liabilities', balance: 0, debit: 0, credit: 0, status: 'active' },

    // EQUITY
    { id: 'ACC-3000', code: '3000', name: 'Share Capital', type: 'equity', category: 'Equity', balance: totalShareCapital, debit: 0, credit: totalShareCapital, status: 'active' },
    { id: 'ACC-3100', code: '3100', name: 'Retained Earnings', type: 'equity', category: 'Equity', balance: retainedEarnings, debit: retainedEarnings < 0 ? Math.abs(retainedEarnings) : 0, credit: retainedEarnings > 0 ? retainedEarnings : 0, status: 'active' },
    { id: 'ACC-3200', code: '3200', name: 'Current Year Earnings', type: 'equity', category: 'Equity', balance: 0, debit: 0, credit: 0, status: 'active', description: 'Net income for current period (closed at year-end)' },

    // REVENUE
    { id: 'ACC-4000', code: '4000', name: 'Interest Income', type: 'revenue', category: 'Operating Revenue', balance: totalInterestIncome, debit: 0, credit: totalInterestIncome, status: 'active' },
    { id: 'ACC-4010', code: '4010', name: 'Individual Loan Interest', type: 'revenue', category: 'Operating Revenue', subcategory: 'Interest Income', parentAccount: '4000', balance: totalIndividualLoanInterest, debit: 0, credit: totalIndividualLoanInterest, status: 'active' },
    { id: 'ACC-4020', code: '4020', name: 'Group Loan Interest', type: 'revenue', category: 'Operating Revenue', subcategory: 'Interest Income', parentAccount: '4000', balance: totalGroupLoanInterest, debit: 0, credit: totalGroupLoanInterest, status: 'active' },
    { id: 'ACC-4030', code: '4030', name: 'Emergency Loan Interest', type: 'revenue', category: 'Operating Revenue', subcategory: 'Interest Income', parentAccount: '4000', balance: 0, debit: 0, credit: 0, status: 'active' },
    
    { id: 'ACC-4100', code: '4100', name: 'Fee Income', type: 'revenue', category: 'Operating Revenue', balance: totalProcessingFeeRevenue + totalPenaltyIncome, debit: 0, credit: totalProcessingFeeRevenue + totalPenaltyIncome, status: 'active' },
    { id: 'ACC-4110', code: '4110', name: 'Loan Processing Fees', type: 'revenue', category: 'Operating Revenue', subcategory: 'Fees', parentAccount: '4100', balance: totalProcessingFeeRevenue, debit: 0, credit: totalProcessingFeeRevenue, status: 'active' },
    { id: 'ACC-4120', code: '4120', name: 'Late Payment Penalties', type: 'revenue', category: 'Operating Revenue', subcategory: 'Fees', parentAccount: '4100', balance: totalPenaltyIncome, debit: 0, credit: totalPenaltyIncome, status: 'active' },
    { id: 'ACC-4130', code: '4130', name: 'Account Maintenance Fees', type: 'revenue', category: 'Operating Revenue', subcategory: 'Fees', parentAccount: '4100', balance: 0, debit: 0, credit: 0, status: 'active' },
    
    { id: 'ACC-4200', code: '4200', name: 'Commission Income', type: 'revenue', category: 'Operating Revenue', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-4300', code: '4300', name: 'Other Income', type: 'revenue', category: 'Non-Operating Revenue', balance: 0, debit: 0, credit: 0, status: 'active' },

    // EXPENSES
    { id: 'ACC-5000', code: '5000', name: 'Interest Expense', type: 'expense', category: 'Operating Expenses', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-5010', code: '5010', name: 'Bank Interest', type: 'expense', category: 'Operating Expenses', subcategory: 'Interest', parentAccount: '5000', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-5020', code: '5020', name: 'Savings Interest', type: 'expense', category: 'Operating Expenses', subcategory: 'Interest', parentAccount: '5000', balance: 0, debit: 0, credit: 0, status: 'active' },
    
    { id: 'ACC-5100', code: '5100', name: 'Salaries and Wages', type: 'expense', category: 'Operating Expenses', balance: totalSalariesExpenses, debit: totalSalariesExpenses, credit: 0, status: 'active' },
    { id: 'ACC-5200', code: '5200', name: 'Employee Benefits', type: 'expense', category: 'Operating Expenses', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-5300', code: '5300', name: 'Rent and Utilities', type: 'expense', category: 'Operating Expenses', balance: totalRentExpenses + totalUtilitiesExpenses, debit: totalRentExpenses + totalUtilitiesExpenses, credit: 0, status: 'active' },
    { id: 'ACC-5400', code: '5400', name: 'Office Supplies', type: 'expense', category: 'Operating Expenses', balance: totalOfficeSuppliesExpenses, debit: totalOfficeSuppliesExpenses, credit: 0, status: 'active' },
    { id: 'ACC-5500', code: '5500', name: 'Marketing and Advertising', type: 'expense', category: 'Operating Expenses', balance: totalMarketingExpenses, debit: totalMarketingExpenses, credit: 0, status: 'active' },
    { id: 'ACC-5600', code: '5600', name: 'Loan Loss Provision', type: 'expense', category: 'Operating Expenses', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-5700', code: '5700', name: 'Depreciation Expense', type: 'expense', category: 'Operating Expenses', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-5800', code: '5800', name: 'Professional Fees', type: 'expense', category: 'Operating Expenses', balance: totalProfessionalFeesExpenses, debit: totalProfessionalFeesExpenses, credit: 0, status: 'active' },
    { id: 'ACC-5900', code: '5900', name: 'Technology and Software', type: 'expense', category: 'Operating Expenses', balance: totalITServicesExpenses + totalSoftwareExpenses, debit: totalITServicesExpenses + totalSoftwareExpenses, credit: 0, status: 'active' },
    { id: 'ACC-6000', code: '6000', name: 'Transportation', type: 'expense', category: 'Operating Expenses', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-6100', code: '6100', name: 'Insurance', type: 'expense', category: 'Operating Expenses', balance: totalInsuranceExpenses, debit: totalInsuranceExpenses, credit: 0, status: 'active' },
    { id: 'ACC-6200', code: '6200', name: 'Bank Charges', type: 'expense', category: 'Operating Expenses', balance: 0, debit: 0, credit: 0, status: 'active' },
    { id: 'ACC-6300', code: '6300', name: 'Other Operating Expenses', type: 'expense', category: 'Operating Expenses', balance: 0, debit: 0, credit: 0, status: 'active' },
  ];

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Group accounts by type and category
  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = {};
    }
    if (!acc[account.type][account.category]) {
      acc[account.type][account.category] = [];
    }
    acc[account.type][account.category].push(account);
    return acc;
  }, {} as Record<string, Record<string, Account[]>>);

  // Calculate totals for trial balance from journal entries
  const calculateTrialBalance = (): TrialBalanceEntry[] => {
    // Create a map to accumulate debits and credits for each account
    const accountBalances = new Map<string, { name: string; type: string; debit: number; credit: number }>();

    // Initialize all accounts
    accounts
      .filter(acc => !acc.parentAccount && acc.status === 'active')
      .forEach(account => {
        accountBalances.set(account.code, {
          name: account.name,
          type: account.type,
          debit: 0,
          credit: 0
        });
      });

    // Aggregate from journal entries (only posted entries)
    journalEntries
      .filter(je => je.status === 'Posted')
      .forEach(entry => {
        entry.lines.forEach(line => {
          const existing = accountBalances.get(line.accountCode);
          if (existing) {
            existing.debit += line.debit;
            existing.credit += line.credit;
          } else {
            // If account not in our chart, still include it
            accountBalances.set(line.accountCode, {
              name: line.accountName,
              type: 'asset', // Default type
              debit: line.debit,
              credit: line.credit
            });
          }
        });
      });

    // Convert map to array and calculate balances
    const entries: TrialBalanceEntry[] = Array.from(accountBalances.entries())
      .filter(([_, data]) => data.debit !== 0 || data.credit !== 0) // Only show accounts with activity
      .map(([code, data]) => ({
        accountCode: code,
        accountName: data.name,
        accountType: data.type,
        debit: data.debit,
        credit: data.credit,
        balance: data.debit - data.credit
      }))
      .sort((a, b) => a.accountCode.localeCompare(b.accountCode));

    return entries;
  };

  const trialBalanceEntries = calculateTrialBalance();
  
  const totalDebits = trialBalanceEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredits = trialBalanceEntries.reduce((sum, entry) => sum + entry.credit, 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 1; // Allow for rounding errors

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
    if (filterStatus !== 'all' && account.status !== filterStatus) return false;
    if (filterType !== 'all' && account.type !== filterType) return false;
    if (searchTerm && !account.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !account.code.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const accountTypeLabels = {
    asset: 'Assets',
    liability: 'Liabilities',
    equity: 'Equity',
    revenue: 'Revenue',
    expense: 'Expenses'
  };

  const accountTypeOrder = ['asset', 'liability', 'equity', 'revenue', 'expense'];

  const handleAddAccount = () => {
    setIsEditing(false);
    setSelectedAccount(null);
    setShowAccountModal(true);
  };

  const handleEditAccount = (account: Account) => {
    setIsEditing(true);
    setSelectedAccount(account);
    setShowAccountModal(true);
  };

  const exportToExcel = () => {
    alert('Exporting Chart of Accounts to Excel...');
  };

  const exportTrialBalanceToExcel = () => {
    alert('Exporting Trial Balance to Excel...');
  };

  const exportTrialBalanceToPDF = () => {
    alert('Exporting Trial Balance to PDF...');
  };

  // Note: operatingExpenses now comes from DataContext

  const handleAddExpense = () => {
    setSelectedExpense(null);
    setShowExpenseModal(true);
  };

  const handleEditExpense = (expense: OperatingExpense) => {
    setSelectedExpense(expense);
    setShowExpenseModal(true);
  };

  const handleViewExpense = (expense: OperatingExpense) => {
    setSelectedExpense(expense);
    setShowExpenseModal(true);
  };

  // Filter expenses
  const filteredExpenses = operatingExpenses.filter(expense => {
    if (expenseFilterStatus !== 'all' && expense.status !== expenseFilterStatus) return false;
    if (expenseFilterAccount !== 'all' && expense.accountCode !== expenseFilterAccount) return false;
    if (expenseSearchTerm && 
        !expense.description.toLowerCase().includes(expenseSearchTerm.toLowerCase()) && 
        !expense.reference.toLowerCase().includes(expenseSearchTerm.toLowerCase()) &&
        !expense.accountName.toLowerCase().includes(expenseSearchTerm.toLowerCase())
    ) return false;
    return true;
  });

  // Calculate expense summary
  const expenseAccounts = accounts.filter(a => a.type === 'expense' && !a.parentAccount);
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const paidExpenses = filteredExpenses.filter(exp => exp.status === 'paid').reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = filteredExpenses.filter(exp => exp.status === 'pending').reduce((sum, exp) => sum + exp.amount, 0);
  const approvedExpenses = filteredExpenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0);

  // Note: shareholders, capitalDeposits, and profitDistributions now come from DataContext

  const handleAddShareholder = () => {
    setSelectedShareholder(null);
    setShowShareholderModal(true);
  };

  const handleEditShareholder = (shareholder: Shareholder) => {
    setSelectedShareholder(shareholder);
    setShowShareholderModal(true);
  };

  const handleRecordDeposit = (shareholder?: Shareholder) => {
    setSelectedShareholder(shareholder || null);
    setShowDepositModal(true);
  };

  const handleRecordDistribution = (shareholder?: Shareholder) => {
    setSelectedShareholder(shareholder || null);
    setSelectedDistribution(null);
    setShowDistributionModal(true);
  };

  const handleViewDistribution = (distribution: ProfitDistribution) => {
    setSelectedDistribution(distribution);
    setShowDistributionModal(true);
  };

  // Filter capital deposits
  const filteredCapitalDeposits = capitalDeposits.filter(deposit => {
    if (capitalFilterShareholder !== 'all' && deposit.shareholderId !== capitalFilterShareholder) return false;
    if (capitalSearchTerm && 
        !deposit.description.toLowerCase().includes(capitalSearchTerm.toLowerCase()) && 
        !deposit.reference.toLowerCase().includes(capitalSearchTerm.toLowerCase())
    ) return false;
    return true;
  });

  // Filter profit distributions
  const filteredProfitDistributions = profitDistributions.filter(dist => {
    // Period filter
    if (distributionPeriodFilter === 'this-year') {
      if (!dist.date.startsWith('2025')) return false;
    } else if (distributionPeriodFilter === 'last-year') {
      if (!dist.date.startsWith('2024')) return false;
    }
    
    if (capitalFilterShareholder !== 'all' && dist.shareholderId !== capitalFilterShareholder) return false;
    if (distributionFilterStatus !== 'all' && dist.status !== distributionFilterStatus) return false;
    if (distributionSearchTerm && 
        !dist.description.toLowerCase().includes(distributionSearchTerm.toLowerCase()) && 
        !dist.reference.toLowerCase().includes(distributionSearchTerm.toLowerCase()) &&
        !dist.period.toLowerCase().includes(distributionSearchTerm.toLowerCase())
    ) return false;
    return true;
  });

  // Calculate shareholder-specific distributions by period
  const getShareholderDistributions = (shareholderId: string, period: 'all' | 'this-year' | 'last-year') => {
    return shareholderTransactions
      .filter(t => {
        if (t.shareholderId !== shareholderId) return false;
        if (t.type !== 'distribution') return false;
        if (t.status !== 'completed') return false;
        if (period === 'this-year' && !t.date.startsWith('2025')) return false;
        if (period === 'last-year' && !t.date.startsWith('2024')) return false;
        return true;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Calculate capital summary
  // totalShareCapital already calculated above (line 139)
  // Calculate total cash in bank from actual bank accounts instead of hardcoded values
  const cashInBank = bankAccounts
    .filter(acc => acc.status === 'Active' && (acc.accountType === 'Bank' || acc.accountType === 'Mobile Money'))
    .reduce((sum, acc) => sum + acc.balance, 0);
  // Use totalShareCapital for total contributions instead of empty capitalDeposits array
  const totalDeposits = totalShareCapital;
  const numberOfShareholders = shareholders.filter(s => s.status === 'Active').length;
  // Calculate total distributions from shareholderTransactions instead of empty profitDistributions array
  const totalDistributions = shareholderTransactions
    .filter(t => t.type === 'Dividend Payment')
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingDistributions = 0; // No pending status in ShareholderTransaction

  return (
    <div className="p-6 space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-gray-900">Accounting</h2>
          <p className="text-gray-600">Manage accounts, chart of accounts, trial balance & shareholder capital</p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeSubTab === 'accounts'
              ? 'border-[#ec7347] text-[#ec7347]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Wallet className="size-4" />
            Accounts
          </div>
        </button>
        <button
          onClick={() => { setActiveSubTab('chart-of-accounts'); setView('chart-of-accounts'); }}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeSubTab === 'chart-of-accounts'
              ? 'border-[#ec7347] text-[#ec7347]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="size-4" />
            Chart of Accounts
          </div>
        </button>
        <button
          onClick={() => { setActiveSubTab('trial-balance'); setView('trial-balance'); }}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeSubTab === 'trial-balance'
              ? 'border-[#ec7347] text-[#ec7347]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="size-4" />
            Trial Balance
          </div>
        </button>
        <button
          onClick={() => { setActiveSubTab('journal-entries'); setView('journal-entries'); }}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeSubTab === 'journal-entries'
              ? 'border-[#ec7347] text-[#ec7347]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileCheck className="size-4" />
            Journal Entries
          </div>
        </button>
        <button
          onClick={() => { setActiveSubTab('operating-expenses'); setView('operating-expenses'); }}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeSubTab === 'operating-expenses'
              ? 'border-[#ec7347] text-[#ec7347]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Receipt className="size-4" />
            Operating Expenses
          </div>
        </button>
        <button
          onClick={() => { setActiveSubTab('shareholder-capital'); setView('shareholder-capital'); }}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeSubTab === 'shareholder-capital'
              ? 'border-[#ec7347] text-[#ec7347]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="size-4" />
            Shareholder Capital
          </div>
        </button>
      </div>

      {/* Accounts Tab (Bank Accounts) */}
      {activeSubTab === 'accounts' && (
        <BankAccountsTab />
      )}

      {/* Chart of Accounts View */}
      {activeSubTab === 'chart-of-accounts' && view === 'chart-of-accounts' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg border-l-4 border-blue-400">
              <p className="text-gray-600 text-sm mb-1">Total Assets</p>
              <p className="text-blue-700 text-2xl">{currencyCode} {(accounts.filter(a => a.type === 'asset' && !a.parentAccount).reduce((sum, a) => sum + a.balance, 0) / 1000000).toFixed(2)}M</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-red-400">
              <p className="text-gray-600 text-sm mb-1">Total Liabilities</p>
              <p className="text-red-700 text-2xl">{currencyCode} {(accounts.filter(a => a.type === 'liability' && !a.parentAccount).reduce((sum, a) => sum + a.balance, 0) / 1000000).toFixed(2)}M</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-purple-400">
              <p className="text-gray-600 text-sm mb-1">Total Equity</p>
              <p className="text-purple-700 text-2xl">{currencyCode} {(accounts.filter(a => a.type === 'equity' && !a.parentAccount).reduce((sum, a) => sum + a.balance, 0) / 1000000).toFixed(2)}M</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-emerald-400">
              <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
              <p className="text-emerald-700 text-2xl">{currencyCode} {(accounts.filter(a => a.type === 'revenue' && !a.parentAccount).reduce((sum, a) => sum + a.balance, 0) / 1000000).toFixed(2)}M</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-amber-400">
              <p className="text-gray-600 text-sm mb-1">Total Expenses</p>
              <p className="text-amber-700 text-2xl">{currencyCode} {(accounts.filter(a => a.type === 'expense' && !a.parentAccount).reduce((sum, a) => sum + a.balance, 0) / 1000000).toFixed(2)}M</p>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="asset">Assets</option>
                  <option value="liability">Liabilities</option>
                  <option value="equity">Equity</option>
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expenses</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportToExcel}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
                >
                  <Download className="size-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Accounts List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm w-12"></th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Account Code</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Account Name</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Type</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Category</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Debit</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Credit</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Balance</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accountTypeOrder.map(type => {
                    const typeAccounts = filteredAccounts.filter(a => a.type === type);
                    if (typeAccounts.length === 0) return null;

                    const isExpanded = expandedCategories.has(type);
                    const typeTotal = typeAccounts.filter(a => !a.parentAccount).reduce((sum, a) => sum + a.balance, 0);

                    return (
                      <React.Fragment key={type}>
                        {/* Type Header */}
                        <tr className="bg-gray-100 border-t-2 border-gray-300">
                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleCategory(type)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              {isExpanded ? (
                                <ChevronUp className="size-4" />
                              ) : (
                                <ChevronDown className="size-4" />
                              )}
                            </button>
                          </td>
                          <td colSpan={4} className="py-3 px-4 text-gray-900">{accountTypeLabels[type as keyof typeof accountTypeLabels]}</td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4 text-gray-900 text-right">
                            {formatCurrency(typeTotal, { showCode: true })}
                          </td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4"></td>
                        </tr>

                        {/* Accounts */}
                        {isExpanded && typeAccounts.map(account => {
                          const isParent = !account.parentAccount;
                          const hasChildren = typeAccounts.some(a => a.parentAccount === account.code);

                          return (
                            <tr
                              key={account.id}
                              className={`border-b border-gray-100 hover:bg-gray-50 ${
                                !isParent ? 'bg-gray-50' : ''
                              }`}
                            >
                              <td className="py-3 px-4"></td>
                              <td className="py-3 px-4 text-gray-900">
                                {!isParent && <span className="ml-4">└─ </span>}
                                {account.code}
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <p className="text-gray-900">{account.name}</p>
                                  {account.description && (
                                    <p className="text-gray-500 text-xs">{account.description}</p>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  account.type === 'asset' ? 'bg-blue-100 text-blue-800' :
                                  account.type === 'liability' ? 'bg-red-100 text-red-800' :
                                  account.type === 'equity' ? 'bg-purple-100 text-purple-800' :
                                  account.type === 'revenue' ? 'bg-emerald-100 text-emerald-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  {account.type}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm">{account.category}</td>
                              <td className="py-3 px-4 text-gray-900 text-right">
                                {account.debit > 0 ? formatCurrency(account.debit, { showCode: true }) : '-'}
                              </td>
                              <td className="py-3 px-4 text-gray-900 text-right">
                                {account.credit > 0 ? formatCurrency(account.credit, { showCode: true }) : '-'}
                              </td>
                              <td className="py-3 px-4 text-gray-900 text-right">
                                {account.balance >= 0 ? (
                                  <span className="text-emerald-700">{formatCurrency(account.balance, { showCode: true })}</span>
                                ) : (
                                  <span className="text-red-700">({formatCurrency(Math.abs(account.balance), { showCode: true })})</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  account.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {account.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEditAccount(account)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Edit"
                                  >
                                    <Edit className="size-4" />
                                  </button>
                                  <button
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                    title="View Details"
                                  >
                                    <Eye className="size-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Trial Balance View */}
      {activeSubTab === 'trial-balance' && view === 'trial-balance' && (
        <div className="space-y-6">
          {/* Period Selection and Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Period</label>
                  <div className="relative">
                    <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="month"
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportTrialBalanceToExcel}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
                >
                  <Download className="size-4" />
                  Excel
                </button>
                <button
                  onClick={exportTrialBalanceToPDF}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
                >
                  <Download className="size-4" />
                  PDF
                </button>
              </div>
            </div>

            {/* Balance Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-gray-600 text-sm mb-1">Total Debits</p>
                <p className="text-blue-700 text-2xl">{formatCurrency(totalDebits, { showCode: true })}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-gray-600 text-sm mb-1">Total Credits</p>
                <p className="text-purple-700 text-2xl">{formatCurrency(totalCredits, { showCode: true })}</p>
              </div>
              <div 
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: isBalanced ? '#74C36520' : '#CC333320',
                  borderColor: isBalanced ? '#74C365' : '#CC3333'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isBalanced ? (
                    <>
                      <CheckCircle className="size-5" style={{ color: '#74C365' }} />
                      <p className="text-sm font-medium" style={{ color: '#74C365' }}>Status: Balanced</p>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-5" style={{ color: '#CC3333' }} />
                      <p className="text-sm font-medium" style={{ color: '#CC3333' }}>Status: Out of Balance</p>
                    </>
                  )}
                </div>
                <p className="text-2xl" style={{ color: isBalanced ? '#74C365' : '#CC3333' }}>
                  {formatCurrency(Math.abs(totalDebits - totalCredits), { showCode: true })}
                </p>
              </div>
            </div>
          </div>

          {/* Trial Balance Report */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 text-center">
              <h3 className="text-gray-900 text-xl">SmartLenderUp</h3>
              <p className="text-gray-600">Trial Balance</p>
              <p className="text-gray-500 text-sm">
                As at {new Date(selectedPeriod + '-01').toLocaleDateString('en-GB', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Account Code</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Account Name</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Type</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Debit ({currencyCode})</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Credit ({currencyCode})</th>
                  </tr>
                </thead>
                <tbody>
                  {accountTypeOrder.map(type => {
                    const typeEntries = trialBalanceEntries.filter(e => e.accountType === type);
                    if (typeEntries.length === 0) return null;

                    const typeDebits = typeEntries.reduce((sum, e) => sum + e.debit, 0);
                    const typeCredits = typeEntries.reduce((sum, e) => sum + e.credit, 0);

                    return (
                      <React.Fragment key={type}>
                        {/* Type Header */}
                        <tr className="bg-gray-100 border-t-2 border-gray-300">
                          <td colSpan={3} className="py-2 px-4 text-gray-900">
                            {accountTypeLabels[type as keyof typeof accountTypeLabels]}
                          </td>
                          <td className="py-2 px-4"></td>
                          <td className="py-2 px-4"></td>
                        </tr>

                        {/* Entries */}
                        {typeEntries.map((entry, index) => (
                          <tr key={`${entry.accountCode}-${index}`} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-gray-900">{entry.accountCode}</td>
                            <td className="py-3 px-4 text-gray-900">{entry.accountName}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                entry.accountType === 'asset' ? 'bg-blue-100 text-blue-800' :
                                entry.accountType === 'liability' ? 'bg-red-100 text-red-800' :
                                entry.accountType === 'equity' ? 'bg-purple-100 text-purple-800' :
                                entry.accountType === 'revenue' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {entry.accountType}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900">
                              {entry.debit > 0 ? formatCurrency(entry.debit, { showSymbol: false }) : '-'}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900">
                              {entry.credit > 0 ? formatCurrency(entry.credit, { showSymbol: false }) : '-'}
                            </td>
                          </tr>
                        ))}

                        {/* Type Subtotal */}
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <td colSpan={3} className="py-2 px-4 text-gray-700 text-right">
                            {accountTypeLabels[type as keyof typeof accountTypeLabels]} Subtotal
                          </td>
                          <td className="py-2 px-4 text-right text-gray-900">
                            {typeDebits > 0 ? formatCurrency(typeDebits, { showSymbol: false }) : '-'}
                          </td>
                          <td className="py-2 px-4 text-right text-gray-900">
                            {typeCredits > 0 ? formatCurrency(typeCredits, { showSymbol: false }) : '-'}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}

                  {/* Grand Total */}
                  <tr className="bg-gray-900 text-white border-t-2 border-gray-900">
                    <td colSpan={3} className="py-3 px-4 text-right">TOTAL</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(totalDebits, { showSymbol: false })}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(totalCredits, { showSymbol: false })}</td>
                  </tr>

                  {/* Difference Row (if any) */}
                  {!isBalanced && (
                    <tr className="bg-red-50 border-t border-red-200">
                      <td colSpan={3} className="py-3 px-4 text-right text-red-800 flex items-center justify-end gap-2">
                        <AlertCircle className="size-4" />
                        DIFFERENCE
                      </td>
                      <td colSpan={2} className="py-3 px-4 text-right text-red-800">
                        {formatCurrency(Math.abs(totalDebits - totalCredits), { showSymbol: false })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Accounting Equation */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Accounting Equation Verification</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">Assets</p>
                <p className="text-blue-700 text-xl">
                  {formatCurrency(accounts.filter(a => a.type === 'asset' && !a.parentAccount).reduce((sum, a) => sum + a.balance, 0), { showCode: true })}
                </p>
              </div>
              <div className="text-center flex items-center justify-center">
                <span className="text-gray-900 text-2xl">=</span>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">Liabilities + Equity</p>
                <p className="text-purple-700 text-xl">
                  {formatCurrency(
                    accounts.filter(a => a.type === 'liability' && !a.parentAccount).reduce((sum, a) => sum + a.balance, 0) +
                    accounts.filter(a => a.type === 'equity' && !a.parentAccount).reduce((sum, a) => sum + a.balance, 0),
                    { showCode: true }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Journal Entries View */}
      {activeSubTab === 'journal-entries' && view === 'journal-entries' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 mb-1">Journal Entries</h3>
                <p className="text-gray-600 text-sm">Double-entry bookkeeping transactions</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => alert('Export to Excel')}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
                >
                  <Download className="size-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border-l-4 border-blue-400">
              <p className="text-gray-600 text-sm mb-1">Total Entries</p>
              <p className="text-2xl text-gray-900">{journalEntries.filter(je => je.status === 'Posted').length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-400">
              <p className="text-gray-600 text-sm mb-1">Total Debits</p>
              <p className="text-2xl text-gray-900">
                {formatCurrency(journalEntries.filter(je => je.status === 'Posted').reduce((sum, je) => sum + je.totalDebit, 0), currencyCode)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-purple-400">
              <p className="text-gray-600 text-sm mb-1">Total Credits</p>
              <p className="text-2xl text-gray-900">
                {formatCurrency(journalEntries.filter(je => je.status === 'Posted').reduce((sum, je) => sum + je.totalCredit, 0), currencyCode)}
              </p>
            </div>
          </div>

          {/* Journal Entries List */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Entry #</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Description</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Source Type</th>
                    <th className="px-4 py-3 text-right text-sm text-gray-700">Debit</th>
                    <th className="px-4 py-3 text-right text-sm text-gray-700">Credit</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-700">Status</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {journalEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry) => (
                    <React.Fragment key={entry.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{entry.entryNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{entry.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{entry.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                            {entry.sourceType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {formatCurrency(entry.totalDebit, currencyCode)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {formatCurrency(entry.totalCredit, currencyCode)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            entry.status === 'Posted' ? 'bg-green-100 text-green-700' :
                            entry.status === 'Reversed' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            title="View Details"
                          >
                            <Eye className="size-4" />
                          </button>
                        </td>
                      </tr>
                      {/* Show journal entry lines */}
                      {entry.lines.map((line, idx) => (
                        <tr key={`${entry.id}-line-${idx}`} className="bg-gray-50">
                          <td colSpan={2}></td>
                          <td className="px-4 py-2 text-sm text-gray-600 pl-8">
                            {line.accountCode} - {line.accountName}
                            {line.description && <div className="text-xs text-gray-500 mt-1">{line.description}</div>}
                          </td>
                          <td></td>
                          <td className="px-4 py-2 text-sm text-right text-gray-700">
                            {line.debit > 0 ? formatCurrency(line.debit, currencyCode) : ''}
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-gray-700">
                            {line.credit > 0 ? formatCurrency(line.credit, currencyCode) : ''}
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Operating Expenses View */}
      {activeSubTab === 'operating-expenses' && view === 'operating-expenses' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border-l-4 border-amber-400">
              <p className="text-gray-600 text-sm mb-1">Total Expenses</p>
              <p className="text-amber-700 text-2xl">{formatCurrency(totalExpenses, { showCode: true })}</p>
              <p className="text-gray-500 text-xs mt-1">{filteredExpenses.length} entries</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-emerald-400">
              <p className="text-gray-600 text-sm mb-1">Paid</p>
              <p className="text-emerald-700 text-2xl">{formatCurrency(paidExpenses, { showCode: true })}</p>
              <p className="text-gray-500 text-xs mt-1">{filteredExpenses.filter(e => e.status === 'paid').length} entries</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-blue-400">
              <p className="text-gray-600 text-sm mb-1">Approved</p>
              <p className="text-blue-700 text-2xl">{formatCurrency(approvedExpenses, { showCode: true })}</p>
              <p className="text-gray-500 text-xs mt-1">{filteredExpenses.filter(e => e.status === 'approved').length} entries</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-red-400">
              <p className="text-gray-600 text-sm mb-1">Pending</p>
              <p className="text-red-700 text-2xl">{formatCurrency(pendingExpenses, { showCode: true })}</p>
              <p className="text-gray-500 text-xs mt-1">{filteredExpenses.filter(e => e.status === 'pending').length} entries</p>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={expenseSearchTerm}
                    onChange={(e) => setExpenseSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={expenseFilterAccount}
                  onChange={(e) => setExpenseFilterAccount(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Accounts</option>
                  {expenseAccounts.map(account => (
                    <option key={account.id} value={account.code}>
                      {account.code} - {account.name}
                    </option>
                  ))}
                </select>
                <select
                  value={expenseFilterStatus}
                  onChange={(e) => setExpenseFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                </select>
                <div className="relative">
                  <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="month"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddExpense}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <Plus className="size-4" />
                  Record Expense
                </button>
                <button
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
                >
                  <Download className="size-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Date</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Reference</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Account</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Description</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Vendor</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Payment</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-500">
                        <Receipt className="size-12 mx-auto mb-4 text-gray-300" />
                        <p>No expenses found for the selected filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map(expense => (
                      <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 text-sm">
                          {new Date(expense.date).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-sm">{expense.reference}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          <div>
                            <p className="text-gray-900">{expense.accountCode}</p>
                            <p className="text-xs text-gray-500">{expense.accountName}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-sm max-w-xs truncate">
                          {expense.description}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {expense.vendor || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-right">
                          {formatCurrency(expense.amount, { showCode: true })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            expense.paymentMethod === 'bank' ? 'bg-blue-100 text-blue-800' :
                            expense.paymentMethod === 'mpesa' ? 'bg-emerald-100 text-emerald-800' :
                            expense.paymentMethod === 'cash' ? 'bg-amber-100 text-amber-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {expense.paymentMethod.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            expense.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                            expense.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {expense.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleViewExpense(expense)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                              title="View Details"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              onClick={() => handleEditExpense(expense)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Shareholder Capital View */}
      {activeSubTab === 'shareholder-capital' && view === 'shareholder-capital' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-400">
                <p className="text-gray-600 text-sm mb-1">Total Share Capital</p>
                <p className="text-purple-700 text-2xl">{currencyCode} {(totalShareCapital / 1000000).toFixed(2)}M</p>
                <p className="text-gray-500 text-xs mt-1">{numberOfShareholders} shareholders</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-gray-600 text-sm mb-1">Cash in Bank</p>
                <p className="text-blue-700 text-2xl">{currencyCode} {(cashInBank / 1000000).toFixed(2)}M</p>
                <p className="text-gray-500 text-xs mt-1">All bank accounts</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-emerald-400">
                <p className="text-gray-600 text-sm mb-1">Total Capital In</p>
                <p className="text-emerald-700 text-2xl">{currencyCode} {(totalDeposits / 1000000).toFixed(2)}M</p>
                <p className="text-gray-500 text-xs mt-1">{numberOfShareholders} shareholder{numberOfShareholders !== 1 ? 's' : ''}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-rose-400">
                <p className="text-gray-600 text-sm mb-1">Total Distributions Out</p>
                <p className="text-rose-700 text-2xl">{currencyCode} {(totalDistributions / 1000000).toFixed(2)}M</p>
                <p className="text-gray-500 text-xs mt-1">{shareholderTransactions.filter(t => t.type === 'Dividend Payment').length} paid</p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-400">
                <p className="text-gray-600 text-sm mb-1">Net Capital Position</p>
                <p className="text-indigo-700 text-2xl">{currencyCode} {((totalDeposits - totalDistributions) / 1000000).toFixed(2)}M</p>
                <p className="text-gray-500 text-xs mt-1">Deposits - Distributions</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-amber-400">
                <p className="text-gray-600 text-sm mb-1">Pending Distributions</p>
                <p className="text-amber-700 text-2xl">{currencyCode} {(pendingDistributions / 1000000).toFixed(2)}M</p>
                <p className="text-gray-500 text-xs mt-1">{profitDistributions.filter(d => d.status === 'approved').length} approved</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-teal-400">
                <p className="text-gray-600 text-sm mb-1">Average Return</p>
                <p className="text-teal-700 text-2xl">{totalDeposits > 0 ? ((totalDistributions / totalDeposits) * 100).toFixed(1) : '0.0'}%</p>
                <p className="text-gray-500 text-xs mt-1">Distributions / Deposits</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-cyan-400">
                <p className="text-gray-600 text-sm mb-1">This Year (2025)</p>
                <p className="text-cyan-700 text-2xl">{currencyCode} {(profitDistributions.filter(d => d.date.startsWith('2025') && d.status === 'paid').reduce((sum, d) => sum + d.amount, 0) / 1000000).toFixed(2)}M</p>
                <p className="text-gray-500 text-xs mt-1">Distributed in 2025</p>
              </div>
            </div>
          </div>

          {/* Shareholders List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900">Shareholders</h3>
                <button
                  onClick={handleAddShareholder}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <Plus className="size-4" />
                  Add Shareholder
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Shareholder</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Contact</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Joined</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Total Contribution</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Ownership %</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shareholders.map(shareholder => (
                    <tr key={shareholder.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-gray-900">{shareholder.name}</p>
                          <p className="text-xs text-gray-500">ID: {shareholder.idNumber}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        <div>
                          <p>{shareholder.phone}</p>
                          <p className="text-xs text-gray-500">{shareholder.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900 text-sm">
                        {shareholder.joinDate && !isNaN(new Date(shareholder.joinDate).getTime())
                          ? new Date(shareholder.joinDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'N/A'
                        }
                      </td>
                      <td className="py-3 px-4 text-gray-900 text-right">
                        {formatCurrency(shareholder.shareCapital || 0, { showCode: true })}
                      </td>
                      <td className="py-3 px-4 text-gray-900 text-right">
                        {shareholder.ownershipPercentage || 0}%
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          shareholder.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {shareholder.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRecordDeposit(shareholder)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Record Capital Deposit"
                          >
                            <TrendingUp className="size-4" />
                          </button>
                          <button
                            onClick={() => handleRecordDistribution(shareholder)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                            title="Record Profit Distribution"
                          >
                            <TrendingDown className="size-4" />
                          </button>
                          <button
                            onClick={() => handleEditShareholder(shareholder)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Shareholder"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            title="View Details"
                          >
                            <Eye className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Capital Deposits History */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900">Capital Deposit History</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search deposits..."
                      value={capitalSearchTerm}
                      onChange={(e) => setCapitalSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={capitalFilterShareholder}
                    onChange={(e) => setCapitalFilterShareholder(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Shareholders</option>
                    {shareholders.map(shareholder => (
                      <option key={shareholder.id} value={shareholder.id}>
                        {shareholder.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRecordDeposit()}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                  >
                    <Plus className="size-4" />
                    Record Deposit
                  </button>
                  <button
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
                  >
                    <Download className="size-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Date</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Shareholder</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Description</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Payment Method</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Reference</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Recorded By</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCapitalDeposits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        <DollarSign className="size-12 mx-auto mb-4 text-gray-300" />
                        <p>No capital deposits found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCapitalDeposits.map(deposit => (
                      <tr key={deposit.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 text-sm">
                          {new Date(deposit.date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-sm">
                          {deposit.shareholderName}
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-sm max-w-xs">
                          {deposit.description}
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-right">
                          {formatCurrency(deposit.amount, { showCode: true })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            deposit.paymentMethod === 'bank' ? 'bg-blue-100 text-blue-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {deposit.paymentMethod.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {deposit.reference}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {deposit.recordedBy}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Profit Distributions */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">Profit Distributions</h3>
                <button
                  onClick={() => handleRecordDistribution()}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
                >
                  <Plus className="size-4" />
                  Record Distribution
                </button>
              </div>
              
              {/* Distribution Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-purple-600 text-xs mb-1">Total Distributions Paid</p>
                  <p className="text-purple-900 text-xl">{currencyCode} {(totalDistributions / 1000000).toFixed(2)}M</p>
                  <p className="text-purple-600 text-xs mt-1">{profitDistributions.filter(d => d.status === 'paid').length} transactions</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-amber-600 text-xs mb-1">Pending Distributions</p>
                  <p className="text-amber-900 text-xl">{currencyCode} {(pendingDistributions / 1000000).toFixed(2)}M</p>
                  <p className="text-amber-600 text-xs mt-1">{profitDistributions.filter(d => d.status === 'approved').length} approved</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-blue-600 text-xs mb-1">Net Capital Position</p>
                  <p className="text-blue-900 text-xl">{currencyCode} {((totalDeposits - totalDistributions) / 1000000).toFixed(2)}M</p>
                  <p className="text-blue-600 text-xs mt-1">Deposits minus distributions</p>
                </div>
              </div>

              {/* Period Selector */}
              <div className="flex items-center justify-between mt-4">
                <h4 className="text-gray-900 text-sm">Distributions by Shareholder</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDistributionPeriodFilter('this-year')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      distributionPeriodFilter === 'this-year'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    This Year (2025)
                  </button>
                  <button
                    onClick={() => setDistributionPeriodFilter('last-year')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      distributionPeriodFilter === 'last-year'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Last Year (2024)
                  </button>
                  <button
                    onClick={() => setDistributionPeriodFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      distributionPeriodFilter === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    From Inception
                  </button>
                </div>
              </div>

              {/* Shareholder Distribution Cards */}
              <div className="grid grid-cols-3 gap-4 mt-3">
                {shareholders.filter(s => s.status === 'active').map(shareholder => {
                  const distributionAmount = getShareholderDistributions(shareholder.id, distributionPeriodFilter);
                  const distributionCount = shareholderTransactions.filter(t => {
                    if (t.shareholderId !== shareholder.id || t.type !== 'distribution' || t.status !== 'completed') return false;
                    if (distributionPeriodFilter === 'this-year' && !t.date.startsWith('2025')) return false;
                    if (distributionPeriodFilter === 'last-year' && !t.date.startsWith('2024')) return false;
                    return true;
                  }).length;

                  return (
                    <div key={shareholder.id} className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-gray-900">{shareholder.name}</p>
                          <p className="text-xs text-gray-600">{shareholder.ownershipPercentage}% ownership</p>
                        </div>
                        <button
                          onClick={() => handleRecordDistribution(shareholder)}
                          className="p-1.5 text-purple-600 hover:bg-purple-100 rounded"
                          title="Record Distribution"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-purple-600 mb-1">
                          {distributionPeriodFilter === 'this-year' ? 'This Year (2025)' : 
                           distributionPeriodFilter === 'last-year' ? 'Last Year (2024)' : 
                           'Total From Inception'}
                        </p>
                        <p className="text-purple-900 text-xl">{formatCurrency(distributionAmount, { showCode: true })}</p>
                        <p className="text-xs text-purple-600 mt-1">{distributionCount} payment{distributionCount !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by description, period, or reference..."
                    value={distributionSearchTerm}
                    onChange={(e) => setDistributionSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={capitalFilterShareholder}
                  onChange={(e) => setCapitalFilterShareholder(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Shareholders</option>
                  {shareholders.map(shareholder => (
                    <option key={shareholder.id} value={shareholder.id}>
                      {shareholder.name}
                    </option>
                  ))}
                </select>
                <select
                  value={distributionFilterStatus}
                  onChange={(e) => setDistributionFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                </select>
                <button
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                >
                  <Download className="size-4" />
                  Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Date</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Shareholder</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Period</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Description</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Payment Method</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Reference</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfitDistributions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-500">
                        <TrendingDown className="size-12 mx-auto mb-4 text-gray-300" />
                        <p>No profit distributions found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProfitDistributions.map(distribution => (
                      <tr key={distribution.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 text-sm">
                          {new Date(distribution.date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-sm">
                          {distribution.shareholderName}
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-sm">
                          {distribution.period}
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-sm max-w-xs">
                          {distribution.description}
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-right">
                          {formatCurrency(distribution.amount, { showCode: true })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            distribution.paymentMethod === 'bank' ? 'bg-blue-100 text-blue-800' :
                            distribution.paymentMethod === 'mpesa' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {distribution.paymentMethod.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {distribution.reference}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            distribution.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                            distribution.status === 'approved' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {distribution.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleViewDistribution(distribution)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shareholder-wise Summary Report */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-gray-900">Shareholder Summary Report</h3>
              <p className="text-gray-600 text-sm">Capital contributions vs profit distributions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Shareholder</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Ownership %</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Total Contributions</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Total Distributions</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Net Position</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Return %</th>
                  </tr>
                </thead>
                <tbody>
                  {shareholders.filter(s => s.status === 'Active').map(shareholder => {
                    // Use shareholder.shareCapital instead of totalContribution
                    const contributions = shareholder.shareCapital || 0;
                    
                    // Calculate distributions from shareholderTransactions
                    const distributions = shareholderTransactions
                      .filter(t => t.shareholderId === shareholder.id && t.type === 'Dividend Payment')
                      .reduce((sum, t) => sum + t.amount, 0);
                    
                    const netPosition = contributions - distributions;
                    const returnPercentage = contributions > 0 ? ((distributions / contributions) * 100).toFixed(1) : '0.0';
                    
                    return (
                      <tr key={shareholder.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="text-gray-900">{shareholder.name}</p>
                          <p className="text-xs text-gray-500">{shareholder.email}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-right">
                          {shareholder.ownershipPercentage}%
                        </td>
                        <td className="py-3 px-4 text-emerald-700 text-right">
                          {formatCurrency(contributions, { showCode: true })}
                        </td>
                        <td className="py-3 px-4 text-purple-700 text-right">
                          {formatCurrency(distributions, { showCode: true })}
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-right">
                          {formatCurrency(netPosition, { showCode: true })}
                        </td>
                        <td className="py-3 px-4 text-blue-700 text-right">
                          {returnPercentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="py-3 px-4 text-gray-900">Total</td>
                    <td className="py-3 px-4 text-gray-900 text-right">100%</td>
                    <td className="py-3 px-4 text-emerald-700 text-right">
                      {formatCurrency(totalDeposits, { showCode: true })}
                    </td>
                    <td className="py-3 px-4 text-purple-700 text-right">
                      {formatCurrency(totalDistributions, { showCode: true })}
                    </td>
                    <td className="py-3 px-4 text-gray-900 text-right">
                      {formatCurrency(totalDeposits - totalDistributions, { showCode: true })}
                    </td>
                    <td className="py-3 px-4 text-blue-700 text-right">
                      {totalDeposits > 0 ? ((totalDistributions / totalDeposits) * 100).toFixed(1) : '0.0'}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Account Modal */}
      {showAccountModal && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900">{isEditing ? 'Edit Account' : 'Add New Account'}</h3>
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="size-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Account Code *</label>
                  <input
                    type="text"
                    defaultValue={selectedAccount?.code}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1000"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Account Name *</label>
                  <input
                    type="text"
                    defaultValue={selectedAccount?.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Cash in Hand"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Account Type *</label>
                  <select
                    defaultValue={selectedAccount?.type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="asset">Asset</option>
                    <option value="liability">Liability</option>
                    <option value="equity">Equity</option>
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Category *</label>
                  <input
                    type="text"
                    defaultValue={selectedAccount?.category}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Current Assets"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Subcategory</label>
                  <input
                    type="text"
                    defaultValue={selectedAccount?.subcategory}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Parent Account</label>
                  <select
                    defaultValue={selectedAccount?.parentAccount}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None (Top Level)</option>
                    {accounts.filter(a => !a.parentAccount).map(a => (
                      <option key={a.id} value={a.code}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Opening Balance</label>
                  <input
                    type="number"
                    defaultValue={selectedAccount?.balance}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Status</label>
                  <select
                    defaultValue={selectedAccount?.status || 'active'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-gray-700 text-sm mb-1 block">Description</label>
                  <textarea
                    defaultValue={selectedAccount?.description}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional account description"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    alert(isEditing ? 'Account updated successfully!' : 'Account created successfully!');
                    setShowAccountModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isEditing ? 'Update Account' : 'Create Account'}
                </button>
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900">{selectedExpense ? 'Expense Details' : 'Record Operating Expense'}</h3>
                <button
                  onClick={() => {
                    setShowExpenseModal(false);
                    setSelectedExpense(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="size-5" />
                </button>
              </div>

              {selectedExpense ? (
                /* View Mode */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-600 text-sm">Reference</label>
                      <p className="text-gray-900">{selectedExpense.reference}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-sm">Date</label>
                      <p className="text-gray-900">
                        {new Date(selectedExpense.date).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-sm">Account</label>
                      <p className="text-gray-900">{selectedExpense.accountCode} - {selectedExpense.accountName}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-sm">Amount</label>
                      <p className="text-gray-900 text-xl">{formatCurrency(selectedExpense.amount, { showCode: true })}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-gray-600 text-sm">Description</label>
                      <p className="text-gray-900">{selectedExpense.description}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-sm">Payment Method</label>
                      <p className="text-gray-900 uppercase">{selectedExpense.paymentMethod}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-sm">Vendor</label>
                      <p className="text-gray-900">{selectedExpense.vendor || '-'}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-sm">Branch</label>
                      <p className="text-gray-900">{selectedExpense.branch}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-sm">Recorded By</label>
                      <p className="text-gray-900">{selectedExpense.recordedBy}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-sm">Status</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                        selectedExpense.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        selectedExpense.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedExpense.status}
                      </span>
                    </div>
                    {selectedExpense.approvedBy && (
                      <div>
                        <label className="text-gray-600 text-sm">Approved By</label>
                        <p className="text-gray-900">{selectedExpense.approvedBy}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(selectedExpense.approvedDate!).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    {selectedExpense.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            alert('Expense approved!');
                            setShowExpenseModal(false);
                          }}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            alert('Expense rejected!');
                            setShowExpenseModal(false);
                          }}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {selectedExpense.status === 'approved' && (
                      <button
                        onClick={() => {
                          alert('Payment processed!');
                          setShowExpenseModal(false);
                        }}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        Mark as Paid
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowExpenseModal(false);
                        setSelectedExpense(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Add/Edit Mode */
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 text-sm mb-1 block">Date *</label>
                    <input
                      type="date"
                      value={expenseFormData.date}
                      onChange={(e) => setExpenseFormData({...expenseFormData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 text-sm mb-1 block">Reference No. *</label>
                    <input
                      type="text"
                      placeholder="e.g., EXP-12-001"
                      value={expenseFormData.reference}
                      onChange={(e) => setExpenseFormData({...expenseFormData, reference: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-gray-700 text-sm mb-1 block">Expense Account *</label>
                    <select
                      value={expenseFormData.accountCode}
                      onChange={(e) => setExpenseFormData({...expenseFormData, accountCode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select account</option>
                      {expenseAccounts.map(account => (
                        <option key={account.id} value={account.code}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-gray-700 text-sm mb-1 block">Description *</label>
                    <textarea
                      rows={2}
                      placeholder="Describe the expense..."
                      value={expenseFormData.description}
                      onChange={(e) => setExpenseFormData({...expenseFormData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2 grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-gray-700 text-sm mb-1 block">Amount ({getCurrencyCode()}) *</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={expenseFormData.amount}
                        onChange={(e) => setExpenseFormData({...expenseFormData, amount: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 text-sm mb-1 block">Payment Method *</label>
                      <select
                        value={expenseFormData.paymentMethod}
                        onChange={(e) => setExpenseFormData({...expenseFormData, paymentMethod: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select method</option>
                        <option value="bank">Bank Transfer</option>
                        {mobileMoneyProviders.map((provider, index) => (
                          <option key={index} value={provider.toLowerCase().replace(/\s+/g, '-')}>{provider}</option>
                        ))}
                        <option value="cash">Cash</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-700 text-sm mb-1 block">Vendor</label>
                      <select
                        value={expenseFormData.vendor}
                        onChange={(e) => setExpenseFormData({...expenseFormData, vendor: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select vendor</option>
                        {payees.filter(p => p.status === 'Active').map((payee) => (
                          <option key={payee.id} value={payee.name}>
                            {payee.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-span-2 flex gap-2 pt-4">
                    <button
                      onClick={() => {
                        // Validate required fields
                        if (!expenseFormData.date || !expenseFormData.reference || !expenseFormData.accountCode || 
                            !expenseFormData.description || !expenseFormData.amount || !expenseFormData.paymentMethod) {
                          toast.error('Please fill in all required fields');
                          return;
                        }

                        // Get the account name
                        const account = accounts.find(a => a.code === expenseFormData.accountCode);
                        const accountName = account ? account.name : 'Unknown Account';

                        // Get current user from localStorage
                        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
                        const userName = currentUser.name || 'System User';

                        // Map payment method to DataContext format
                        const paymentMethodMap: { [key: string]: 'M-Pesa' | 'Cash' | 'Bank Transfer' | 'Cheque' } = {
                          'cash': 'Cash',
                          'bank': 'Bank Transfer',
                          'mpesa': 'M-Pesa',
                          'cheque': 'Cheque'
                        };

                        // Determine category based on account
                        let category: 'Operational' | 'Administrative' | 'Marketing' | 'IT & Technology' | 'Utilities' | 'Rent' | 'Salaries & Wages' | 'Other' = 'Operational';
                        if (account?.category.toLowerCase().includes('admin')) category = 'Administrative';
                        else if (account?.category.toLowerCase().includes('marketing')) category = 'Marketing';
                        else if (account?.category.toLowerCase().includes('it') || account?.category.toLowerCase().includes('technology')) category = 'IT & Technology';
                        else if (account?.category.toLowerCase().includes('utilities')) category = 'Utilities';
                        else if (account?.category.toLowerCase().includes('rent')) category = 'Rent';
                        else if (account?.category.toLowerCase().includes('salary') || account?.category.toLowerCase().includes('wage')) category = 'Salaries & Wages';
                        else if (account?.name.toLowerCase().includes('admin')) category = 'Administrative';
                        else if (account?.name.toLowerCase().includes('utilities')) category = 'Utilities';
                        else if (account?.name.toLowerCase().includes('rent')) category = 'Rent';
                        else if (account?.name.toLowerCase().includes('salary') || account?.name.toLowerCase().includes('wage')) category = 'Salaries & Wages';

                        // Create new expense using DataContext format
                        const newExpense = {
                          category: category,
                          subcategory: accountName,
                          amount: parseFloat(expenseFormData.amount),
                          payeeName: expenseFormData.vendor || 'Unknown',
                          paymentMethod: paymentMethodMap[expenseFormData.paymentMethod] || 'Cash',
                          paymentReference: expenseFormData.reference,
                          expenseDate: expenseFormData.date,
                          description: expenseFormData.description,
                          status: 'Pending' as const,
                          recordedBy: userName
                        };

                        // Add to DataContext
                        addExpense(newExpense);

                        // Reset form
                        setExpenseFormData({
                          date: new Date().toISOString().split('T')[0],
                          reference: '',
                          accountCode: '',
                          description: '',
                          amount: '',
                          paymentMethod: '',
                          vendor: ''
                        });

                        toast.success('Expense recorded successfully!');
                        setShowExpenseModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Record Expense
                    </button>
                    <button
                      onClick={() => {
                        setShowExpenseModal(false);
                        setSelectedExpense(null);
                        // Reset form
                        setExpenseFormData({
                          date: new Date().toISOString().split('T')[0],
                          reference: '',
                          accountCode: '',
                          description: '',
                          amount: '',
                          paymentMethod: '',
                          vendor: ''
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Shareholder Modal */}
      {showShareholderModal && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900">{selectedShareholder ? 'Edit Shareholder' : 'Add New Shareholder'}</h3>
                <button
                  onClick={() => setShowShareholderModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="size-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-gray-700 text-sm mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    defaultValue={selectedShareholder?.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., John Kamau"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">National ID *</label>
                  <input
                    type="text"
                    defaultValue={selectedShareholder?.nationalId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 12345678"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Phone Number *</label>
                  <input
                    type="tel"
                    defaultValue={selectedShareholder?.phone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+254712345678"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-gray-700 text-sm mb-1 block">Email Address *</label>
                  <input
                    type="email"
                    defaultValue={selectedShareholder?.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Initial Contribution (KES)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">
                    Ownership Percentage (%) *
                    {(() => {
                      const otherShareholders = selectedShareholder 
                        ? shareholders.filter(s => s.id !== selectedShareholder.id)
                        : shareholders;
                      const totalOtherOwnership = otherShareholders.reduce((sum, s) => sum + (s.ownershipPercentage || 0), 0);
                      const available = 100 - totalOtherOwnership;
                      return (
                        <span className="text-xs text-gray-500 ml-1">
                          (Available: {available.toFixed(2)}%)
                        </span>
                      );
                    })()}
                  </label>
                  <input
                    id="ownershipPercentageInput"
                    type="number"
                    defaultValue={selectedShareholder?.ownershipPercentage}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                    onChange={(e) => {
                      const value = parseFloat(e.target.value || '0');
                      const otherShareholders = selectedShareholder 
                        ? shareholders.filter(s => s.id !== selectedShareholder.id)
                        : shareholders;
                      const totalOtherOwnership = otherShareholders.reduce((sum, s) => sum + (s.ownershipPercentage || 0), 0);
                      const total = totalOtherOwnership + value;
                      
                      if (total > 100) {
                        e.target.setCustomValidity(`Total ownership would be ${total.toFixed(2)}%, which exceeds 100%. Maximum allowed: ${(100 - totalOtherOwnership).toFixed(2)}%`);
                      } else {
                        e.target.setCustomValidity('');
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Join Date *</label>
                  <input
                    type="date"
                    defaultValue={selectedShareholder?.joinedDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Status</label>
                  <select
                    defaultValue={selectedShareholder?.status || 'active'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Ownership Warning */}
              {(() => {
                const otherShareholders = selectedShareholder 
                  ? shareholders.filter(s => s.id !== selectedShareholder.id)
                  : shareholders;
                const totalOtherOwnership = otherShareholders.reduce((sum, s) => sum + (s.ownershipPercentage || 0), 0);
                
                if (totalOtherOwnership >= 100) {
                  return (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">
                        <strong>⚠️ Warning:</strong> Total ownership by other shareholders is already at {totalOtherOwnership.toFixed(2)}%. Cannot add more shareholders.
                      </p>
                    </div>
                  );
                } else if (totalOtherOwnership > 80) {
                  return (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-800 text-sm">
                        <strong>Note:</strong> Current total ownership by other shareholders: {totalOtherOwnership.toFixed(2)}%. Only {(100 - totalOtherOwnership).toFixed(2)}% available.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    const ownershipInput = document.getElementById('ownershipPercentageInput') as HTMLInputElement;
                    const ownershipValue = parseFloat(ownershipInput?.value || '0');
                    
                    // Calculate total ownership
                    const otherShareholders = selectedShareholder 
                      ? shareholders.filter(s => s.id !== selectedShareholder.id)
                      : shareholders;
                    const totalOtherOwnership = otherShareholders.reduce((sum, s) => sum + (s.ownershipPercentage || 0), 0);
                    const totalOwnership = totalOtherOwnership + ownershipValue;
                    
                    // Validate
                    if (totalOwnership > 100) {
                      alert(`❌ Total ownership cannot exceed 100%.\n\nCurrent situation:\n• Other shareholders: ${totalOtherOwnership.toFixed(2)}%\n• This shareholder: ${ownershipValue.toFixed(2)}%\n• Total: ${totalOwnership.toFixed(2)}%\n\nMaximum you can allocate: ${(100 - totalOtherOwnership).toFixed(2)}%`);
                      return;
                    }
                    
                    alert('Shareholder saved!');
                    setShowShareholderModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedShareholder ? 'Update' : 'Add'} Shareholder
                </button>
                <button
                  onClick={() => setShowShareholderModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900">Record Capital Deposit</h3>
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="size-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-gray-700 text-sm mb-1 block">Shareholder *</label>
                  <select
                    defaultValue={selectedShareholder?.id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select shareholder</option>
                    {shareholders.map(shareholder => (
                      <option key={shareholder.id} value={shareholder.id}>
                        {shareholder.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Deposit Date *</label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Amount ({getCurrencyCode()}) *</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Payment Method *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select method</option>
                    <option value="bank">Bank Transfer</option>
                    {mobileMoneyProviders.map((provider, index) => (
                      <option key={index} value={provider.toLowerCase().replace(/\s+/g, '-')}>{provider}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Reference Number *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., KCB-TRX-251211-001 or SKJ4H8GF21"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-gray-700 text-sm mb-1 block">Description *</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="e.g., Capital contribution for business expansion"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-gray-700 text-sm mb-1 block">Deposit To *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select bank account</option>
                    <option value="1020">1020 - Bank - KCB Main Account</option>
                    <option value="1030">1030 - Bank - Equity Bank</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> This deposit will be recorded in the Share Capital account (3000) and will update the shareholder's total contribution and ownership percentage accordingly.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    alert('Capital deposit recorded successfully!');
                    setShowDepositModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Record Deposit
                </button>
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profit Distribution Modal */}
      {showDistributionModal && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900">{selectedDistribution ? 'Distribution Details' : 'Record Profit Distribution'}</h3>
                <button
                  onClick={() => {
                    setShowDistributionModal(false);
                    setSelectedDistribution(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="size-5" />
                </button>
              </div>

              {selectedDistribution ? (
                // View Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-600 text-xs">Shareholder</label>
                      <p className="text-gray-900">{selectedDistribution.shareholderName}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-xs">Period</label>
                      <p className="text-gray-900">{selectedDistribution.period}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-xs">Date</label>
                      <p className="text-gray-900">
                        {new Date(selectedDistribution.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-xs">Amount</label>
                      <p className="text-gray-900">{formatCurrency(selectedDistribution.amount, { showCode: true })}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-xs">Payment Method</label>
                      <p className="text-gray-900">{selectedDistribution.paymentMethod.toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-xs">Reference</label>
                      <p className="text-gray-900">{selectedDistribution.reference}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-gray-600 text-xs">Description</label>
                      <p className="text-gray-900">{selectedDistribution.description}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-xs">Status</label>
                      <p>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          selectedDistribution.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          selectedDistribution.status === 'approved' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedDistribution.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-xs">Recorded By</label>
                      <p className="text-gray-900">{selectedDistribution.recordedBy}</p>
                    </div>
                    {selectedDistribution.approvedBy && (
                      <>
                        <div>
                          <label className="text-gray-600 text-xs">Approved By</label>
                          <p className="text-gray-900">{selectedDistribution.approvedBy}</p>
                        </div>
                        <div>
                          <label className="text-gray-600 text-xs">Approved Date</label>
                          <p className="text-gray-900">
                            {selectedDistribution.approvedDate && new Date(selectedDistribution.approvedDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    {selectedDistribution.status === 'approved' && (
                      <button
                        onClick={() => {
                          alert('Payment marked as completed!');
                          setShowDistributionModal(false);
                        }}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        Mark as Paid
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowDistributionModal(false);
                        setSelectedDistribution(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                // Create Mode
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-gray-700 text-sm mb-1 block">Shareholder *</label>
                      <select
                        defaultValue={selectedShareholder?.id}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select shareholder</option>
                        {shareholders.map(shareholder => (
                          <option key={shareholder.id} value={shareholder.id}>
                            {shareholder.name} ({shareholder.ownershipPercentage}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-700 text-sm mb-1 block">Period *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Q1 2025 or FY 2024"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 text-sm mb-1 block">Payment Date *</label>
                      <input
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 text-sm mb-1 block">Amount (KES) *</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 text-sm mb-1 block">Payment Method *</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select method</option>
                        <option value="bank">Bank Transfer</option>
                        {mobileMoneyProviders.map((provider, index) => (
                          <option key={index} value={provider.toLowerCase().replace(/\s+/g, '-')}>{provider}</option>
                        ))}
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="text-gray-700 text-sm mb-1 block">Reference Number *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., KCB-TRX-251211-001 or SKJ4H8GF21"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-gray-700 text-sm mb-1 block">Description *</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="e.g., Profit distribution for Q1 2025"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-gray-700 text-sm mb-1 block">Payment From *</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select bank account</option>
                        <option value="1020">1020 - Bank - KCB Main Account</option>
                        <option value="1030">1030 - Bank - Equity Bank</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="text-gray-700 text-sm mb-1 block">Status *</label>
                      <select
                        defaultValue="approved"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved (Ready to Pay)</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                    <p className="text-purple-800 text-sm">
                      <strong>Note:</strong> This distribution will be recorded as a debit to Retained Earnings and will reduce the available capital. Ensure sufficient funds are available in the selected bank account.
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        alert('Profit distribution recorded successfully!');
                        setShowDistributionModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Record Distribution
                    </button>
                    <button
                      onClick={() => {
                        setShowDistributionModal(false);
                        setSelectedShareholder(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New functional modals that actually save data */}
      {showShareholderModal && (
        <ShareholderFormModal
          shareholder={selectedShareholder}
          onClose={() => {
            setShowShareholderModal(false);
            setSelectedShareholder(null);
          }}
          onSuccess={() => {
            // Refresh will happen automatically via DataContext
          }}
        />
      )}

      {showDepositModal && (
        <CapitalDepositModal
          shareholder={selectedShareholder}
          onClose={() => {
            setShowDepositModal(false);
            setSelectedShareholder(null);
          }}
          onSuccess={() => {
            // Refresh will happen automatically via DataContext
          }}
        />
      )}

      {showDistributionModal && !selectedDistribution && (
        <ProfitDistributionModal
          shareholder={selectedShareholder}
          distribution={null}
          onClose={() => {
            setShowDistributionModal(false);
            setSelectedShareholder(null);
          }}
          onSuccess={() => {
            // Refresh will happen automatically via DataContext
          }}
        />
      )}

      {showDistributionModal && selectedDistribution && (
        <ProfitDistributionModal
          shareholder={null}
          distribution={selectedDistribution}
          onClose={() => {
            setShowDistributionModal(false);
            setSelectedDistribution(null);
          }}
          onSuccess={() => {
            // Refresh will happen automatically via DataContext
          }}
        />
      )}
    </div>
  );
}