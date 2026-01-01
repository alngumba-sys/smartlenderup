import { supabase } from './supabase';
import { toast } from 'sonner@2.0.3';
import { isValidUUID, generateUUID, ensureUUID } from '../utils/uuidUtils';
import type {
  Client,
  Loan,
  LoanProduct,
  Repayment,
  SavingsAccount,
  SavingsTransaction,
  Shareholder,
  ShareholderTransaction,
  Expense,
  Payee,
  BankAccount,
  Task,
  KYCRecord,
  Approval,
  FundingTransaction,
  ProcessingFeeRecord,
  Disbursement,
  PayrollRun,
  JournalEntry,
  AuditLog,
  Ticket,
  Group,
  Guarantor,
  Collateral
} from '../contexts/DataContext';
import type { LoanDocument } from '../types';

// Track if Supabase is available
let supabaseAvailable: boolean | null = null;
let hasWarnedAboutSupabase = false;

// Check if Supabase is available (silent check)
const isSupabaseAvailable = async (): Promise<boolean> => {
  if (supabaseAvailable !== null) {
    return supabaseAvailable;
  }
  
  try {
    // Quick connectivity test - just check if we can reach Supabase
    const { error } = await supabase.from('organizations').select('id').limit(1);
    supabaseAvailable = !error;
    
    if (!supabaseAvailable && !hasWarnedAboutSupabase) {
      console.log('ℹ️ Supabase not connected - running in offline mode');
      hasWarnedAboutSupabase = true;
    }
    return supabaseAvailable;
  } catch (e) {
    supabaseAvailable = false;
    if (!hasWarnedAboutSupabase) {
      console.log('ℹ️ Supabase not connected - running in offline mode');
      hasWarnedAboutSupabase = true;
    }
    return false;
  }
};

// Get the current organization ID from localStorage
let hasWarnedAboutOrgId = false; // Track if we've already warned about missing org ID

const getOrganizationId = (): string | null => {
  const orgData = localStorage.getItem('current_organization');
  if (orgData) {
    try {
      const org = JSON.parse(orgData);
      hasWarnedAboutOrgId = false; // Reset warning flag when org is found
      return org.id || null;
    } catch (e) {
      console.error('Error parsing organization data:', e);
      return null;
    }
  }
  
  // Only warn once about missing organization
  if (!hasWarnedAboutOrgId) {
    console.log('ℹ️ No organization set - waiting for login');
    hasWarnedAboutOrgId = true;
  }
  
  return null;
};

// Helper function to transform client data from camelCase to snake_case for Supabase
const transformClientForSupabase = (client: any): any => {
  const transformed: any = {};
  
  console.log('🔍 transformClientForSupabase - INPUT:', {
    name: client.name,
    firstName: client.firstName,
    lastName: client.lastName,
    first_name: client.first_name,
    last_name: client.last_name
  });
  
  // Handle name field - split into first_name and last_name if needed
  if (client.name && !client.firstName && !client.first_name) {
    const nameParts = client.name.trim().split(' ');
    if (nameParts.length >= 2) {
      transformed.first_name = nameParts[0];
      transformed.last_name = nameParts.slice(1).join(' ');
    } else {
      transformed.first_name = client.name;
      transformed.last_name = client.name;
    }
    console.log('🔍 Set from name field (first block):', {
      first_name: transformed.first_name,
      last_name: transformed.last_name
    });
  }
  
  // Map all fields from camelCase to snake_case
  const fieldMap: Record<string, string> = {
    // Keep these as-is since they match
    'id': 'id',
    'organization_id': 'organization_id',
    'first_name': 'first_name',
    'last_name': 'last_name',
    'id_number': 'id_number',
    'phone': 'phone',
    'email': 'email',
    'date_of_birth': 'date_of_birth',
    'gender': 'gender',
    'marital_status': 'marital_status',
    'number_of_dependents': 'number_of_dependents',
    'county': 'county',
    'town': 'town',
    'address': 'address',
    'postal_code': 'postal_code',
    'occupation': 'occupation',
    'employer': 'employer',
    'monthly_income': 'monthly_income',
    'other_income': 'other_income',
    'status': 'status',
    'kyc_status': 'kyc_status',
    'risk_rating': 'risk_rating',
    'date_registered': 'date_registered',
    'created_at': 'created_at',
    'updated_at': 'updated_at',
    
    // CamelCase to snake_case mappings
    'firstName': 'first_name',
    'lastName': 'last_name',
    'idNumber': 'id_number',
    'dateOfBirth': 'date_of_birth',
    'maritalStatus': 'marital_status',
    'numberOfDependents': 'number_of_dependents',
    'postalCode': 'postal_code',
    'monthlyIncome': 'monthly_income',
    'otherIncome': 'other_income',
    'kycStatus': 'kyc_status',
    'riskRating': 'risk_rating',
    'dateRegistered': 'date_registered',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'organizationId': 'organization_id',
  };
  
  // IMPORTANT: Parse the 'name' field into first_name and last_name if it exists
  if (client.name && !client.firstName && !client.lastName && !transformed.first_name && !transformed.last_name) {
    const nameParts = client.name.trim().split(' ');
    if (nameParts.length === 1) {
      transformed.first_name = nameParts[0];
      transformed.last_name = nameParts[0]; // Use same name for both if only one word
    } else {
      transformed.first_name = nameParts[0];
      transformed.last_name = nameParts.slice(1).join(' '); // Everything after first word
    }
    console.log('🔍 Set from name field (second block):', {
      first_name: transformed.first_name,
      last_name: transformed.last_name
    });
  }
  
  // Transform each field
  Object.keys(client).forEach(key => {
    // Skip fields that don't exist in Supabase schema
    if (key === 'branch' || key === 'creditScore' || key === 'creditTier' || 
        key === 'client_type' || key === 'clientType' || key === 'group_name' || 
        key === 'groupName' || key === 'client_number' || key === 'clientNumber' ||
        key === 'sub_county' || key === 'subCounty' || key === 'ward' || key === 'village' ||
        key === 'membershipId' || key === 'membership_id' || key === 'memberSince' || key === 'member_since' ||
        key === 'groupRole' || key === 'group_role' || key === 'accountType' || 
        key === 'account_type' || key === 'nationalId' || key === 'national_id' ||
        // FILTER OUT BUSINESS FIELDS until migration is run in Supabase
        key === 'businessType' || key === 'business_type' || 
        key === 'businessName' || key === 'business_name' ||
        key === 'businessLocation' || key === 'business_location' ||
        key === 'yearsInBusiness' || key === 'years_in_business' ||
        // Filter out other fields not in schema
        key === 'name' || key === 'city' || key === 'nextOfKin' || key === 'photo' ||
        key === 'documents' || key === 'groupMembership' || key === 'joinDate' ||
        key === 'createdBy' || key === 'lastUpdated') {
      return; // Skip these fields - they're not in Supabase schema
    }
    
    // Keep the ID as-is (supports both UUID and alphanumeric formats like CL001)
    if (key === 'id') {
      transformed.id = client[key];
      return;
    }
    
    const mappedKey = fieldMap[key] || key;
    transformed[mappedKey] = client[key];
  });
  
  // Ensure id is always set (use the original value, don't force UUID)
  if (!transformed.id) {
    // Only generate a new ID if one doesn't exist
    transformed.id = client.id || generateUUID();
  }
  
  // Ensure required fields have values
  if (!transformed.first_name) {
    console.log('⚠️ WARNING: first_name is missing, defaulting to "Unknown"');
    transformed.first_name = 'Unknown';
  }
  if (!transformed.last_name) {
    console.log('⚠️ WARNING: last_name is missing, defaulting to "Unknown"');
    transformed.last_name = 'Unknown';
  }
  
  console.log('🔍 transformClientForSupabase - OUTPUT:', {
    first_name: transformed.first_name,
    last_name: transformed.last_name,
    id: transformed.id
  });
  if (!transformed.id_number) {
    // Generate a unique id_number if not provided to avoid unique constraint violations
    // Use the client ID or generate a timestamp-based unique value
    transformed.id_number = client.id ? `ID-${client.id}` : `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  if (!transformed.phone) {
    transformed.phone = 'N/A';
  }
  if (!transformed.county) {
    transformed.county = 'N/A';
  }
  if (!transformed.town) {
    transformed.town = 'N/A';
  }
  if (!transformed.address) {
    transformed.address = 'N/A';
  }
  if (!transformed.occupation) {
    transformed.occupation = 'N/A';
  }
  if (!transformed.date_of_birth) {
    transformed.date_of_birth = '2000-01-01';
  }
  if (!transformed.gender) {
    transformed.gender = 'Other';
  }
  if (!transformed.marital_status) {
    transformed.marital_status = 'Single';
  }
  // Convert empty strings to 0 for numeric fields to prevent PostgreSQL errors
  if (transformed.number_of_dependents === undefined || transformed.number_of_dependents === null || transformed.number_of_dependents === '') {
    transformed.number_of_dependents = 0;
  }
  if (transformed.monthly_income === undefined || transformed.monthly_income === null || transformed.monthly_income === '') {
    transformed.monthly_income = 0;
  }
  if (transformed.other_income === undefined || transformed.other_income === null || transformed.other_income === '') {
    transformed.other_income = 0;
  }
  if (!transformed.kyc_status) {
    transformed.kyc_status = 'Pending';
  }
  if (!transformed.risk_rating) {
    transformed.risk_rating = 'Medium';
  }
  // Convert status to lowercase for Supabase (which uses lowercase enum values)
  if (!transformed.status) {
    transformed.status = 'active';
  } else if (typeof transformed.status === 'string') {
    // Convert 'Active', 'Inactive', 'Blacklisted' to 'active', 'inactive', 'blacklisted'
    transformed.status = transformed.status.toLowerCase();
  }
  if (!transformed.date_registered) {
    transformed.date_registered = new Date().toISOString().split('T')[0];
  }
  
  return transformed;
};

// Helper function to transform loan product data from camelCase to snake_case for Supabase
const transformLoanProductForSupabase = (product: any): any => {
  const transformed: any = {};
  
  const fieldMap = {
    // UI field names to Supabase column names (MATCHING ACTUAL DATABASE SCHEMA)
    'name': 'name',  // ✅ Actual column is 'name' NOT 'product_name'
    'description': 'description',
    'minAmount': 'min_amount',
    'maxAmount': 'max_amount',
    'minTenor': 'min_term',  // ✅ Actual column is 'min_term' NOT 'min_duration_months'
    'maxTenor': 'max_term',  // ✅ Actual column is 'max_term' NOT 'max_duration_months'
    'minTerm': 'min_term',
    'maxTerm': 'max_term',
    'tenorMonths': 'max_term',
    'interestRate': 'interest_rate',
    'interestType': 'interest_method',
    'repaymentFrequency': 'repayment_frequency',
    'insuranceFee': 'insurance_fee_fixed',
    'processingFee': 'processing_fee_fixed',
    'processingFeePercentage': 'processing_fee_percentage',
    'guarantorsRequired': 'guarantor_required',
    'guarantorRequired': 'guarantor_required',
    'collateralRequired': 'collateral_required',
    'status': 'status',
    'createdDate': 'created_at',
    'lastUpdated': 'updated_at',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    
    // snake_case to snake_case (keep as-is)
    'min_amount': 'min_amount',
    'max_amount': 'max_amount',
    'min_term': 'min_term',
    'max_term': 'max_term',
    'interest_rate': 'interest_rate',
    'interest_method': 'interest_method',
    'repayment_frequency': 'repayment_frequency',
    'insurance_fee_fixed': 'insurance_fee_fixed',
    'processing_fee_percentage': 'processing_fee_percentage',
    'processing_fee_fixed': 'processing_fee_fixed',
    'guarantor_required': 'guarantor_required',
    'collateral_required': 'collateral_required',
    'created_at': 'created_at',
    'updated_at': 'updated_at',
    'product_code': 'product_code',
  };
  
  // Transform each field
  Object.keys(product).forEach(key => {
    // Skip fields that are already handled or don't belong in DB
    if (key === 'defaultAmount' || key === 'defaultTerm' || key === 'termUnit' || 
        key === 'insuranceFeeType' || key === 'gracePeriod' ||
        key === 'processingFeeType' || key === 'penaltyRate' ||
        key === 'late_payment_penalty_percentage' || key === 'number_of_guarantors') {
      return; // Skip these fields
    }
    
    // Keep the ID as-is (supports both UUID and custom formats like PROD-001)
    if (key === 'id') {
      transformed.id = product[key];
      return;
    }
    
    const mappedKey = fieldMap[key] || key;
    transformed[mappedKey] = product[key];
  });
  
  // Ensure id is always set (use the original value, don't force UUID)
  if (!transformed.id) {
    // Only generate a new ID if one doesn't exist
    transformed.id = product.id || generateUUID();
  }
  
  // Generate product_code if not exists (REQUIRED field in Supabase)
  if (!transformed.product_code) {
    // Use the product name or ID to generate a code
    const baseName = product.name || product.product_name || 'PROD';
    transformed.product_code = `${baseName.substring(0, 4).toUpperCase()}-${Date.now().toString().slice(-6)}`;
  }
  
  // Transform interest_method values from UI format to database format
  // UI: 'Flat', 'Declining', 'Simple', 'Compound', etc.
  // DB: 'flat', 'reducing_balance', 'compound'
  if (transformed.interest_method) {
    const methodMap: Record<string, string> = {
      'Flat Rate': 'flat',
      'Flat': 'flat',
      'Declining Balance': 'reducing_balance',
      'Declining': 'reducing_balance',
      'Reducing Balance': 'reducing_balance',
      'Compound': 'compound',
      'Compound Interest': 'compound',
      'Simple': 'flat',
      'Simple Interest': 'flat',
      'Amortized': 'reducing_balance',
      'Bullet': 'flat',
      'Bullet Payment (Principal at End)': 'flat',
      'Interest Only': 'flat',
      'Interest Only (Periodic)': 'flat'
    };
    transformed.interest_method = methodMap[transformed.interest_method] || transformed.interest_method.toLowerCase();
  }
  
  // Transform repayment_frequency to lowercase
  if (transformed.repayment_frequency) {
    transformed.repayment_frequency = transformed.repayment_frequency.toLowerCase();
  }
  
  // Validate numeric fields to prevent overflow (precision 5, scale 2 = max 999.99)
  // Interest rate should be a percentage (0-100)
  if (transformed.interest_rate && parseFloat(transformed.interest_rate) > 999) {
    console.warn(`Interest rate ${transformed.interest_rate} is too large, capping at 99.99%`);
    transformed.interest_rate = 99.99;
  }
  
  // Processing fee percentage should be (0-100) - only validate if it exists
  if (transformed.processing_fee_percentage && parseFloat(transformed.processing_fee_percentage) > 100) {
    console.warn(`Processing fee percentage ${transformed.processing_fee_percentage} is too large, capping at 100%`);
    transformed.processing_fee_percentage = 100;
  }
  
  // Ensure required fields have default values
  if (!transformed.name) {
    transformed.name = product.name || 'Unnamed Product';
  }
  if (!transformed.description) {
    transformed.description = 'No description';
  }
  // Convert empty strings to null/0 for numeric fields to prevent PostgreSQL errors
  if (transformed.min_amount === undefined || transformed.min_amount === null || transformed.min_amount === '') {
    transformed.min_amount = 0;
  }
  if (transformed.max_amount === undefined || transformed.max_amount === null || transformed.max_amount === '') {
    transformed.max_amount = 10000000;
  }
  if (transformed.min_term === undefined || transformed.min_term === null || transformed.min_term === '') {
    transformed.min_term = 1;
  }
  if (transformed.max_term === undefined || transformed.max_term === null || transformed.max_term === '') {
    transformed.max_term = 60;
  }
  if (transformed.interest_rate === undefined || transformed.interest_rate === null || transformed.interest_rate === '') {
    transformed.interest_rate = 0;
  }
  if (transformed.processing_fee_percentage === undefined || transformed.processing_fee_percentage === null || transformed.processing_fee_percentage === '') {
    transformed.processing_fee_percentage = 0;
  }
  if (transformed.processing_fee_fixed === undefined || transformed.processing_fee_fixed === null || transformed.processing_fee_fixed === '') {
    transformed.processing_fee_fixed = 0;
  }
  if (transformed.insurance_fee_fixed === undefined || transformed.insurance_fee_fixed === null || transformed.insurance_fee_fixed === '') {
    transformed.insurance_fee_fixed = 0;
  }
  if (!transformed.interest_method) {
    transformed.interest_method = 'flat';
  }
  if (!transformed.repayment_frequency) {
    transformed.repayment_frequency = 'monthly';
  }
  if (transformed.guarantor_required === undefined || transformed.guarantor_required === null) {
    transformed.guarantor_required = false;
  }
  if (transformed.collateral_required === undefined || transformed.collateral_required === null) {
    transformed.collateral_required = false;
  }
  if (!transformed.status) {
    transformed.status = 'Active';
  } else if (typeof transformed.status === 'string') {
    // Capitalize first letter for database (database uses 'Active', 'Inactive')
    transformed.status = transformed.status.charAt(0).toUpperCase() + transformed.status.slice(1).toLowerCase();
  }
  
  return transformed;
};

// Helper function to transform loan data for Supabase
const transformLoanForSupabase = (loan: any): any => {
  const transformed: any = {};
  
  const fieldMap: Record<string, string> = {
    'id': 'id',
    'organization_id': 'organization_id',
    'clientId': 'client_id',
    'client_id': 'client_id',
    'productId': 'loan_product_id',
    'loan_product_id': 'loan_product_id',
    'principalAmount': 'amount',
    'amount': 'amount',
    'interestRate': 'interest_rate',
    'interest_rate': 'interest_rate',
    'term': 'term_months',
    'term_months': 'term_months',
    'purpose': 'purpose',
    'status': 'status',
    'applicationDate': 'application_date',
    'application_date': 'application_date',
    'approvedDate': 'approval_date',
    'approval_date': 'approval_date',
    'disbursementDate': 'disbursement_date',
    'disbursement_date': 'disbursement_date',
    'firstRepaymentDate': 'first_payment_date',
    'first_payment_date': 'first_payment_date',
    'totalRepayable': 'total_payable',
    'total_payable': 'total_payable',
    'installmentAmount': 'monthly_payment',
    'monthly_payment': 'monthly_payment',
    'outstandingBalance': 'balance',
    'balance': 'balance',
    'paidAmount': 'principal_paid',
    'principal_paid': 'principal_paid',
    'interestPaid': 'interest_paid',
    'interest_paid': 'interest_paid',
    'paymentMethod': 'payment_method',
    'payment_method': 'payment_method',
    'guarantorRequired': 'guarantor_required',
    'guarantor_required': 'guarantor_required',
    'collateralRequired': 'collateral_required',
    'collateral_required': 'collateral_required',
    'createdAt': 'created_at',
    'created_at': 'created_at',
    'updatedAt': 'updated_at',
    'updated_at': 'updated_at',
  };
  
  // Transform each field
  Object.keys(loan).forEach(key => {
    // Skip fields that don't exist in Supabase schema
    if (key === 'clientName' || key === 'productName' || key === 'interestType' || 
        key === 'termUnit' || key === 'repaymentFrequency' || key === 'maturityDate' ||
        key === 'approvedBy' || key === 'disbursedBy' || key === 'disbursedDate' ||
        key === 'collateral' || key === 'guarantors' || key === 'totalInterest' ||
        key === 'numberOfInstallments' || key === 'principalOutstanding' ||
        key === 'interestOutstanding' || key === 'daysInArrears' || key === 'arrearsAmount' ||
        key === 'overdueAmount' || key === 'penaltyAmount' || key === 'createdBy' ||
        key === 'lastPaymentDate' || key === 'lastPaymentAmount' || key === 'nextPaymentDate' ||
        key === 'nextPaymentAmount' || key === 'loanOfficer' || key === 'notes') {
      return; // Skip these fields - 'notes' added to skip list
    }
    
    // Keep the ID as-is (supports both UUID and custom formats like ABC-L00001)
    if (key === 'id') {
      transformed.id = loan[key];
      return;
    }
    
    const mappedKey = fieldMap[key] || key;
    transformed[mappedKey] = loan[key];
  });
  
  // Ensure id is always set (use the original value, don't force UUID)
  if (!transformed.id) {
    // Only generate a new ID if one doesn't exist
    transformed.id = loan.id || generateUUID();
  }
  
  // Store original IDs for potential lookup in createLoan function
  // Don't delete them yet - let createLoan handle the lookup
  if (transformed.client_id && !isValidUUID(transformed.client_id)) {
    // Silently flag for lookup - this is expected behavior when syncing to Supabase
    transformed._originalClientId = transformed.client_id;
    transformed._needsClientLookup = true;
  }
  
  if (transformed.loan_product_id && !isValidUUID(transformed.loan_product_id)) {
    // Silently flag for lookup - this is expected behavior when syncing to Supabase
    transformed._originalProductId = transformed.loan_product_id;
    transformed._needsProductLookup = true;
  }
  
  // Ensure required fields have default values
  if (!transformed.payment_method) {
    transformed.payment_method = 'Cash';
  }
  
  // Convert empty strings to 0 for numeric fields to prevent PostgreSQL errors
  if (transformed.amount === undefined || transformed.amount === null || transformed.amount === '') {
    transformed.amount = 0;
  }
  if (transformed.interest_rate === undefined || transformed.interest_rate === null || transformed.interest_rate === '') {
    transformed.interest_rate = 0;
  }
  if (transformed.term_months === undefined || transformed.term_months === null || transformed.term_months === '') {
    transformed.term_months = 1;
  }
  if (transformed.total_payable === undefined || transformed.total_payable === null || transformed.total_payable === '') {
    transformed.total_payable = 0;
  }
  if (transformed.monthly_payment === undefined || transformed.monthly_payment === null || transformed.monthly_payment === '') {
    transformed.monthly_payment = 0;
  }
  if (transformed.balance === undefined || transformed.balance === null || transformed.balance === '') {
    transformed.balance = 0;
  }
  if (transformed.principal_paid === undefined || transformed.principal_paid === null || transformed.principal_paid === '') {
    transformed.principal_paid = 0;
  }
  if (transformed.interest_paid === undefined || transformed.interest_paid === null || transformed.interest_paid === '') {
    transformed.interest_paid = 0;
  }
  
  // Convert empty strings to null for date fields to prevent PostgreSQL errors
  const dateFields = ['application_date', 'approval_date', 'disbursement_date', 'first_payment_date'];
  dateFields.forEach(field => {
    if (transformed[field] === '' || transformed[field] === undefined) {
      transformed[field] = null;
    }
  });
  
  return transformed;
};

// Helper function to transform loan data FROM Supabase (snake_case) back to UI format (camelCase)
const transformLoanFromSupabase = (loan: any): any => {
  if (!loan) return null;
  
  return {
    id: loan.id,
    clientId: loan.client_id,
    clientName: loan.client_name || 'Unknown', // We'll need to join this or look it up
    productId: loan.loan_product_id,
    productName: loan.product_name || 'Unknown', // We'll need to join this or look it up
    principalAmount: loan.amount || 0,
    interestRate: loan.interest_rate || 0,
    term: loan.term_months || 0,
    purpose: loan.purpose || '',
    status: loan.status || 'Pending',
    applicationDate: loan.application_date || '',
    approvedDate: loan.approval_date || '',
    disbursementDate: loan.disbursement_date || '',
    firstRepaymentDate: loan.first_payment_date || '',
    totalRepayable: loan.total_payable || 0,
    installmentAmount: loan.monthly_payment || 0,
    outstandingBalance: loan.balance || 0,
    paidAmount: loan.principal_paid || 0,
    interestPaid: loan.interest_paid || 0,
    paymentMethod: loan.payment_method || 'Cash',
    guarantorRequired: loan.guarantor_required || false,
    collateralRequired: loan.collateral_required || false,
    createdAt: loan.created_at,
    updatedAt: loan.updated_at,
  };
};

// Helper function to transform repayment data for Supabase
const transformRepaymentForSupabase = (repayment: any): any => {
  const transformed: any = {};
  
  const fieldMap: Record<string, string> = {
    'id': 'id',
    'organization_id': 'organization_id',
    'loanId': 'loan_id',
    'loan_id': 'loan_id',
    'amount': 'amount',
    'principalAmount': 'principal_amount',
    'principal_amount': 'principal_amount',
    'interestAmount': 'interest_amount',
    'interest_amount': 'interest_amount',
    'paymentDate': 'payment_date',
    'payment_date': 'payment_date',
    'paymentMethod': 'payment_method',
    'payment_method': 'payment_method',
    'receiptNumber': 'reference_number',
    'reference_number': 'reference_number',
    'notes': 'notes',
    'createdAt': 'created_at',
    'created_at': 'created_at',
    'updatedAt': 'updated_at',
    'updated_at': 'updated_at',
  };
  
  // Transform each field
  Object.keys(repayment).forEach(key => {
    // Skip fields that don't exist in Supabase schema
    if (key === 'loanNumber' || key === 'clientId' || key === 'clientName' ||
        key === 'receivedBy' || key === 'status' || key === 'approvedBy' ||
        key === 'approvedDate' || key === 'createdDate') {
      return; // Skip these fields
    }
    
    // Special handling for 'id' field - ensure it's always a valid UUID
    if (key === 'id') {
      transformed.id = ensureUUID(repayment[key]);
      return;
    }
    
    const mappedKey = fieldMap[key] || key;
    transformed[mappedKey] = repayment[key];
  });
  
  // Ensure id is always set to a valid UUID
  if (!transformed.id || !isValidUUID(transformed.id)) {
    transformed.id = generateUUID();
  }
  
  // Validate loan_id is a UUID - this is critical for foreign key constraint
  if (transformed.loan_id && !isValidUUID(transformed.loan_id)) {
    console.warn(`⚠️ Payment has invalid loan_id (not a UUID): ${transformed.loan_id}. Skipping loan_id field.`);
    delete transformed.loan_id;
  }
  
  // Convert empty strings to 0 for numeric fields to prevent PostgreSQL errors
  if (transformed.amount === undefined || transformed.amount === null || transformed.amount === '') {
    transformed.amount = 0;
  }
  if (transformed.principal_amount === undefined || transformed.principal_amount === null || transformed.principal_amount === '') {
    transformed.principal_amount = 0;
  }
  if (transformed.interest_amount === undefined || transformed.interest_amount === null || transformed.interest_amount === '') {
    transformed.interest_amount = 0;
  }
  
  // Convert empty strings to null for date fields to prevent PostgreSQL errors
  if (transformed.payment_date === '' || transformed.payment_date === undefined) {
    transformed.payment_date = null;
  }
  
  return transformed;
};

// Helper function to transform payroll run data for Supabase
const transformPayrollRunForSupabase = (payroll: any): any => {
  const transformed: any = {};
  
  const fieldMap: Record<string, string> = {
    'id': 'id',
    'organization_id': 'organization_id',
    'runId': 'run_id',
    'run_id': 'run_id',
    'month': 'month',
    'year': 'year',
    'totalGross': 'total_gross',
    'total_gross': 'total_gross',
    'totalDeductions': 'total_deductions',
    'total_deductions': 'total_deductions',
    'totalNet': 'total_net',
    'total_net': 'total_net',
    'status': 'status',
    'processedDate': 'processed_date',
    'processed_date': 'processed_date',
    'createdAt': 'created_at',
    'created_at': 'created_at',
    'updatedAt': 'updated_at',
    'updated_at': 'updated_at',
  };
  
  // Transform each field
  Object.keys(payroll).forEach(key => {
    // Skip fields that don't exist in Supabase schema
    if (key === 'employees' || key === 'processedBy' || key === 'createdBy') {
      return; // Skip these fields
    }
    
    const mappedKey = fieldMap[key] || key;
    transformed[mappedKey] = payroll[key];
  });
  
  // Convert empty strings to null for date fields to prevent PostgreSQL errors
  if (transformed.processed_date === '' || transformed.processed_date === undefined) {
    transformed.processed_date = null;
  }
  
  return transformed;
};

// Helper function to transform journal entry data for Supabase
const transformJournalEntryForSupabase = (entry: any): any => {
  const transformed: any = {};
  
  const fieldMap: Record<string, string> = {
    'id': 'id',
    'organization_id': 'organization_id',
    'entryId': 'entry_id',
    'entry_id': 'entry_id',
    'entryDate': 'entry_date',
    'entry_date': 'entry_date',
    'date': 'entry_date',
    'description': 'description',
    'account': 'account',
    'debit': 'debit',
    'credit': 'credit',
    'referenceType': 'reference_type',
    'reference_type': 'reference_type',
    'referenceId': 'reference_id',
    'reference_id': 'reference_id',
    'createdAt': 'created_at',
    'created_at': 'created_at',
    'updatedAt': 'updated_at',
    'updated_at': 'updated_at',
  };
  
  // Transform each field
  Object.keys(entry).forEach(key => {
    // Skip fields that don't exist in Supabase schema
    if (key === 'type' || key === 'createdBy' || key === 'isBalanced') {
      return; // Skip these fields
    }
    
    const mappedKey = fieldMap[key] || key;
    transformed[mappedKey] = entry[key];
  });
  
  // Convert empty strings to null for date fields to prevent PostgreSQL errors
  if (transformed.entry_date === '' || transformed.entry_date === undefined) {
    transformed.entry_date = null;
  }
  
  return transformed;
};

// Helper function to transform approval data for Supabase
const transformApprovalForSupabase = (approval: any): any => {
  const transformed: any = {};
  
  const fieldMap: Record<string, string> = {
    'id': 'id',
    'organization_id': 'organization_id',
    'loanId': 'loan_id',
    'loan_id': 'loan_id',
    'relatedId': 'loan_id',  // Map relatedId to loan_id (this stores the loan ID)
    'stage': 'stage',
    'approver': 'approver_name',
    'approverRole': 'approver_role',
    'approver_role': 'approver_role',
    'decision': 'decision',
    'comments': 'comments',
    'approvalDate': 'decision_date',
    'decision_date': 'decision_date',
    'requestDate': 'created_at',  // Map requestDate to created_at
    'createdAt': 'created_at',
    'created_at': 'created_at',
    'updatedAt': 'updated_at',
    'updated_at': 'updated_at',
  };
  
  // Transform each field
  Object.keys(approval).forEach(key => {
    // Skip fields that don't exist in Supabase schema
    if (key === 'amount' || key === 'clientName' || key === 'productName' || 
        key === 'submittedBy' || key === 'submittedDate' ||
        key === 'clientId' || key === 'client_id' || key === 'description' ||
        key === 'phase' || key === 'priority' || 
        key === 'type' || key === 'title' || key === 'requestedBy' || 
        key === 'rejectionReason') {
      return; // Skip these fields - they don't exist in approvals table
    }
    
    const mappedKey = fieldMap[key] || key;
    transformed[mappedKey] = approval[key];
  });
  
  // Set default stage if not provided
  if (!transformed.stage) {
    transformed.stage = 'Pending';
  }
  
  // Set default status if not provided
  if (!transformed.status) {
    transformed.status = approval.status || 'Pending';
  }
  
  // Set default approver_role if not provided
  if (!transformed.approver_role) {
    transformed.approver_role = 'Loan Officer';
  }
  
  // Convert empty strings to null for date fields to prevent PostgreSQL errors
  if (transformed.decision_date === '' || transformed.decision_date === undefined) {
    transformed.decision_date = null;
  }
  
  return transformed;
};

// Helper function to transform processing fee record for Supabase
const transformProcessingFeeRecordForSupabase = (record: any): any => {
  const transformed: any = {};
  
  const fieldMap: Record<string, string> = {
    'id': 'id',
    'organization_id': 'organization_id',
    'loanId': 'loan_id',
    'loan_id': 'loan_id',
    'amount': 'fee_amount',
    'recordedDate': 'collected_date',
    'paymentMethod': 'payment_method',
    'payment_method': 'payment_method',
    'createdAt': 'created_at',
    'created_at': 'created_at',
    'updatedAt': 'updated_at',
    'updated_at': 'updated_at',
  };
  
  // Transform each field
  Object.keys(record).forEach(key => {
    // Skip fields that don't exist in Supabase schema
    if (key === 'clientId' || key === 'clientName' || key === 'percentage' || 
        key === 'loanAmount' || key === 'recordedBy' || key === 'status' || 
        key === 'waivedBy' || key === 'waivedReason') {
      return; // Skip these fields - they don't exist in processing_fee_records table
    }
    
    const mappedKey = fieldMap[key] || key;
    transformed[mappedKey] = record[key];
  });
  
  // Set default payment method if not provided
  if (!transformed.payment_method) {
    transformed.payment_method = record.paymentMethod || 'Cash';
  }
  
  // Convert empty strings to null for date fields to prevent PostgreSQL errors
  if (transformed.collected_date === '' || transformed.collected_date === undefined) {
    transformed.collected_date = null;
  }
  
  return transformed;
};

// =============================================
// CLIENTS
// =============================================

export const fetchClients = async (): Promise<Client[]> => {
  // Check if Supabase is available
  const available = await isSupabaseAvailable();
  if (!available) {
    return [];
  }
  
  const orgId = getOrganizationId();
  
  // If no organization is set, return empty array
  if (!orgId) {
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', orgId);
    
    if (error) {
      // Silently return empty array if Supabase is not available
      return [];
    }
  
    // Transform from Supabase format to application format
    const clients = (data || []).map((dbClient: any) => ({
      ...dbClient,
      // Combine first_name and last_name into name
      name: dbClient.first_name && dbClient.last_name
        ? `${dbClient.first_name} ${dbClient.last_name}`.trim()
        : dbClient.first_name || dbClient.last_name || dbClient.group_name || 'Unknown',
      // Map other fields to match Client interface
      idNumber: dbClient.id_number || '',
      dateOfBirth: dbClient.date_of_birth || '',
      maritalStatus: dbClient.marital_status || '',
      monthlyIncome: dbClient.monthly_income || 0,
      creditScore: dbClient.credit_score || 0,
      joinDate: dbClient.created_at || new Date().toISOString(),
      createdBy: 'system',
      lastUpdated: dbClient.updated_at || new Date().toISOString(),
      status: dbClient.status === 'active' ? 'Active' : dbClient.status === 'inactive' ? 'Inactive' : 'Blacklisted',
      nextOfKin: {
        name: '',
        relationship: '',
        phone: ''
      }
    }));
    
    return clients;
  } catch (e) {
    // Silently fail if Supabase is not available
    return [];
  }
};

export const createClient = async (client: Client): Promise<boolean> => {
  const orgId = getOrganizationId();
  
  if (!orgId) {
    console.error('❌ Cannot create client: No organization ID');
    return false;
  }
  
  const transformedClient = transformClientForSupabase(client);
  
  console.log('📤 Creating client in Supabase:');
  console.log('📦 Full transformed client:', JSON.stringify({ ...transformedClient, organization_id: orgId }, null, 2));
  
  // Use upsert to handle both insert and update cases
  const { data, error } = await supabase
    .from('clients')
    .upsert(
      { ...transformedClient, organization_id: orgId },
      { 
        onConflict: 'id',
        ignoreDuplicates: false 
      }
    )
    .select();
  
  if (error) {
    console.error('❌ Error creating client:', error);
    console.error('❌ Failed client data:', JSON.stringify({ ...transformedClient, organization_id: orgId }, null, 2));
    return false;
  }
  console.log('✅ Client synced to Supabase:', client.id, data);
  return true;
};

export const updateClient = async (id: string, updates: Partial<Client>): Promise<boolean> => {
  const orgId = getOrganizationId();
  
  // For updates, we need to transform the fields but NOT set defaults for missing fields
  // Create a minimal transformation that only converts the fields that are present
  const transformedUpdates: any = {};
  
  // Map the fields that are present in the updates object
  if (updates.name !== undefined) {
    const nameParts = updates.name.trim().split(' ');
    transformedUpdates.first_name = nameParts[0];
    transformedUpdates.last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];
  }
  if (updates.email !== undefined) transformedUpdates.email = updates.email;
  if (updates.phone !== undefined) transformedUpdates.phone = updates.phone;
  if (updates.idNumber !== undefined) transformedUpdates.id_number = updates.idNumber;
  if (updates.address !== undefined) transformedUpdates.address = updates.address;
  if (updates.county !== undefined) transformedUpdates.county = updates.county;
  if (updates.occupation !== undefined) transformedUpdates.occupation = updates.occupation;
  if (updates.employer !== undefined) transformedUpdates.employer = updates.employer;
  if (updates.monthlyIncome !== undefined) transformedUpdates.monthly_income = updates.monthlyIncome;
  if (updates.dateOfBirth !== undefined) transformedUpdates.date_of_birth = updates.dateOfBirth;
  if (updates.gender !== undefined) transformedUpdates.gender = updates.gender;
  if (updates.maritalStatus !== undefined) transformedUpdates.marital_status = updates.maritalStatus;
  if (updates.status !== undefined) transformedUpdates.status = updates.status.toLowerCase();
  if (updates.riskRating !== undefined) transformedUpdates.risk_rating = updates.riskRating;
  // Skip credit_score - it doesn't exist in Supabase schema yet
  // if (updates.creditScore !== undefined) transformedUpdates.credit_score = updates.creditScore;
  
  // If no valid fields to update, return success (nothing to do)
  if (Object.keys(transformedUpdates).length === 0) {
    console.log('ℹ️ No valid fields to update in Supabase for client:', id);
    return true;
  }
  
  // Use UPDATE instead of upsert for partial updates
  const { error } = await supabase
    .from('clients')
    .update(transformedUpdates)
    .eq('id', id)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error updating client:', error);
    console.log('⚠️ Failed to sync client to Supabase');
    return false;
  }
  console.log('✅ Client updated in Supabase:', id);
  return true;
};

export const deleteClient = async (id: string): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error deleting client:', error);
    return false;
  }
  return true;
};

// =============================================
// LOANS
// =============================================

export const fetchLoans = async (): Promise<Loan[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) {
    return [];
  }
  
  // Fetch loans with client and product information via joins
  const { data, error } = await supabase
    .from('loans')
    .select(`
      *,
      clients:client_id (
        id,
        first_name,
        last_name
      ),
      loan_products:loan_product_id (
        id,
        name
      )
    `)
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently return empty array if Supabase is not available
    return [];
  }
  
  // Transform the data and add client/product names
  const transformedLoans = (data || []).map((loan: any) => {
    const transformed = transformLoanFromSupabase(loan);
    
    // Add client name from the joined data
    if (loan.clients) {
      transformed.clientName = `${loan.clients.first_name} ${loan.clients.last_name}`.trim();
    }
    
    // Add product name from the joined data
    if (loan.loan_products) {
      transformed.productName = loan.loan_products.name;
    }
    
    return transformed;
  });
  
  return transformedLoans;
};

export const createLoan = async (loan: Loan): Promise<boolean> => {
  const orgId = getOrganizationId();
  console.log('🔵 Creating loan in Supabase:', loan.id, 'org:', orgId);
  const transformedLoan = transformLoanForSupabase(loan);
  
  // Lookup client UUID if needed
  if (transformedLoan._needsClientLookup && loan.clientName) {
    console.log(`🔍 Looking up client UUID for: ${loan.clientName}`);
    const nameParts = loan.clientName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;
    
    const { data: clientData } = await supabase
      .from('clients')
      .select('id')
      .eq('organization_id', orgId)
      .eq('first_name', firstName)
      .eq('last_name', lastName)
      .single();
    
    if (clientData) {
      transformedLoan.client_id = clientData.id;
      console.log(`✅ Found client UUID: ${clientData.id}`);
      delete transformedLoan._needsClientLookup;
      delete transformedLoan._originalClientId;
    } else {
      console.error(`❌ Could not find client in Supabase: ${loan.clientName}`);
      delete transformedLoan.client_id;
      delete transformedLoan._needsClientLookup;
      delete transformedLoan._originalClientId;
    }
  }
  
  // Lookup loan product UUID if needed
  if (transformedLoan._needsProductLookup && loan.productName) {
    console.log(`🔍 Looking up loan product UUID for: ${loan.productName}`);
    const { data: productData } = await supabase
      .from('loan_products')
      .select('id')
      .eq('organization_id', orgId)
      .eq('name', loan.productName)
      .single();
    
    if (productData) {
      transformedLoan.loan_product_id = productData.id;
      console.log(`✅ Found loan product UUID: ${productData.id}`);
      delete transformedLoan._needsProductLookup;
      delete transformedLoan._originalProductId;
    } else {
      console.error(`❌ Could not find loan product in Supabase: ${loan.productName}`);
      delete transformedLoan.loan_product_id;
      delete transformedLoan._needsProductLookup;
      delete transformedLoan._originalProductId;
    }
  }
  
  // Clean up lookup flags
  delete transformedLoan._needsClientLookup;
  delete transformedLoan._needsProductLookup;
  delete transformedLoan._originalClientId;
  delete transformedLoan._originalProductId;
  
  // Validate that required fields are present
  if (!transformedLoan.client_id) {
    console.error('❌ Cannot create loan: client_id is required');
    return false;
  }
  
  if (!transformedLoan.loan_product_id) {
    console.error('❌ Cannot create loan: loan_product_id is required');
    return false;
  }
  
  // Validate that the loan product exists before creating the loan
  const { data: productExists } = await supabase
    .from('loan_products')
    .select('id')
    .eq('id', transformedLoan.loan_product_id)
    .eq('organization_id', orgId)
    .single();
  
  if (!productExists) {
    console.error('❌ Error creating loan: Loan product does not exist in Supabase. Please create the loan product first.');
    return false;
  }
  
  // Validate that the client exists
  const { data: clientExists } = await supabase
    .from('clients')
    .select('id')
    .eq('id', transformedLoan.client_id)
    .eq('organization_id', orgId)
    .single();
  
  if (!clientExists) {
    console.error('❌ Error creating loan: Client does not exist in Supabase. Please create the client first.');
    return false;
  }
  
  const { error } = await supabase
    .from('loans')
    .insert({ ...transformedLoan, organization_id: orgId });
  
  if (error) {
    console.error('❌ Error creating loan:', error);
    return false;
  }
  console.log('✅ Loan created successfully in Supabase:', loan.id);
  return true;
};

export const updateLoan = async (id: string, updates: Partial<Loan>): Promise<boolean> => {
  const orgId = getOrganizationId();
  const transformedUpdates = transformLoanForSupabase(updates);
  
  // Remove internal flags that shouldn't be sent to database
  delete transformedUpdates._needsClientLookup;
  delete transformedUpdates._originalClientId;
  delete transformedUpdates._needsProductLookup;
  delete transformedUpdates._originalProductId;
  
  const { error } = await supabase
    .from('loans')
    .update(transformedUpdates)
    .eq('id', id)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error updating loan:', error);
    return false;
  }
  return true;
};

export const deleteLoan = async (id: string): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('loans')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error deleting loan:', error);
    return false;
  }
  return true;
};

// =============================================
// LOAN PRODUCTS
// =============================================

// Helper function to transform loan product data from Supabase (snake_case) to UI format (camelCase)
const transformLoanProductFromSupabase = (product: any): any => {
  return {
    id: product.id,
    name: product.name,  // ✅ Database column is 'name' not 'product_name'
    description: product.description || 'No description',
    minAmount: product.min_amount || 0,
    maxAmount: product.max_amount || 0,
    minTenor: product.min_term || 1,  // ✅ Database column is 'min_term' not 'min_duration_months'
    maxTenor: product.max_term || 12,  // ✅ Database column is 'max_term' not 'max_duration_months'
    interestRate: product.interest_rate || 0,
    interestType: product.interest_method ? 
      (product.interest_method === 'flat' ? 'Flat' : 
       product.interest_method === 'reducing_balance' ? 'Declining' : 
       product.interest_method === 'compound' ? 'Compound' : 'Flat') : 'Flat',
    repaymentFrequency: product.repayment_frequency ? 
      product.repayment_frequency.charAt(0).toUpperCase() + product.repayment_frequency.slice(1) : 'Monthly',
    processingFee: product.processing_fee_fixed || 0,
    insuranceFee: product.insurance_fee_fixed || 0,
    processingFeePercentage: product.processing_fee_percentage || 0,
    guarantorRequired: product.guarantor_required || false,
    collateralRequired: product.collateral_required || false,
    status: product.status && product.status.charAt(0).toUpperCase() + product.status.slice(1) || 'Active',  // Capitalize status
    createdDate: product.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    lastUpdated: product.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
  };
};

export const fetchLoanProducts = async (): Promise<LoanProduct[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) {
    // Silently return empty array - this is expected during initialization
    return [];
  }
  
  const { data, error } = await supabase
    .from('loan_products')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  
  // Transform the data from Supabase format to UI format
  const transformedProducts = (data || []).map(transformLoanProductFromSupabase);
  return transformedProducts;
};

export const createLoanProduct = async (product: LoanProduct): Promise<boolean> => {
  const orgId = getOrganizationId();
  
  if (!orgId) {
    console.error('❌ Cannot create loan product: No organization ID');
    return false;
  }
  
  const transformedProduct = transformLoanProductForSupabase(product);
  
  console.log('📤 Creating loan product in Supabase:');
  console.log('📦 Full transformed product:', JSON.stringify({ ...transformedProduct, organization_id: orgId }, null, 2));
  
  const { data, error } = await supabase
    .from('loan_products')
    .insert({ ...transformedProduct, organization_id: orgId })
    .select();
  
  if (error) {
    console.error('❌ Error creating loan product:', error);
    console.error('❌ Failed product data:', JSON.stringify({ ...transformedProduct, organization_id: orgId }, null, 2));
    return false;
  }
  
  console.log('✅ Loan product created successfully in Supabase:', data);
  return true;
};

export const updateLoanProduct = async (id: string, updates: Partial<LoanProduct>): Promise<boolean> => {
  const orgId = getOrganizationId();
  const transformedUpdates = transformLoanProductForSupabase(updates);
  const { error } = await supabase
    .from('loan_products')
    .update(transformedUpdates)
    .eq('id', id)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error updating loan product:', error);
    return false;
  }
  return true;
};

export const deleteLoanProduct = async (id: string): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('loan_products')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error deleting loan product:', error);
    return false;
  }
  return true;
};

// =============================================
// REPAYMENTS / PAYMENTS
// =============================================

export const fetchRepayments = async (): Promise<Repayment[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  // Payments table doesn't have organization_id, so we need to join with loans
  const { data: loans, error: loansError } = await supabase
    .from('loans')
    .select('id')
    .eq('organization_id', orgId);
  
  if (loansError || !loans) {
    // Silently fail if Supabase is not available
    return [];
  }
  
  const loanIds = loans.map(l => l.id);
  
  // If no loans exist, silently return empty array (this is normal for new organizations)
  if (loanIds.length === 0) {
    return [];
  }
  
  // Validate that all loan IDs are valid UUIDs before querying
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const validLoanIds = loanIds.filter(id => uuidPattern.test(id));
  
  // If no valid UUID loan IDs found, just return empty (no need to warn - this is expected during initial setup)
  if (validLoanIds.length === 0) {
    return [];
  }
  
  // Silently filter out invalid loan IDs - this is normal during development
  
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .in('loan_id', validLoanIds);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createRepayment = async (repayment: Repayment): Promise<boolean> => {
  const transformedRepayment = transformRepaymentForSupabase(repayment);
  
  // Validate that loan_id is a valid UUID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (transformedRepayment.loan_id && !uuidPattern.test(transformedRepayment.loan_id)) {
    console.error('❌ Invalid loan_id format. Expected UUID but got:', transformedRepayment.loan_id);
    console.warn('⚠️ Skipping payment creation - loan_id must be a valid UUID from Supabase loans table');
    return false;
  }
  
  const { error } = await supabase
    .from('payments')
    .insert(transformedRepayment);
  
  if (error) {
    console.error('Error creating payment:', error);
    return false;
  }
  return true;
};

// =============================================
// SAVINGS ACCOUNTS
// =============================================

export const fetchSavingsAccounts = async (): Promise<SavingsAccount[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('savings_accounts')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createSavingsAccount = async (account: SavingsAccount): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('savings_accounts')
    .insert({ ...account, organization_id: orgId });
  
  if (error) {
    console.error('Error creating savings account:', error);
    return false;
  }
  return true;
};

export const updateSavingsAccount = async (id: string, updates: Partial<SavingsAccount>): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('savings_accounts')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error updating savings account:', error);
    return false;
  }
  return true;
};

// =============================================
// SAVINGS TRANSACTIONS
// =============================================

export const fetchSavingsTransactions = async (): Promise<SavingsTransaction[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('savings_transactions')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createSavingsTransaction = async (transaction: SavingsTransaction): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('savings_transactions')
    .insert({ ...transaction, organization_id: orgId });
  
  if (error) {
    console.error('Error creating savings transaction:', error);
    return false;
  }
  return true;
};

// =============================================
// SHAREHOLDERS
// =============================================

export const fetchShareholders = async (): Promise<Shareholder[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('shareholders')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createShareholder = async (shareholder: Shareholder): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('shareholders')
    .insert({ ...shareholder, organization_id: orgId });
  
  if (error) {
    console.error('Error creating shareholder:', error);
    return false;
  }
  return true;
};

export const updateShareholder = async (shareholderId: string, updates: Partial<Shareholder>): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('shareholders')
    .update(updates)
    .eq('shareholder_id', shareholderId)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error updating shareholder:', error);
    return false;
  }
  return true;
};

// =============================================
// SHAREHOLDER TRANSACTIONS
// =============================================

export const fetchShareholderTransactions = async (): Promise<ShareholderTransaction[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('shareholder_transactions')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createShareholderTransaction = async (transaction: ShareholderTransaction): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('shareholder_transactions')
    .insert({ ...transaction, organization_id: orgId });
  
  if (error) {
    console.error('Error creating shareholder transaction:', error);
    return false;
  }
  return true;
};

// =============================================
// EXPENSES
// =============================================

export const fetchExpenses = async (): Promise<Expense[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createExpense = async (expense: Expense): Promise<boolean> => {
  const orgId = getOrganizationId();
  
  // Map frontend expense fields to database schema
  const dbExpense = {
    expense_id: expense.id,
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    payee_id: expense.payeeId || null,
    payment_method: expense.paymentMethod,
    payment_date: expense.expenseDate,
    status: expense.status,
    organization_id: orgId
  };
  
  const { error } = await supabase
    .from('expenses')
    .insert(dbExpense);
  
  if (error) {
    console.error('Error creating expense:', error);
    return false;
  }
  return true;
};

export const updateExpense = async (expenseId: string, updates: Partial<Expense>): Promise<boolean> => {
  const orgId = getOrganizationId();
  
  // Map frontend expense fields to database schema
  const dbUpdates: any = {};
  
  if (updates.category) dbUpdates.category = updates.category;
  if (updates.description) dbUpdates.description = updates.description;
  if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
  if (updates.payeeId !== undefined) dbUpdates.payee_id = updates.payeeId;
  if (updates.paymentMethod) dbUpdates.payment_method = updates.paymentMethod;
  if (updates.expenseDate) dbUpdates.payment_date = updates.expenseDate;
  if (updates.status) dbUpdates.status = updates.status;
  
  const { error } = await supabase
    .from('expenses')
    .update(dbUpdates)
    .eq('expense_id', expenseId)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error updating expense:', error);
    return false;
  }
  return true;
};

// =============================================
// PAYEES
// =============================================

export const fetchPayees = async (): Promise<Payee[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('payees')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createPayee = async (payee: Payee): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('payees')
    .insert({ ...payee, organization_id: orgId });
  
  if (error) {
    console.error('Error creating payee:', error);
    return false;
  }
  return true;
};

export const updatePayee = async (id: string, updates: Partial<Payee>): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('payees')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error updating payee:', error);
    return false;
  }
  return true;
};

// =============================================
// BANK ACCOUNTS
// =============================================

export const fetchBankAccounts = async (): Promise<BankAccount[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createBankAccount = async (account: BankAccount): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('bank_accounts')
    .insert({ ...account, organization_id: orgId });
  
  if (error) {
    console.error('Error creating bank account:', error);
    return false;
  }
  return true;
};

export const updateBankAccount = async (id: string, updates: Partial<BankAccount>): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('bank_accounts')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error updating bank account:', error);
    return false;
  }
  return true;
};

// =============================================
// TASKS
// =============================================

export const fetchTasks = async (): Promise<Task[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createTask = async (task: Task): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('tasks')
    .insert({ ...task, organization_id: orgId });
  
  if (error) {
    console.error('Error creating task:', error);
    return false;
  }
  return true;
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error updating task:', error);
    return false;
  }
  return true;
};

// =============================================
// KYC RECORDS
// =============================================

export const fetchKYCRecords = async (): Promise<KYCRecord[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('kyc_records')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createKYCRecord = async (record: KYCRecord): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('kyc_records')
    .insert({ ...record, organization_id: orgId });
  
  if (error) {
    console.error('Error creating KYC record:', error);
    return false;
  }
  return true;
};

export const updateKYCRecord = async (id: string, updates: Partial<KYCRecord>): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('kyc_records')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error updating KYC record:', error);
    return false;
  }
  return true;
};

// =============================================
// APPROVALS
// =============================================

export const fetchApprovals = async (): Promise<Approval[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('approvals')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createApproval = async (approval: Approval): Promise<boolean> => {
  const orgId = getOrganizationId();
  const transformedApproval = transformApprovalForSupabase(approval);
  
  // Lookup loan UUID if loan_id is not a valid UUID
  if (transformedApproval.loan_id && !isValidUUID(transformedApproval.loan_id)) {
    console.log(`🔍 Looking up loan UUID for approval: ${transformedApproval.loan_id}`);
    
    // Try to find the loan in Supabase
    const { data: loanData } = await supabase
      .from('loans')
      .select('id')
      .eq('organization_id', orgId)
      .limit(1)
      .single();
    
    if (loanData) {
      transformedApproval.loan_id = loanData.id;
      console.log(`✅ Found loan UUID for approval: ${loanData.id}`);
    } else {
      console.warn(`⚠️ Could not find loan in Supabase, skipping approval sync`);
      return false; // Don't create approval if loan doesn't exist
    }
  }
  
  const { error } = await supabase
    .from('approvals')
    .insert({ ...transformedApproval, organization_id: orgId });
  
  if (error) {
    console.error('Error creating approval:', error);
    return false;
  }
  return true;
};

export const updateApproval = async (id: string, updates: Partial<Approval>): Promise<boolean> => {
  const orgId = getOrganizationId();
  const transformedUpdates = transformApprovalForSupabase(updates);
  const { error } = await supabase
    .from('approvals')
    .update(transformedUpdates)
    .eq('id', id)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error updating approval:', error);
    return false;
  }
  return true;
};

// =============================================
// FUNDING TRANSACTIONS
// =============================================

export const fetchFundingTransactions = async (): Promise<FundingTransaction[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('funding_transactions')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createFundingTransaction = async (transaction: FundingTransaction): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('funding_transactions')
    .insert({ ...transaction, organization_id: orgId });
  
  if (error) {
    console.error('Error creating funding transaction:', error);
    return false;
  }
  return true;
};

// =============================================
// PROCESSING FEE RECORDS
// =============================================

export const fetchProcessingFeeRecords = async (): Promise<ProcessingFeeRecord[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('processing_fee_records')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createProcessingFeeRecord = async (record: ProcessingFeeRecord): Promise<boolean> => {
  const orgId = getOrganizationId();
  const transformedRecord = transformProcessingFeeRecordForSupabase(record);
  
  // Lookup loan UUID if loan_id is not a valid UUID
  if (transformedRecord.loan_id && !isValidUUID(transformedRecord.loan_id)) {
    console.log(`🔍 Looking up loan UUID for processing fee: ${transformedRecord.loan_id}`);
    
    // Try to find the loan in Supabase
    const { data: loanData } = await supabase
      .from('loans')
      .select('id')
      .eq('organization_id', orgId)
      .limit(1)
      .single();
    
    if (loanData) {
      transformedRecord.loan_id = loanData.id;
      console.log(`✅ Found loan UUID for processing fee: ${loanData.id}`);
    } else {
      console.warn(`⚠️ Could not find loan in Supabase, skipping processing fee sync`);
      return false; // Don't create processing fee if loan doesn't exist
    }
  }
  
  const { error } = await supabase
    .from('processing_fee_records')
    .insert({ ...transformedRecord, organization_id: orgId });
  
  if (error) {
    console.error('Error creating processing fee record:', error);
    return false;
  }
  return true;
};

// =============================================
// DISBURSEMENTS
// =============================================

export const fetchDisbursements = async (): Promise<Disbursement[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('disbursements')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createDisbursement = async (disbursement: Disbursement): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('disbursements')
    .insert({ ...disbursement, organization_id: orgId });
  
  if (error) {
    console.error('Error creating disbursement:', error);
    return false;
  }
  return true;
};

// =============================================
// PAYROLL RUNS
// =============================================

export const fetchPayrollRuns = async (): Promise<PayrollRun[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createPayrollRun = async (run: PayrollRun): Promise<boolean> => {
  const orgId = getOrganizationId();
  const transformedRun = transformPayrollRunForSupabase(run);
  const { error } = await supabase
    .from('payroll_runs')
    .insert({ ...transformedRun, organization_id: orgId });
  
  if (error) {
    console.error('Error creating payroll run:', error);
    return false;
  }
  return true;
};

export const updatePayrollRun = async (runId: string, updates: Partial<PayrollRun>): Promise<boolean> => {
  const orgId = getOrganizationId();
  const transformedUpdates = transformPayrollRunForSupabase(updates);
  const { error } = await supabase
    .from('payroll_runs')
    .update(transformedUpdates)
    .eq('run_id', runId)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error updating payroll run:', error);
    return false;
  }
  return true;
};

// =============================================
// JOURNAL ENTRIES
// =============================================

export const fetchJournalEntries = async (): Promise<JournalEntry[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createJournalEntry = async (entry: JournalEntry): Promise<boolean> => {
  const orgId = getOrganizationId();
  const transformedEntry = transformJournalEntryForSupabase(entry);
  const { error } = await supabase
    .from('journal_entries')
    .insert({ ...transformedEntry, organization_id: orgId });
  
  if (error) {
    console.error('Error creating journal entry:', error);
    return false;
  }
  return true;
};

// =============================================
// AUDIT LOGS
// =============================================

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('organization_id', orgId)
    .order('timestamp', { ascending: false })
    .limit(1000);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  
  // Map database fields to DataContext format
  return (data || []).map((row: any) => {
    const details = row.details ? JSON.parse(row.details) : {};
    return {
      id: row.id,
      timestamp: row.timestamp,
      userId: details.userId || '',
      userName: row.performed_by,
      action: row.action,
      module: details.module || '',
      entityType: row.entity_type,
      entityId: row.entity_id,
      changes: details.changes || '',
      ipAddress: details.ipAddress || '',
      status: details.status || 'Success'
    };
  });
};

export const createAuditLog = async (log: AuditLog): Promise<boolean> => {
  const orgId = getOrganizationId();
  
  // Map DataContext format to database format
  const dbLog = {
    id: log.id,
    organization_id: orgId,
    performed_by: log.userName,
    action: log.action,
    entity_type: log.entityType,
    entity_id: log.entityId,
    timestamp: log.timestamp,
    details: JSON.stringify({
      userId: log.userId,
      module: log.module,
      changes: log.changes,
      ipAddress: log.ipAddress,
      status: log.status
    })
  };
  
  const { error } = await supabase
    .from('audit_logs')
    .insert(dbLog);
  
  if (error) {
    console.error('Error creating audit log:', error);
    return false;
  }
  return true;
};

// =============================================
// TICKETS
// =============================================

export const fetchTickets = async (): Promise<Ticket[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createTicket = async (ticket: Ticket): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('tickets')
    .insert({ ...ticket, organization_id: orgId });
  
  if (error) {
    console.error('Error creating ticket:', error);
    return false;
  }
  return true;
};

export const updateTicket = async (ticketId: string, updates: Partial<Ticket>): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('ticket_id', ticketId)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error updating ticket:', error);
    return false;
  }
  return true;
};

// =============================================
// GROUPS
// =============================================

export const fetchGroups = async (): Promise<Group[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createGroup = async (group: Group): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('groups')
    .insert({ ...group, organization_id: orgId });
  
  if (error) {
    console.error('Error creating group:', error);
    return false;
  }
  return true;
};

export const updateGroup = async (groupId: string, updates: Partial<Group>): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('groups')
    .update(updates)
    .eq('group_id', groupId)
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error updating group:', error);
    return false;
  }
  return true;
};

// =============================================
// GUARANTORS
// =============================================

export const fetchGuarantors = async (): Promise<Guarantor[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('guarantors')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createGuarantor = async (guarantor: Guarantor): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('guarantors')
    .insert({ ...guarantor, organization_id: orgId });
  
  if (error) {
    console.error('Error creating guarantor:', error);
    return false;
  }
  return true;
};

// =============================================
// COLLATERALS
// =============================================

export const fetchCollaterals = async (): Promise<Collateral[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('collaterals')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createCollateral = async (collateral: Collateral): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('collaterals')
    .insert({ ...collateral, organization_id: orgId });
  
  if (error) {
    console.error('Error creating collateral:', error);
    return false;
  }
  return true;
};

// =============================================
// LOAN DOCUMENTS
// =============================================

export const fetchLoanDocuments = async (): Promise<LoanDocument[]> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return [];
  
  const { data, error } = await supabase
    .from('loan_documents')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    // Silently fail if Supabase is not available
    return [];
  }
  return data || [];
};

export const createLoanDocument = async (document: LoanDocument): Promise<boolean> => {
  const orgId = getOrganizationId();
  const { error } = await supabase
    .from('loan_documents')
    .insert({ ...document, organization_id: orgId });
  
  if (error) {
    console.error('Error creating loan document:', error);
    return false;
  }
  return true;
};

// =============================================
// BULK OPERATIONS
// =============================================

export const syncAllDataToSupabase = async (data: any): Promise<boolean> => {
  const orgId = getOrganizationId();
  
  try {
    // Batch insert all data types
    const operations = [];
    
    if (data.clients?.length > 0) {
      operations.push(
        supabase.from('clients').upsert(
          data.clients.map((c: Client) => ({ ...c, organization_id: orgId }))
        )
      );
    }
    
    if (data.loans?.length > 0) {
      // Filter and transform loans, excluding those with invalid foreign keys
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const transformedLoans = data.loans
        .map((l: Loan) => ({ ...transformLoanForSupabase(l), organization_id: orgId }))
        .filter((l: any) => {
          // Skip loans without valid client_id or loan_product_id
          if (!l.client_id || !l.loan_product_id) {
            console.warn(`⚠️ Skipping loan without required foreign keys. Client ID: ${l.client_id}, Product ID: ${l.loan_product_id}`);
            return false;
          }
          return true;
        });
      
      if (transformedLoans.length > 0) {
        console.log(`📤 Syncing ${transformedLoans.length} loans to Supabase (${data.loans.length - transformedLoans.length} skipped due to invalid foreign keys)`);
        operations.push(
          supabase.from('loans').upsert(transformedLoans)
        );
      } else if (data.loans.length > 0) {
        console.warn(`⚠️ All ${data.loans.length} loans were skipped - they may have local IDs that haven't been mapped to Supabase UUIDs yet.`);
      }
    }
    
    if (data.loanProducts?.length > 0) {
      operations.push(
        supabase.from('loan_products').upsert(
          data.loanProducts.map((p: LoanProduct) => ({
            ...transformLoanProductForSupabase(p),
            organization_id: orgId
          }))
        )
      );
    }
    
    if (data.repayments?.length > 0) {
      // Validate loan_ids before upserting payments
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validRepayments = data.repayments
        .map((r: Repayment) => transformRepaymentForSupabase(r))
        .filter((r: any) => {
          if (r.loan_id && !uuidPattern.test(r.loan_id)) {
            console.warn(`⚠️ Skipping payment with invalid loan_id: ${r.loan_id}`);
            return false;
          }
          return true;
        });
      
      if (validRepayments.length > 0) {
        operations.push(
          supabase.from('payments').upsert(validRepayments)
        );
      }
    }
    
    if (data.savingsAccounts?.length > 0) {
      operations.push(
        supabase.from('savings_accounts').upsert(
          data.savingsAccounts.map((s: SavingsAccount) => ({ ...s, organization_id: orgId }))
        )
      );
    }
    
    if (data.savingsTransactions?.length > 0) {
      operations.push(
        supabase.from('savings_transactions').upsert(
          data.savingsTransactions.map((t: SavingsTransaction) => ({ ...t, organization_id: orgId }))
        )
      );
    }
    
    // Execute all operations
    await Promise.all(operations);
    
    console.log('✅ All data synced to Supabase successfully');
    return true;
  } catch (error) {
    console.error('❌ Error syncing data to Supabase:', error);
    return false;
  }
};

// =============================================
// CLEANUP UTILITIES
// =============================================

/**
 * Removes loans with invalid (non-UUID) IDs from Supabase.
 * This cleanup is needed when loans were inserted with local IDs like "L001" instead of UUIDs.
 */
export const cleanupInvalidLoans = async (): Promise<void> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return;
  
  try {
    // Fetch all loans for this organization
    const { data: loans, error: fetchError } = await supabase
      .from('loans')
      .select('id')
      .eq('organization_id', orgId);
    
    if (fetchError || !loans) {
      // Silently fail if Supabase is not available
      return;
    }
    
    if (loans.length === 0) return;
    
    // Identify loans with invalid (non-UUID) IDs
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidLoanIds = loans
      .filter(loan => !uuidPattern.test(loan.id))
      .map(loan => loan.id);
    
    if (invalidLoanIds.length === 0) {
      console.log('✅ No invalid loan IDs found - database is clean');
      return;
    }
    
    console.log(`🧹 Cleaning up ${invalidLoanIds.length} loans with invalid IDs:`, invalidLoanIds);
    
    // Delete loans with invalid IDs
    const { error: deleteError } = await supabase
      .from('loans')
      .delete()
      .in('id', invalidLoanIds)
      .eq('organization_id', orgId);
    
    if (deleteError) {
      console.error('Error deleting invalid loans:', deleteError);
    } else {
      console.log(`✅ Successfully removed ${invalidLoanIds.length} loans with invalid IDs`);
      console.log('💡 Tip: Re-sync your data to create these loans with proper UUIDs');
    }
  } catch (error) {
    console.error('Error during loan cleanup:', error);
  }
};

/**
 * Removes clients with invalid (non-UUID) IDs from Supabase.
 * This cleanup is needed when clients were inserted with local IDs like "C001" instead of UUIDs.
 */
export const cleanupInvalidClients = async (): Promise<void> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return;
  
  try {
    // Fetch all clients for this organization
    const { data: clients, error: fetchError } = await supabase
      .from('clients')
      .select('id')
      .eq('organization_id', orgId);
    
    if (fetchError || !clients) {
      // Silently fail if Supabase is not available
      return;
    }
    
    if (clients.length === 0) return;
    
    // Identify clients with invalid (non-UUID) IDs
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidClientIds = clients
      .filter(client => !uuidPattern.test(client.id))
      .map(client => client.id);
    
    if (invalidClientIds.length === 0) {
      console.log('✅ No invalid client IDs found - database is clean');
      return;
    }
    
    console.log(`🧹 Cleaning up ${invalidClientIds.length} clients with invalid IDs:`, invalidClientIds);
    
    // Delete clients with invalid IDs
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .in('id', invalidClientIds)
      .eq('organization_id', orgId);
    
    if (deleteError) {
      console.error('Error deleting invalid clients:', deleteError);
    } else {
      console.log(`✅ Successfully removed ${invalidClientIds.length} clients with invalid IDs`);
    }
  } catch (error) {
    console.error('Error during client cleanup:', error);
  }
};

/**
 * Removes loan products with invalid (non-UUID) IDs from Supabase.
 * This cleanup is needed when loan products were inserted with local IDs like "P001" instead of UUIDs.
 */
export const cleanupInvalidLoanProducts = async (): Promise<void> => {
  const orgId = getOrganizationId();
  
  if (!orgId) return;
  
  try {
    // Fetch all loan products for this organization
    const { data: loanProducts, error: fetchError } = await supabase
      .from('loan_products')
      .select('id')
      .eq('organization_id', orgId);
    
    if (fetchError || !loanProducts) {
      // Silently fail if Supabase is not available
      return;
    }
    
    if (loanProducts.length === 0) return;
    
    // Identify loan products with invalid (non-UUID) IDs
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidProductIds = loanProducts
      .filter(product => !uuidPattern.test(product.id))
      .map(product => product.id);
    
    if (invalidProductIds.length === 0) {
      console.log('✅ No invalid loan product IDs found - database is clean');
      return;
    }
    
    console.log(`🧹 Cleaning up ${invalidProductIds.length} loan products with invalid IDs:`, invalidProductIds);
    
    // Delete loan products with invalid IDs
    const { error: deleteError } = await supabase
      .from('loan_products')
      .delete()
      .in('id', invalidProductIds)
      .eq('organization_id', orgId);
    
    if (deleteError) {
      console.error('Error deleting invalid loan products:', deleteError);
    } else {
      console.log(`✅ Successfully removed ${invalidProductIds.length} loan products with invalid IDs`);
    }
  } catch (error) {
    console.error('Error during loan product cleanup:', error);
  }
};

/**
 * Master cleanup function that removes all invalid records from Supabase.
 * Should be run on app initialization to ensure data integrity.
 */
export const cleanupAllInvalidRecords = async (): Promise<void> => {
  console.log('🧹 Starting database cleanup for invalid records...');
  
  // Run cleanups in sequence to avoid conflicts
  await cleanupInvalidClients();
  await cleanupInvalidLoanProducts();
  await cleanupInvalidLoans();
  
  console.log('✅ Database cleanup completed');
};