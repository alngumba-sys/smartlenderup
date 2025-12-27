import { supabase } from './supabase';
import { toast } from 'sonner@2.0.3';
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
  Collateral,
  LoanDocument
} from '../contexts/DataContext';

// Get the current organization ID from localStorage
const getOrganizationId = (): string => {
  const orgData = localStorage.getItem('current_organization');
  if (orgData) {
    const org = JSON.parse(orgData);
    return org.id || 'default';
  }
  return 'default';
};

// Helper function to transform client data from camelCase to snake_case for Supabase
const transformClientForSupabase = (client: any): any => {
  const transformed: any = {};
  
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
    
    const mappedKey = fieldMap[key] || key;
    transformed[mappedKey] = client[key];
  });
  
  // Ensure required fields have values
  if (!transformed.first_name) {
    transformed.first_name = 'Unknown';
  }
  if (!transformed.last_name) {
    transformed.last_name = 'Unknown';
  }
  if (!transformed.id_number) {
    transformed.id_number = 'N/A';
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
  if (transformed.number_of_dependents === undefined || transformed.number_of_dependents === null) {
    transformed.number_of_dependents = 0;
  }
  if (transformed.monthly_income === undefined || transformed.monthly_income === null) {
    transformed.monthly_income = 0;
  }
  if (transformed.other_income === undefined || transformed.other_income === null) {
    transformed.other_income = 0;
  }
  if (!transformed.kyc_status) {
    transformed.kyc_status = 'Pending';
  }
  if (!transformed.risk_rating) {
    transformed.risk_rating = 'Medium';
  }
  if (!transformed.status) {
    transformed.status = 'Active';
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
    'name': 'name',
    'description': 'description',
    'minAmount': 'min_amount',
    'maxAmount': 'max_amount',
    'minTerm': 'min_term',
    'maxTerm': 'max_term',
    'interestRate': 'interest_rate',
    // processingFee is a fixed amount in the UI, but DB only has processing_fee_percentage
    // We'll skip processingFee for now since we're using it as a fixed amount
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
    'processing_fee_percentage': 'processing_fee_percentage',
    'guarantor_required': 'guarantor_required',
    'collateral_required': 'collateral_required',
    'created_at': 'created_at',
    'updated_at': 'updated_at',
  };
  
  // Transform each field
  Object.keys(product).forEach(key => {
    // Skip fields that don't exist in Supabase schema
    if (key === 'defaultAmount' || key === 'defaultTerm' || key === 'termUnit' || 
        key === 'repaymentFrequency' || key === 'insuranceFeeType' || key === 'gracePeriod' ||
        key === 'product_name' || key === 'product_code' || key === 'min_duration_months' || 
        key === 'max_duration_months' || key === 'interest_method' || key === 'processing_fee_type' ||
        key === 'processing_fee_fixed' || key === 'insurance_fee_percentage' || 
        key === 'late_payment_penalty_percentage' || key === 'number_of_guarantors' ||
        key === 'interestType' || key === 'processingFeeType' || key === 'insuranceFee' || 
        key === 'penaltyRate' || key === 'maxTenor' || key === 'minTenor' || key === 'tenorMonths' ||
        key === 'processingFee') { // Skip processingFee since we're using it as a fixed amount
      return; // Skip these fields
    }
    
    const mappedKey = fieldMap[key] || key;
    transformed[mappedKey] = product[key];
  });
  
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
    transformed.name = 'Unnamed Product';
  }
  if (!transformed.description) {
    transformed.description = 'No description';
  }
  if (transformed.min_amount === undefined || transformed.min_amount === null) {
    transformed.min_amount = 0;
  }
  if (transformed.max_amount === undefined || transformed.max_amount === null) {
    transformed.max_amount = 10000000;
  }
  if (transformed.min_term === undefined || transformed.min_term === null) {
    transformed.min_term = 1;
  }
  if (transformed.max_term === undefined || transformed.max_term === null) {
    transformed.max_term = 60;
  }
  if (transformed.interest_rate === undefined || transformed.interest_rate === null) {
    transformed.interest_rate = 0;
  }
  if (transformed.processing_fee_percentage === undefined || transformed.processing_fee_percentage === null) {
    transformed.processing_fee_percentage = 0;
  }
  if (transformed.guarantor_required === undefined || transformed.guarantor_required === null) {
    transformed.guarantor_required = false;
  }
  if (transformed.collateral_required === undefined || transformed.collateral_required === null) {
    transformed.collateral_required = false;
  }
  if (!transformed.status) {
    transformed.status = 'Active';
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
    
    const mappedKey = fieldMap[key] || key;
    transformed[mappedKey] = loan[key];
  });
  
  // Ensure required fields have default values
  if (!transformed.payment_method) {
    transformed.payment_method = 'Cash';
  }
  
  return transformed;
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
    
    const mappedKey = fieldMap[key] || key;
    transformed[mappedKey] = repayment[key];
  });
  
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
  
  return transformed;
};

// =============================================
// CLIENTS
// =============================================

export const fetchClients = async (): Promise<Client[]> => {
  const orgId = getOrganizationId();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
  return data || [];
};

export const createClient = async (client: Client): Promise<boolean> => {
  const orgId = getOrganizationId();
  const transformedClient = transformClientForSupabase(client);
  
  // Use insert for creating new clients
  const { error } = await supabase
    .from('clients')
    .insert({ ...transformedClient, organization_id: orgId });
  
  if (error) {
    console.error('Error creating client:', error);
    return false;
  }
  console.log('✅ Client synced to Supabase:', client.id);
  return true;
};

export const updateClient = async (id: string, updates: Partial<Client>): Promise<boolean> => {
  const orgId = getOrganizationId();
  const transformedUpdates = transformClientForSupabase(updates);
  
  // Try to update first
  const { data: existingClient, error: fetchError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();
  
  if (fetchError || !existingClient) {
    // Client doesn't exist in Supabase - skip update silently
    // This is normal when updating locally-created clients before they're synced
    console.log('⚠️ Client not found in Supabase, skipping update:', id);
    return true; // Return true to not block the UI
  }
  
  // Client exists, perform the update
  const { error: updateError } = await supabase
    .from('clients')
    .update(transformedUpdates)
    .eq('id', id)
    .eq('organization_id', orgId);
  
  if (updateError) {
    console.error('Error updating client:', updateError);
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
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching loans:', error);
    return [];
  }
  return data || [];
};

export const createLoan = async (loan: Loan): Promise<boolean> => {
  const orgId = getOrganizationId();
  console.log('🔵 Creating loan in Supabase:', loan.id, 'org:', orgId);
  const transformedLoan = transformLoanForSupabase(loan);
  
  // Validate that the loan product exists before creating the loan
  if (transformedLoan.loan_product_id) {
    const { data: productExists } = await supabase
      .from('loan_products')
      .select('id')
      .eq('id', transformedLoan.loan_product_id)
      .eq('organization_id', orgId)
      .single();
    
    if (!productExists) {
      console.error('❌ Error creating loan: Loan product does not exist in Supabase. Please create the loan product first.');
      toast.error('Loan Product Missing', {
        description: 'The selected loan product does not exist in the database yet. Please create the loan product first.',
      });
      return false;
    }
  }
  
  // Validate that the client exists
  if (transformedLoan.client_id) {
    const { data: clientExists } = await supabase
      .from('clients')
      .select('id')
      .eq('id', transformedLoan.client_id)
      .eq('organization_id', orgId)
      .single();
    
    if (!clientExists) {
      console.error('❌ Error creating loan: Client does not exist in Supabase. Please create the client first.');
      toast.error('Client Missing', {
        description: 'The selected client does not exist in the database yet. Please create the client first.',
      });
      return false;
    }
  }
  
  const { error } = await supabase
    .from('loans')
    .insert({ ...transformedLoan, organization_id: orgId });
  
  if (error) {
    console.error('❌ Error creating loan:', error);
    toast.error('Failed to sync loan to database', {
      description: error.message,
    });
    return false;
  }
  console.log('✅ Loan created successfully in Supabase:', loan.id);
  return true;
};

export const updateLoan = async (id: string, updates: Partial<Loan>): Promise<boolean> => {
  const orgId = getOrganizationId();
  const transformedUpdates = transformLoanForSupabase(updates);
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

export const fetchLoanProducts = async (): Promise<LoanProduct[]> => {
  const orgId = getOrganizationId();
  const { data, error } = await supabase
    .from('loan_products')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching loan products:', error);
    return [];
  }
  return data || [];
};

export const createLoanProduct = async (product: LoanProduct): Promise<boolean> => {
  const orgId = getOrganizationId();
  const transformedProduct = transformLoanProductForSupabase(product);
  const { error } = await supabase
    .from('loan_products')
    .insert({ ...transformedProduct, organization_id: orgId });
  
  if (error) {
    console.error('Error creating loan product:', error);
    return false;
  }
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
// REPAYMENTS
// =============================================

export const fetchRepayments = async (): Promise<Repayment[]> => {
  const orgId = getOrganizationId();
  const { data, error } = await supabase
    .from('repayments')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching repayments:', error);
    return [];
  }
  return data || [];
};

export const createRepayment = async (repayment: Repayment): Promise<boolean> => {
  const orgId = getOrganizationId();
  const transformedRepayment = transformRepaymentForSupabase(repayment);
  const { error } = await supabase
    .from('repayments')
    .insert({ ...transformedRepayment, organization_id: orgId });
  
  if (error) {
    console.error('Error creating repayment:', error);
    return false;
  }
  return true;
};

// =============================================
// SAVINGS ACCOUNTS
// =============================================

export const fetchSavingsAccounts = async (): Promise<SavingsAccount[]> => {
  const orgId = getOrganizationId();
  const { data, error } = await supabase
    .from('savings_accounts')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching savings accounts:', error);
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
  const { data, error } = await supabase
    .from('savings_transactions')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching savings transactions:', error);
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
  const { data, error } = await supabase
    .from('shareholders')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching shareholders:', error);
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
  const { data, error } = await supabase
    .from('shareholder_transactions')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching shareholder transactions:', error);
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
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching expenses:', error);
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
  const { data, error } = await supabase
    .from('payees')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching payees:', error);
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
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching bank accounts:', error);
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
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching tasks:', error);
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
  const { data, error } = await supabase
    .from('kyc_records')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching KYC records:', error);
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
  const { data, error } = await supabase
    .from('approvals')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching approvals:', error);
    return [];
  }
  return data || [];
};

export const createApproval = async (approval: Approval): Promise<boolean> => {
  const orgId = getOrganizationId();
  const transformedApproval = transformApprovalForSupabase(approval);
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
  const { data, error } = await supabase
    .from('funding_transactions')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching funding transactions:', error);
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
  const { data, error } = await supabase
    .from('processing_fee_records')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching processing fee records:', error);
    return [];
  }
  return data || [];
};

export const createProcessingFeeRecord = async (record: ProcessingFeeRecord): Promise<boolean> => {
  const orgId = getOrganizationId();
  const transformedRecord = transformProcessingFeeRecordForSupabase(record);
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
  const { data, error } = await supabase
    .from('disbursements')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching disbursements:', error);
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
  const { data, error } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching payroll runs:', error);
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
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching journal entries:', error);
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
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('organization_id', orgId)
    .order('timestamp', { ascending: false })
    .limit(1000);
  
  if (error) {
    console.error('Error fetching audit logs:', error);
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
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching tickets:', error);
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
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching groups:', error);
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
  const { data, error } = await supabase
    .from('guarantors')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching guarantors:', error);
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
  const { data, error } = await supabase
    .from('collaterals')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching collaterals:', error);
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
  const { data, error} = await supabase
    .from('loan_documents')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('Error fetching loan documents:', error);
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
      operations.push(
        supabase.from('loans').upsert(
          data.loans.map((l: Loan) => ({ ...transformLoanForSupabase(l), organization_id: orgId }))
        )
      );
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
      operations.push(
        supabase.from('repayments').upsert(
          data.repayments.map((r: Repayment) => ({ ...transformRepaymentForSupabase(r), organization_id: orgId }))
        )
      );
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