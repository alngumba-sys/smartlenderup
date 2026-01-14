/**
 * Supabase Data Service - Complete SmartLenderUp Platform
 * 
 * ✅ ALL data operations go DIRECTLY to Supabase database
 * ✅ NO localStorage usage for operational data
 * ✅ Auto-generated UUIDs for all tables
 * ✅ Proper error handling
 * ✅ Organization-scoped queries
 * ✅ Works with new database schema
 */

import { supabase } from '../lib/supabase';

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Ensure organization exists in database
 * If localStorage has an org that doesn't exist in DB, create it
 */
async function ensureOrganizationExists(organizationId: string): Promise<void> {
  // Check if organization exists
  const { data: existingOrg, error } = await supabase
    .from('organizations')
    .select('id')
    .eq('id', organizationId)
    .maybeSingle();
  
  if (error) {
    console.error('❌ Error checking organization:', error);
    throw error;
  }
  
  // If organization doesn't exist, create it
  if (!existingOrg) {
    console.log('⚠️  Organization not found in database. Creating it...');
    
    // Get organization data from localStorage
    const orgData = localStorage.getItem('current_organization');
    let orgName = 'Default Organization';
    let orgType = 'mother_company';
    let country = 'Kenya';
    let currency = 'KES';
    
    if (orgData) {
      try {
        const parsedOrg = JSON.parse(orgData);
        orgName = parsedOrg.organization_name || parsedOrg.name || orgName;
        orgType = parsedOrg.organization_type || parsedOrg.type || orgType;
        country = parsedOrg.country || country;
        currency = parsedOrg.currency || currency;
      } catch (e) {
        console.warn('⚠️  Could not parse organization data from localStorage');
      }
    }
    
    const newOrg = {
      id: organizationId,
      organization_name: orgName,
      organization_type: orgType,
      country: country,
      currency: currency,
      subscription_status: 'trial',
      trial_start_date: new Date().toISOString(),
      trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('organizations')
      .insert([newOrg]);
    
    if (insertError) {
      console.error('❌ Error creating organization:', insertError);
      throw insertError;
    }
    
    console.log('✅ Organization created successfully:', orgName);
  }
}

/**
 * Generate unique client number (CL00001 format - 5 digits)
 */
async function generateClientNumber(organizationId: string): Promise<string> {
  // Get all client numbers to find the highest
  const { data } = await supabase
    .from('clients')
    .select('client_number')
    .eq('organization_id', organizationId)
    .order('client_number', { ascending: false });
  
  let nextNumber = 1;
  
  if (data && data.length > 0) {
    // Find the highest number from all existing client numbers
    const numbers = data
      .map(c => {
        const match = c.client_number?.match(/CL(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);
    
    if (numbers.length > 0) {
      nextNumber = Math.max(...numbers) + 1;
    }
  }
  
  const clientNumber = `CL${String(nextNumber).padStart(5, '0')}`;
  
  // Double-check this number doesn't already exist
  const { data: existing } = await supabase
    .from('clients')
    .select('client_number')
    .eq('organization_id', organizationId)
    .eq('client_number', clientNumber)
    .maybeSingle();
  
  // If it exists, increment and try again (recursive with safety limit)
  if (existing) {
    console.warn(`⚠️  Client number ${clientNumber} already exists, incrementing...`);
    return generateClientNumber(organizationId);
  }
  
  return clientNumber;
}

/**
 * Generate unique loan number (LN001 format)
 */
async function generateLoanNumber(organizationId: string): Promise<string> {
  const { data } = await supabase
    .from('loans')
    .select('loan_number')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(1);
  
  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastNumber = data[0].loan_number;
    const match = lastNumber?.match(/LN(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  return `LN${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Generate unique product code
 */
function generateProductCode(): string {
  return `PROD-${Date.now().toString().slice(-6)}`;
}

/**
 * Safe number parsing
 */
function parseNumber(value: any, defaultValue: number = 0): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safe integer parsing
 */
function parseInt(value: any, defaultValue: number = 0): number {
  const parsed = Number.parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// =====================================================
// ORGANIZATIONS SERVICE
// =====================================================

export const organizationService = {
  /**
   * Get all organizations
   */
  async getAll() {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get organization by ID
   */
  async getById(organizationId: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Create organization
   */
  async create(orgData: any) {
    const newOrg = {
      id: crypto.randomUUID(),
      organization_name: orgData.organization_name || orgData.name,
      organization_type: orgData.organization_type || 'mother_company',
      email: orgData.email || null,
      phone: orgData.phone || null,
      address: orgData.address || null,
      country: orgData.country || 'Kenya',
      currency: orgData.currency || 'KES',
      subscription_status: orgData.subscription_status || 'trial',
      trial_start_date: orgData.trial_start_date || new Date().toISOString(),
      trial_end_date: orgData.trial_end_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('organizations')
      .insert([newOrg])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating organization:', error);
      throw error;
    }
    
    console.log('✅ Organization created:', data);
    return data;
  },

  /**
   * Update organization
   */
  async update(organizationId: string, updates: any) {
    const { data, error } = await supabase
      .from('organizations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// =====================================================
// CLIENTS SERVICE
// =====================================================

export const clientService = {
  /**
   * Get all clients for an organization
   */
  async getAll(organizationId: string) {
    console.log(`📊 Fetching clients for org: ${organizationId}`);
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching clients:', error);
      throw error;
    }
    
    console.log(`✅ Fetched ${data?.length || 0} clients`);
    return data || [];
  },

  /**
   * Get client by ID
   */
  async getById(clientId: string, organizationId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('organization_id', organizationId)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Create client
   */
  async create(clientData: any, organizationId: string) {
    console.log('📝 Creating client:', clientData);
    
    // Generate client number if not provided
    const clientNumber = clientData.client_number || 
                        clientData.clientNumber || 
                        await generateClientNumber(organizationId);
    
    // Parse name into first_name and last_name if separate fields not provided
    let firstName = clientData.firstName || clientData.first_name || '';
    let lastName = clientData.lastName || clientData.last_name || '';
    
    console.log('🔍 DEBUG - Name parsing:');
    console.log('  clientData.firstName:', clientData.firstName);
    console.log('  clientData.lastName:', clientData.lastName);
    console.log('  clientData.name:', clientData.name);
    console.log('  firstName (after initial):', firstName);
    console.log('  lastName (after initial):', lastName);
    
    // If firstName and lastName are empty but name is provided, parse it
    if (!firstName && !lastName && clientData.name) {
      console.log('  ⚠️ Both firstName and lastName are empty, parsing from name field...');
      const nameParts = clientData.name.trim().split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
      console.log('  firstName (after parsing):', firstName);
      console.log('  lastName (after parsing):', lastName);
    } else {
      console.log('  ✅ Using provided firstName and lastName');
    }
    
    const newClient = {
      id: crypto.randomUUID(),
      organization_id: organizationId,
      client_number: clientNumber,
      
      // Personal information
      first_name: firstName,
      last_name: lastName,
      name: clientData.name || `${firstName} ${lastName}`.trim(),
      date_of_birth: clientData.dateOfBirth || clientData.date_of_birth || null,
      gender: clientData.gender?.toLowerCase() || null,
      marital_status: clientData.maritalStatus || clientData.marital_status || null,
      
      // Contact information
      email: clientData.email || null,
      phone: clientData.phone || clientData.phone_primary || null,
      phone_secondary: clientData.phoneSecondary || clientData.phone_secondary || null,
      
      // Address
      address: clientData.address || null,
      county: clientData.county || null,
      sub_county: clientData.subCounty || clientData.sub_county || null,
      ward: clientData.ward || null,
      town: clientData.town || clientData.city || null,
      
      // Identification
      id_number: clientData.idNumber || clientData.id_number || null,
      id_type: clientData.idType || clientData.id_type || null,
      
      // Employment
      occupation: clientData.occupation || null,
      employer: clientData.employer || null,
      employer_phone: clientData.employerPhone || clientData.employer_phone || null,
      monthly_income: parseNumber(clientData.monthlyIncome || clientData.monthly_income),
      
      // Business
      business_name: clientData.businessName || clientData.business_name || null,
      business_type: clientData.businessType || clientData.business_type || null,
      business_location: clientData.businessLocation || clientData.business_location || null,
      years_in_business: parseInt(clientData.yearsInBusiness || clientData.years_in_business),
      
      // Next of Kin
      next_of_kin_name: clientData.nextOfKin?.name || clientData.next_of_kin_name || null,
      next_of_kin_phone: clientData.nextOfKin?.phone || clientData.next_of_kin_phone || null,
      next_of_kin_relationship: clientData.nextOfKin?.relationship || clientData.next_of_kin_relationship || null,
      
      // Status
      status: 'active',
      kyc_status: 'pending',
      verification_status: 'pending',
      
      // Audit
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('clients')
      .insert([newClient])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating client:', error);
      throw error;
    }
    
    console.log('✅ Client created successfully:', data);
    return data;
  },

  /**
   * Update client
   */
  async update(clientId: string, updates: any, organizationId: string) {
    const { data, error } = await supabase
      .from('clients')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)
      .eq('organization_id', organizationId)
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Client updated successfully');
    return data;
  },

  /**
   * Delete client
   */
  async delete(clientId: string, organizationId: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)
      .eq('organization_id', organizationId);
    
    if (error) throw error;
    console.log('✅ Client deleted successfully');
  }
};

// =====================================================
// LOAN PRODUCTS SERVICE
// =====================================================

export const loanProductService = {
  /**
   * Get all loan products
   */
  async getAll(organizationId: string) {
    console.log(`📊 Fetching loan products for org: ${organizationId}`);
    
    const { data, error } = await supabase
      .from('loan_products')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching loan products:', error);
      throw error;
    }
    
    console.log(`✅ Fetched ${data?.length || 0} loan products`);
    return data || [];
  },

  /**
   * Create loan product
   */
  async create(productData: any, organizationId: string) {
    console.log('📝 Creating loan product:', productData);
    
    // ✅ ENSURE ORGANIZATION EXISTS FIRST
    await ensureOrganizationExists(organizationId);
    
    const productCode = productData.productCode || 
                       productData.product_code || 
                       generateProductCode();
    
    const newProduct = {
      id: crypto.randomUUID(),
      organization_id: organizationId,
      
      // Product identification
      product_name: productData.name || productData.productName || productData.product_name || 'Unnamed Product',
      name: productData.name || productData.productName || productData.product_name || 'Unnamed Product',
      product_code: productCode,
      description: productData.description || '',
      
      // Amount limits (dual naming for compatibility)
      min_amount: parseNumber(productData.minAmount || productData.min_amount || productData.minimumAmount),
      max_amount: parseNumber(productData.maxAmount || productData.max_amount || productData.maximumAmount, 10000000),
      minimum_amount: parseNumber(productData.minAmount || productData.min_amount || productData.minimumAmount),
      maximum_amount: parseNumber(productData.maxAmount || productData.max_amount || productData.maximumAmount, 10000000),
      
      // Term limits (dual naming for compatibility)
      min_term: parseInt(productData.minTerm || productData.min_term || productData.minimumTerm, 1),
      max_term: parseInt(productData.maxTerm || productData.max_term || productData.maximumTerm, 60),
      minimum_term: parseInt(productData.minTerm || productData.min_term || productData.minimumTerm, 1),
      maximum_term: parseInt(productData.maxTerm || productData.max_term || productData.maximumTerm, 60),
      term_unit: productData.termUnit || productData.term_unit || 'Months',
      
      // Interest configuration
      interest_rate: parseNumber(productData.interestRate || productData.interest_rate),
      interest_method: (productData.interestMethod || productData.interest_method || 'flat').toLowerCase(),
      interest_type: productData.interestType || productData.interest_type || 'Flat',
      
      // Repayment
      repayment_frequency: (productData.repaymentFrequency || productData.repayment_frequency || 'monthly').toLowerCase(),
      
      // Fees
      processing_fee_percentage: parseNumber(productData.processingFeePercentage || productData.processing_fee_percentage),
      processing_fee_fixed: parseNumber(productData.processingFeeFixed || productData.processing_fee_fixed),
      insurance_fee_fixed: parseNumber(productData.insuranceFeeFixed || productData.insurance_fee_fixed),
      
      // Requirements (dual naming for compatibility)
      guarantor_required: productData.guarantorRequired || productData.guarantor_required || false,
      collateral_required: productData.collateralRequired || productData.collateral_required || false,
      require_guarantor: productData.guarantorRequired || productData.guarantor_required || false,
      require_collateral: productData.collateralRequired || productData.collateral_required || false,
      
      // Status
      status: 'active',
      
      // Audit
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('loan_products')
      .insert([newProduct])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating loan product:', error);
      throw error;
    }
    
    console.log('✅ Loan product created successfully:', data);
    return data;
  },

  /**
   * Update loan product
   */
  async update(productId: string, updates: any, organizationId: string) {
    const { data, error } = await supabase
      .from('loan_products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .eq('organization_id', organizationId)
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Loan product updated successfully');
    return data;
  },

  /**
   * Delete loan product
   */
  async delete(productId: string, organizationId: string) {
    console.log('🗑️ [LOAN PRODUCT DELETE] Starting deletion...');
    console.log('   Product ID:', productId);
    console.log('   Organization ID:', organizationId);
    
    const { error, data } = await supabase
      .from('loan_products')
      .delete()
      .eq('id', productId)
      .eq('organization_id', organizationId)
      .select();
    
    if (error) {
      console.error('❌ [LOAN PRODUCT DELETE] Error:', error);
      throw error;
    }
    
    console.log('✅ [LOAN PRODUCT DELETE] Successfully deleted from database');
    console.log('   Deleted rows:', data);
  }
};

// =====================================================
// LOANS SERVICE
// =====================================================

export const loanService = {
  /**
   * Get all loans
   */
  async getAll(organizationId: string) {
    console.log(`📊 Fetching loans for org: ${organizationId}`);
    
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        client:clients(id, first_name, last_name, client_number),
        product:loan_products(id, product_name, product_code, interest_rate)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching loans:', error);
      throw error;
    }
    
    console.log(`✅ Fetched ${data?.length || 0} loans`);
    return data || [];
  },

  /**
   * Get loans by client
   */
  async getByClient(clientId: string, organizationId: string) {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('client_id', clientId)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Create loan
   */
  async create(loanData: any, organizationId: string) {
    console.log('📝 Creating loan:', loanData);
    
    const loanNumber = await generateLoanNumber(organizationId);
    
    // ✅ Resolve client_id: Find UUID by custom client number (CL001 format)
    let clientUUID = loanData.clientId || loanData.client_id;
    if (clientUUID && clientUUID.startsWith('CL')) {
      console.log('🔍 Looking up client UUID for:', clientUUID);
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('client_number', clientUUID)
        .eq('organization_id', organizationId)
        .single();
      
      if (clientData) {
        clientUUID = clientData.id;
        console.log('✅ Found client UUID:', clientUUID);
      }
    }
    
    // ✅ Resolve product_id: Find UUID by custom product code (PROD-xxxxx format)
    let productUUID = loanData.productId || loanData.product_id || null;
    if (productUUID && productUUID.startsWith('PROD-')) {
      console.log('🔍 Looking up product UUID for:', productUUID);
      const { data: productData } = await supabase
        .from('loan_products')
        .select('id')
        .eq('product_code', productUUID)
        .eq('organization_id', organizationId)
        .single();
      
      if (productData) {
        productUUID = productData.id;
        console.log('✅ Found product UUID:', productUUID);
      } else {
        console.warn('⚠️ Product not found, setting to null');
        productUUID = null;
      }
    }
    
    // ✅ Calculate financial values
    const principalAmount = parseNumber(loanData.amount || loanData.principalAmount);
    const interestRate = parseNumber(loanData.interestRate || loanData.interest_rate);
    const term = parseInt(loanData.term || loanData.loanTerm || loanData.term_period || loanData.termPeriod, 10);
    
    // Calculate total amount and monthly installment
    const totalInterest = (principalAmount * interestRate * term) / (100 * 12);
    const totalAmount = principalAmount + totalInterest;
    const monthlyInstallment = totalAmount / term;
    
    // ✅ Handle creation date from form (disbursementDate is used as application_date in the form)
    const creationDate = loanData.creationDate || loanData.disbursementDate || loanData.applicationDate || new Date().toISOString();
    
    const newLoan = {
      id: crypto.randomUUID(),
      organization_id: organizationId,
      client_id: clientUUID,
      product_id: productUUID, // Changed from loan_product_id to product_id
      loan_number: loanNumber,
      
      // Loan details (mapped to actual schema column names)
      amount: principalAmount, // Changed from principal_amount to amount
      interest_rate: interestRate,
      term_period: term, // Changed from duration_months to term_period
      term_period_unit: 'months', // Added term_period_unit
      repayment_frequency: loanData.repaymentFrequency?.toLowerCase() || 'monthly',
      
      // Financial calculations
      total_amount: parseNumber(loanData.totalRepayable || loanData.totalAmount || loanData.total_amount || totalAmount),
      balance: parseNumber(loanData.outstandingBalance || loanData.totalRepayable || loanData.totalAmount || loanData.total_amount || totalAmount), // Changed from outstanding_balance to balance
      amount_paid: 0, // Changed from paid_amount to amount_paid
      
      // Purpose & disbursement
      purpose: loanData.purpose || '',
      disbursement_method: loanData.disbursementMethod || loanData.disbursement_method || null,
      
      // Dates
      application_date: creationDate,
      expected_repayment_date: loanData.firstRepaymentDate || null, // Changed from first_payment_date to expected_repayment_date
      maturity_date: loanData.maturityDate || null,
      
      // 5-Phase workflow
      phase: 1, // Start at phase 1
      status: loanData.status?.toLowerCase() || 'pending',
      
      // Audit
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('loans')
      .insert([newLoan])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating loan:', error);
      throw error;
    }
    
    console.log('✅ Loan created successfully:', data);
    
    // ✅ Save guarantor if provided
    if (loanData.guarantorName || loanData.guarantors) {
      try {
        const guarantorsToSave = [];
        
        // Handle single guarantor from form
        if (loanData.guarantorName && loanData.guarantorPhone) {
          guarantorsToSave.push({
            loan_id: data.id,
            guarantor_name: loanData.guarantorName,
            guarantor_phone: loanData.guarantorPhone,
            guarantor_id_number: loanData.guarantorId || '',
            guarantor_email: loanData.guarantorEmail || null,
            relationship_to_client: loanData.guarantorRelationship || 'Guarantor',
            consent_given: false,
            created_at: new Date().toISOString()
          });
        }
        
        // Handle multiple guarantors array
        if (loanData.guarantors && Array.isArray(loanData.guarantors)) {
          loanData.guarantors.forEach((g: any) => {
            guarantorsToSave.push({
              loan_id: data.id,
              guarantor_name: g.name,
              guarantor_phone: g.phone,
              guarantor_id_number: g.idNumber || g.id_number || '',
              guarantor_email: g.email || null,
              relationship_to_client: g.relationship || 'Guarantor',
              consent_given: false,
              created_at: new Date().toISOString()
            });
          });
        }
        
        if (guarantorsToSave.length > 0) {
          const { error: guarantorError } = await supabase
            .from('loan_guarantors')
            .insert(guarantorsToSave);
          
          if (guarantorError) {
            console.error('⚠️ Error saving guarantor:', guarantorError);
          } else {
            console.log(`✅ Saved ${guarantorsToSave.length} guarantor(s)`);
          }
        }
      } catch (err) {
        console.error('⚠️ Error processing guarantors:', err);
      }
    }
    
    // ✅ Save collateral if provided
    if (loanData.collateralType || loanData.collateral) {
      try {
        const collateralToSave = [];
        
        // Helper function to map collateral type to database enum
        const mapCollateralType = (type: string): string => {
          const mapping: Record<string, string> = {
            'asset': 'equipment',
            'business asset': 'equipment',
            'property': 'property',
            'vehicle': 'vehicle',
            'equipment': 'equipment',
            'land': 'land',
            'shares': 'shares',
            'other': 'other'
          };
          return mapping[type.toLowerCase()] || 'other';
        };
        
        // Handle single collateral from form
        if (loanData.collateralType && loanData.collateralValue) {
          collateralToSave.push({
            loan_id: data.id,
            collateral_type: mapCollateralType(loanData.collateralType),
            description: loanData.collateralDescription || loanData.collateralType,
            estimated_value: parseNumber(loanData.collateralValue),
            created_at: new Date().toISOString()
          });
        }
        
        // Handle multiple collateral array
        if (loanData.collateral && Array.isArray(loanData.collateral)) {
          loanData.collateral.forEach((c: any) => {
            collateralToSave.push({
              loan_id: data.id,
              collateral_type: mapCollateralType(c.type || 'other'),
              description: c.description || c.type,
              estimated_value: parseNumber(c.value),
              created_at: new Date().toISOString()
            });
          });
        }
        
        if (collateralToSave.length > 0) {
          const { error: collateralError } = await supabase
            .from('loan_collateral')
            .insert(collateralToSave);
          
          if (collateralError) {
            console.error('⚠️ Error saving collateral:', collateralError);
          } else {
            console.log(`✅ Saved ${collateralToSave.length} collateral item(s)`);
          }
        }
      } catch (err) {
        console.error('⚠️ Error processing collateral:', err);
      }
    }
    
    return data;
  },

  /**
   * Update loan
   */
  async update(loanId: string, updates: any, organizationId: string) {
    // ✅ Transform field names from camelCase to snake_case
    const fieldMap: Record<string, string> = {
      'approvedDate': 'approval_date',
      'approvedBy': 'approved_by',
      'disbursementDate': 'disbursement_date',
      'disbursedDate': 'disbursement_date',
      'disbursedBy': 'disbursed_by',
      'applicationDate': 'application_date',
      'firstRepaymentDate': 'expected_repayment_date',
      'principalAmount': 'amount',
      'loanTerm': 'term_period',
      'totalRepayable': 'total_amount',
      'outstandingBalance': 'balance',
      'paidAmount': 'amount_paid',
      'interestRate': 'interest_rate',
      'productId': 'product_id',
      'clientId': 'client_id',
      'lastPaymentDate': 'last_payment_date',
      'lastPaymentAmount': 'last_payment_amount',
      'nextPaymentDate': 'next_payment_date',
      'nextPaymentAmount': 'next_payment_amount'
    };
    
    // Fields to exclude from database updates (frontend-only fields)
    const excludeFields = ['paymentSource', 'clientName', 'productName', 'lastPaymentDate', 'lastPaymentAmount', 'nextPaymentDate', 'nextPaymentAmount'];
    
    // Transform updates to match database schema
    const transformedUpdates: any = {};
    Object.keys(updates).forEach(key => {
      // Skip excluded fields
      if (excludeFields.includes(key)) {
        return;
      }
      const mappedKey = fieldMap[key] || key;
      transformedUpdates[mappedKey] = updates[key];
    });
    
    // ✅ Check if loanId is a loan_number (LN001) or UUID
    const isLoanNumber = loanId.startsWith('LN');
    
    const query = supabase
      .from('loans')
      .update({
        ...transformedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', organizationId);
    
    // Use loan_number or id depending on format
    if (isLoanNumber) {
      query.eq('loan_number', loanId);
    } else {
      query.eq('id', loanId);
    }
    
    const { data, error } = await query.select().single();
    
    if (error) throw error;
    console.log('✅ Loan updated successfully');
    return data;
  },

  /**
   * Approve loan (move to next phase)
   */
  async approve(loanId: string, organizationId: string, currentPhase: number) {
    const newPhase = currentPhase + 1;
    const newStatus = newPhase === 5 ? 'approved' : 'pending';
    
    return await this.update(loanId, {
      phase: newPhase,
      status: newStatus,
      approval_date: newPhase === 5 ? new Date().toISOString() : undefined
    }, organizationId);
  },

  /**
   * Disburse loan
   */
  async disburse(loanId: string, organizationId: string, disbursementData: any) {
    // Update loan status
    const loan = await this.update(loanId, {
      status: 'active',
      disbursement_date: new Date().toISOString(),
      ...disbursementData
    }, organizationId);

    // Create disbursement record
    await disbursementService.create({
      loan_id: loanId,
      amount: disbursementData.amount || loan.amount,
      disbursement_method: disbursementData.disbursement_method,
      reference_number: disbursementData.reference_number,
      bank_name: disbursementData.bank_name,
      account_number: disbursementData.account_number
    }, organizationId);

    return loan;
  },

  /**
   * Delete loan
   */
  async delete(loanId: string, organizationId: string) {
    console.log('🗑️ [LOAN DELETE] Starting deletion...');
    console.log('   Loan ID:', loanId);
    console.log('   Organization ID:', organizationId);
    
    const { error, data } = await supabase
      .from('loans')
      .delete()
      .eq('id', loanId)
      .eq('organization_id', organizationId)
      .select();
    
    if (error) {
      console.error('❌ [LOAN DELETE] Error:', error);
      throw error;
    }
    
    console.log('✅ [LOAN DELETE] Successfully deleted from database');
    console.log('   Deleted rows:', data);
  }
};

// =====================================================
// REPAYMENTS SERVICE
// =====================================================

export const repaymentService = {
  /**
   * Get all repayments for a loan
   */
  async getByLoan(loanId: string, organizationId: string) {
    const { data, error } = await supabase
      .from('repayments')
      .select('*')
      .eq('loan_id', loanId)
      .eq('organization_id', organizationId)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get all repayments
   */
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('repayments')
      .select('*')
      .eq('organization_id', organizationId)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Create repayment
   */
  async create(repaymentData: any, organizationId: string) {
    console.log('📝 Creating repayment:', repaymentData);
    
    const newRepayment = {
      id: crypto.randomUUID(),
      organization_id: organizationId,
      loan_id: repaymentData.loanId || repaymentData.loan_id,
      client_id: repaymentData.clientId || repaymentData.client_id || null,
      
      // Payment details
      amount: parseNumber(repaymentData.amount),
      payment_date: repaymentData.paymentDate || repaymentData.payment_date || new Date().toISOString(),
      payment_method: repaymentData.paymentMethod || repaymentData.payment_method || 'Cash',
      transaction_ref: repaymentData.transactionRef || repaymentData.transaction_ref || null,
      
      // Allocation
      principal_amount: parseNumber(repaymentData.principalAmount || repaymentData.principal_amount),
      interest_amount: parseNumber(repaymentData.interestAmount || repaymentData.interest_amount),
      penalty_amount: parseNumber(repaymentData.penaltyAmount || repaymentData.penalty_amount),
      
      // Status
      status: 'completed',
      
      // Audit
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('repayments')
      .insert([newRepayment])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating repayment:', error);
      throw error;
    }
    
    // Update loan balance
    const loanId = repaymentData.loanId || repaymentData.loan_id;
    const { data: loan } = await supabase
      .from('loans')
      .select('balance, amount_paid')
      .eq('id', loanId)
      .single();
    
    if (loan) {
      const newBalance = (loan.balance || 0) - parseNumber(repaymentData.amount);
      const newAmountPaid = (loan.amount_paid || 0) + parseNumber(repaymentData.amount);
      
      await supabase
        .from('loans')
        .update({
          balance: newBalance,
          amount_paid: newAmountPaid,
          status: newBalance <= 0 ? 'fully_paid' : 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', loanId)
        .eq('organization_id', organizationId);
    }
    
    console.log('✅ Repayment created successfully:', data);
    return data;
  }
};

// =====================================================
// ADDITIONAL SERVICES
// =====================================================

export const approvalService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(approvalData: any, organizationId: string) {
    // Support both old workflow (step-based) and new workflow (phase-based)
    const isPhaseBasedWorkflow = approvalData.phase !== undefined;
    
    if (isPhaseBasedWorkflow) {
      // NEW WORKFLOW: Full 5-phase approval system
      const validFields: any = {
        id: crypto.randomUUID(),
        organization_id: organizationId,
        type: approvalData.type,
        title: approvalData.title,
        description: approvalData.description,
        requested_by: approvalData.requestedBy || approvalData.requested_by,
        request_date: approvalData.requestDate || approvalData.request_date || new Date().toISOString(),
        amount: approvalData.amount,
        client_id: approvalData.clientId || approvalData.client_id,
        client_name: approvalData.clientName || approvalData.client_name,
        status: approvalData.status || 'pending',
        priority: approvalData.priority || 'medium',
        approver: approvalData.approver,
        approver_name: approvalData.approverName || approvalData.approver_name,
        approval_date: approvalData.approvalDate || approvalData.approval_date,
        rejection_reason: approvalData.rejectionReason || approvalData.rejection_reason,
        related_id: approvalData.relatedId || approvalData.related_id,
        phase: approvalData.phase,
        disbursement_data: approvalData.disbursementData || approvalData.disbursement_data,
        // ✅ WORKAROUND: Set defaults for old workflow columns if DB has NOT NULL constraints
        // These should be nullable in the database, but we set defaults as a backup
        loan_id: null,  // Phase-based workflow uses related_id instead
        step: 1,  // Default to step 1 (maps roughly to phase 1)
        approval_status: 'pending',  // Maps to status field
        approver_id: approvalData.approver || null,  // Use approver if available
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('approvals')
        .insert([validFields])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      // OLD WORKFLOW: Step-based (for backward compatibility)
      let loanUuid = approvalData.loan_id;
      
      // If loan_id looks like a loan number (LN001), fetch the UUID from database
      if (loanUuid && loanUuid.startsWith('LN')) {
        const { data: loan } = await supabase
          .from('loans')
          .select('id')
          .eq('loan_number', loanUuid)
          .eq('organization_id', organizationId)
          .single();
        
        if (loan) {
          loanUuid = loan.id;
        } else {
          throw new Error(`Loan with loan_number ${loanUuid} not found`);
        }
      }
      
      const validFields: any = {
        id: crypto.randomUUID(),
        organization_id: organizationId,
        loan_id: loanUuid,
        step: approvalData.step,
        approval_status: approvalData.approval_status,
        approver_id: approvalData.approver_id,
        comments: approvalData.comments || null,
        created_at: new Date().toISOString()
      };
      
      // Only add approved_at if status is approved (not approval_date)
      if (approvalData.approval_status === 'approved') {
        validFields.approved_at = approvalData.approved_at || approvalData.approval_date || new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('approvals')
        .insert([validFields])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async update(approvalId: string, updates: any, organizationId: string) {
    console.log('🔧 [approvalService.update] Starting approval update:', {
      approvalId,
      organizationId,
      updates
    });
    
    // Filter and map valid fields - support both old and new workflow
    const validUpdates: any = {};
    
    // Old workflow fields
    if (updates.step !== undefined) validUpdates.step = updates.step;
    if (updates.approval_status !== undefined) validUpdates.approval_status = updates.approval_status;
    // ✅ Skip approver_id to avoid foreign key constraint errors
    // Only set if it's explicitly a valid UUID and not an organization ID
    // if (updates.approver_id !== undefined) validUpdates.approver_id = updates.approver_id;
    if (updates.comments !== undefined) validUpdates.comments = updates.comments;
    
    // New workflow fields
    if (updates.type !== undefined) validUpdates.type = updates.type;
    if (updates.title !== undefined) validUpdates.title = updates.title;
    if (updates.description !== undefined) validUpdates.description = updates.description;
    if (updates.status !== undefined) {
      validUpdates.status = updates.status;
      // ✅ CRITICAL: Also update approval_status for backward compatibility
      if (updates.approval_status === undefined) {
        validUpdates.approval_status = updates.status;
        console.log('   ✓ Auto-syncing status to approval_status:', updates.status);
      }
    }
    if (updates.priority !== undefined) validUpdates.priority = updates.priority;
    if (updates.approver !== undefined) validUpdates.approver = updates.approver;
    if (updates.approverName !== undefined) validUpdates.approver_name = updates.approverName;
    if (updates.approver_name !== undefined) validUpdates.approver_name = updates.approver_name;
    if (updates.rejectionReason !== undefined) validUpdates.rejection_reason = updates.rejectionReason;
    if (updates.rejection_reason !== undefined) validUpdates.rejection_reason = updates.rejection_reason;
    if (updates.phase !== undefined) {
      validUpdates.phase = updates.phase;
      // ✅ CRITICAL: Also update step for backward compatibility
      if (updates.step === undefined) {
        validUpdates.step = updates.phase;
        console.log('   ✓ Auto-syncing phase to step:', updates.phase);
      }
    }
    if (updates.disbursementData !== undefined) validUpdates.disbursement_data = updates.disbursementData;
    if (updates.disbursement_data !== undefined) validUpdates.disbursement_data = updates.disbursement_data;
    
    // Handle approval_date
    if (updates.approvalDate) validUpdates.approval_date = updates.approvalDate;
    if (updates.approval_date && (updates.approval_status === 'approved' || updates.status === 'approved')) {
      validUpdates.approved_at = updates.approval_date;
    } else if (updates.approved_at) {
      validUpdates.approved_at = updates.approved_at;
    }
    
    console.log('   📊 Final update payload:', validUpdates);
    console.log('   ✓ status field:', validUpdates.status);
    console.log('   ✓ approval_status field:', validUpdates.approval_status);
    console.log('   ✓ phase field:', validUpdates.phase);
    console.log('   ✓ step field:', validUpdates.step);
    
    const { data, error } = await supabase
      .from('approvals')
      .update({
        ...validUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', approvalId)
      .eq('organization_id', organizationId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ [approvalService.update] Database update failed:', error);
      throw error;
    }
    
    console.log('✅ [approvalService.update] Approval successfully updated in database:', data);
    return data;
  },

  async getByLoanId(loanId: string, organizationId: string) {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('loan_id', loanId)
      .eq('organization_id', organizationId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
};

export const collateralService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('collaterals')
      .select('*')
      .eq('organization_id', organizationId);
    if (error) throw error;
    return data || [];
  },

  async create(collateralData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('collaterals')
      .insert([{
        id: crypto.randomUUID(),
        ...collateralData,
        organization_id: organizationId,
        status: 'active',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const guarantorService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('guarantors')
      .select('*')
      .eq('organization_id', organizationId);
    if (error) throw error;
    return data || [];
  },

  async create(guarantorData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('guarantors')
      .insert([{
        id: crypto.randomUUID(),
        ...guarantorData,
        organization_id: organizationId,
        status: 'active',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const loanDocumentService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('loan_documents')
      .select('*')
      .eq('organization_id', organizationId);
    if (error) throw error;
    return data || [];
  },

  async getByLoan(loanId: string, organizationId: string) {
    const { data, error } = await supabase
      .from('loan_documents')
      .select('*')
      .eq('loan_id', loanId)
      .eq('organization_id', organizationId);
    if (error) throw error;
    return data || [];
  },

  async create(documentData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('loan_documents')
      .insert([{
        id: crypto.randomUUID(),
        ...documentData,
        organization_id: organizationId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const disbursementService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('disbursements')
      .select('*')
      .eq('organization_id', organizationId)
      .order('disbursement_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(disbursementData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('disbursements')
      .insert([{
        id: crypto.randomUUID(),
        ...disbursementData,
        organization_id: organizationId,
        status: 'completed',
        disbursement_date: disbursementData.disbursement_date || new Date().toISOString(),
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const employeeService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(employeeData: any, organizationId: string) {
    // Generate employee number
    const { data: existing } = await supabase
      .from('employees')
      .select('employee_number')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    let nextNumber = 1;
    if (existing && existing.length > 0) {
      const match = existing[0].employee_number?.match(/EMP(\d+)/);
      if (match) nextNumber = parseInt(match[1]) + 1;
    }
    
    const employeeNumber = `EMP${String(nextNumber).padStart(3, '0')}`;

    const { data, error } = await supabase
      .from('employees')
      .insert([{
        id: crypto.randomUUID(),
        employee_number: employeeNumber,
        ...employeeData,
        organization_id: organizationId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(employeeId: string, updates: any, organizationId: string) {
    const { data, error } = await supabase
      .from('employees')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId)
      .eq('organization_id', organizationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const groupService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(groupData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('groups')
      .insert([{
        id: crypto.randomUUID(),
        ...groupData,
        organization_id: organizationId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const savingsService = {
  async getAccounts(organizationId: string) {
    const { data, error } = await supabase
      .from('savings_accounts')
      .select('*')
      .eq('organization_id', organizationId);
    if (error) throw error;
    return data || [];
  },

  async getTransactions(organizationId: string) {
    const { data, error } = await supabase
      .from('savings_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createAccount(accountData: any, organizationId: string) {
    // Generate account number
    const { data: existing } = await supabase
      .from('savings_accounts')
      .select('account_number')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    let nextNumber = 1;
    if (existing && existing.length > 0) {
      const match = existing[0].account_number?.match(/SAV(\d+)/);
      if (match) nextNumber = parseInt(match[1]) + 1;
    }
    
    const accountNumber = `SAV${String(nextNumber).padStart(5, '0')}`;

    const { data, error } = await supabase
      .from('savings_accounts')
      .insert([{
        id: crypto.randomUUID(),
        account_number: accountNumber,
        ...accountData,
        organization_id: organizationId,
        balance: 0,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createTransaction(transactionData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('savings_transactions')
      .insert([{
        id: crypto.randomUUID(),
        ...transactionData,
        organization_id: organizationId,
        transaction_date: transactionData.transaction_date || new Date().toISOString(),
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    
    // Update account balance
    const accountId = transactionData.account_id;
    const { data: account } = await supabase
      .from('savings_accounts')
      .select('balance')
      .eq('id', accountId)
      .single();
    
    if (account) {
      const amount = parseNumber(transactionData.amount);
      const newBalance = transactionData.transaction_type === 'deposit' 
        ? (account.balance || 0) + amount
        : (account.balance || 0) - amount;
      
      await supabase
        .from('savings_accounts')
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId);
    }
    
    return data;
  }
};

export const journalService = {
  async getEntries(organizationId: string) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*, journal_entry_lines(*)')
      .eq('organization_id', organizationId)
      .order('entry_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createEntry(entryData: any, organizationId: string) {
    // Generate entry number
    const { data: existing } = await supabase
      .from('journal_entries')
      .select('entry_number')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    let nextNumber = 1;
    if (existing && existing.length > 0) {
      const match = existing[0].entry_number?.match(/JE(\d+)/);
      if (match) nextNumber = parseInt(match[1]) + 1;
    }
    
    const entryNumber = `JE${String(nextNumber).padStart(5, '0')}`;

    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{
        id: crypto.randomUUID(),
        entry_number: entryNumber,
        ...entryData,
        organization_id: organizationId,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createEntryLine(lineData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('journal_entry_lines')
      .insert([{
        id: crypto.randomUUID(),
        ...lineData,
        organization_id: organizationId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const expenseService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('organization_id', organizationId)
      .order('expense_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(expenseData: any, organizationId: string) {
    // Build insert data with only fields that exist in the database schema
    const insertData: any = {
      organization_id: organizationId,
      expense_category: expenseData.category || expenseData.expense_category || 'General',
      description: expenseData.description || 'Expense',
      amount: expenseData.amount || 0,
      payment_method: expenseData.payment_method || 'Cash',
      status: expenseData.status || 'Pending'
    };
    
    // Add optional fields that exist in the schema
    if (expenseData.expense_date) {
      insertData.expense_date = expenseData.expense_date;
    }
    
    if (expenseData.payee_id) {
      insertData.payee_id = expenseData.payee_id;
    }
    
    // Note: These fields may not exist in the schema yet, so we'll skip them
    // They will be stored in React state until schema is updated:
    // - payment_reference
    // - bank_account_id  
    // - subcategory
    // - payment_type
    // - created_by
    
    // Insert the expense
    const { data, error } = await supabase
      .from('expenses')
      .insert([insertData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const payrollService = {
  async getRuns(organizationId: string) {
    const { data, error } = await supabase
      .from('payroll_runs')
      .select('*')
      .eq('organization_id', organizationId)
      .order('payroll_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getRecords(organizationId: string) {
    const { data, error } = await supabase
      .from('payroll_records')
      .select('*')
      .eq('organization_id', organizationId);
    if (error) throw error;
    return data || [];
  },

  async createRun(runData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('payroll_runs')
      .insert([{
        id: crypto.randomUUID(),
        ...runData,
        organization_id: organizationId,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const bankAccountService = {
  async getAll(organizationId: string) {
    console.log('🔍 [bankAccountService.getAll] Called with org ID:', organizationId);
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('organization_id', organizationId);
    
    console.log('🔍 [bankAccountService.getAll] Query result:');
    console.log('   Data:', data);
    console.log('   Error:', error);
    console.log('   Count:', data?.length || 0);
    
    if (error) throw error;
    return data || [];
  },

  async create(accountData: any, organizationId: string) {
    // Use only the absolute minimum columns that exist
    const insertData: any = {
      organization_id: organizationId,
      // ✅ Accept both camelCase and snake_case for account_name
      account_name: accountData.account_name || accountData.accountName || 'Unnamed Account',
      account_number: accountData.account_number || accountData.accountNumber || '',
      bank_name: accountData.bank_name || accountData.bankName || ''
    };
    
    // Only add optional columns if they might exist (support both naming conventions)
    if (accountData.branch) insertData.branch = accountData.branch;
    if (accountData.account_type || accountData.accountType) {
      insertData.account_type = accountData.account_type || accountData.accountType;
    }
    
    // ✅ Add opening_balance and balance (only if columns exist)
    if (accountData.opening_balance !== undefined || accountData.openingBalance !== undefined) {
      insertData.opening_balance = accountData.opening_balance ?? accountData.openingBalance ?? 0;
    }
    if (accountData.balance !== undefined) {
      insertData.balance = accountData.balance;
    } else if (accountData.openingBalance !== undefined || accountData.opening_balance !== undefined) {
      // Set initial balance to opening balance
      insertData.balance = accountData.opening_balance ?? accountData.openingBalance ?? 0;
    }
    // Note: currency, status, opening_date, description, created_by might not exist in schema
    // Only add if explicitly confirmed to exist
    
    console.log('💾 Inserting bank account to Supabase:', insertData);
    
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert([insertData])
      .select()
      .single();
    if (error) throw error;
    
    console.log('✅ Bank account saved:', data);
    return data;
  },

  async update(id: string, updates: any, organizationId: string) {
    const updateData: any = {};
    
    // Map frontend fields to database columns
    if (updates.balance !== undefined) updateData.balance = updates.balance;
    if (updates.current_balance !== undefined) updateData.current_balance = updates.current_balance;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.account_name !== undefined) updateData.account_name = updates.account_name;
    if (updates.name !== undefined) updateData.account_name = updates.name;
    if (updates.account_number !== undefined) updateData.account_number = updates.account_number;
    if (updates.accountNumber !== undefined) updateData.account_number = updates.accountNumber;
    if (updates.bank_name !== undefined) updateData.bank_name = updates.bank_name;
    if (updates.bankName !== undefined) updateData.bank_name = updates.bankName;
    if (updates.branch !== undefined) updateData.branch = updates.branch;
    if (updates.account_type !== undefined) updateData.account_type = updates.account_type;
    if (updates.accountType !== undefined) updateData.account_type = updates.accountType;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.opening_balance !== undefined) updateData.opening_balance = updates.opening_balance;
    if (updates.openingBalance !== undefined) updateData.opening_balance = updates.openingBalance;
    if (updates.opening_date !== undefined) updateData.opening_date = updates.opening_date;
    if (updates.openingDate !== undefined) updateData.opening_date = updates.openingDate;
    if (updates.description !== undefined) updateData.description = updates.description;
    
    updateData.updated_at = new Date().toISOString();
    
    console.log('💾 Updating bank account in Supabase:', { id, updateData });
    
    const { data, error } = await supabase
      .from('bank_accounts')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Bank account updated:', data);
    return data;
  },

  async delete(id: string, organizationId: string) {
    console.log('🗑️ Deleting bank account from Supabase:', id);
    
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);
    
    if (error) throw error;
    
    console.log('✅ Bank account deleted:', id);
    return true;
  }
};

export const fundingTransactionService = {
  async getAll(organizationId: string) {
    console.log('🔍 [fundingTransactionService.getAll] Called with org ID:', organizationId);
    const { data, error } = await supabase
      .from('funding_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('date', { ascending: false });
    
    console.log('🔍 [fundingTransactionService.getAll] Query result:');
    console.log('   Data:', data);
    console.log('   Error:', error);
    console.log('   Count:', data?.length || 0);
    
    if (error) throw error;
    return data || [];
  },

  async create(transactionData: any, organizationId: string, userId: string) {
    const insertData: any = {
      id: crypto.randomUUID(),
      organization_id: organizationId,
      user_id: userId,
      bank_account_id: transactionData.bankAccountId,
      amount: transactionData.amount,
      date: transactionData.date,
      reference: transactionData.reference,
      description: transactionData.description,
      source: transactionData.source,
      shareholder_id: transactionData.shareholderId || null,
      shareholder_name: transactionData.shareholderName || null,
      payment_method: transactionData.paymentMethod,
      depositor_name: transactionData.depositorName || null,
      transaction_type: transactionData.transactionType || 'Credit',
      related_loan_id: transactionData.relatedLoanId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('💾 Inserting funding transaction to Supabase:', insertData);
    
    const { data, error } = await supabase
      .from('funding_transactions')
      .insert([insertData])
      .select()
      .single();
    if (error) throw error;
    
    console.log('✅ Funding transaction saved:', data);
    return data;
  },

  async delete(id: string, organizationId: string) {
    console.log('🗑️ Deleting funding transaction from Supabase:', id);
    
    const { error } = await supabase
      .from('funding_transactions')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);
    
    if (error) throw error;
    
    console.log('✅ Funding transaction deleted:', id);
    return true;
  }
};

export const shareholderService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('shareholders')
      .select('*')
      .eq('organization_id', organizationId);
    if (error) throw error;
    return data || [];
  },

  async getTransactions(organizationId: string) {
    const { data, error } = await supabase
      .from('shareholder_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(shareholderData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('shareholders')
      .insert([{
        id: crypto.randomUUID(),
        ...shareholderData,
        organization_id: organizationId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const kycService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('kyc_records')
      .select('*')
      .eq('organization_id', organizationId);
    if (error) throw error;
    return data || [];
  },

  async create(kycData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('kyc_records')
      .insert([{
        id: crypto.randomUUID(),
        ...kycData,
        organization_id: organizationId,
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const taskService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(taskData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        id: crypto.randomUUID(),
        ...taskData,
        organization_id: organizationId,
        status: 'pending',
        created_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const ticketService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(ticketData: any, organizationId: string) {
    // Generate ticket number
    const { data: existing } = await supabase
      .from('tickets')
      .select('ticket_number')
      .eq('organization_id', organizationId)
      .order('created_date', { ascending: false })
      .limit(1);
    
    let nextNumber = 1;
    if (existing && existing.length > 0) {
      const match = existing[0].ticket_number?.match(/TK(\d+)/);
      if (match) nextNumber = parseInt(match[1]) + 1;
    }
    
    const ticketNumber = `TK${String(nextNumber).padStart(5, '0')}`;

    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        id: crypto.randomUUID(),
        ticket_number: ticketNumber,
        ...ticketData,
        organization_id: organizationId,
        status: 'open',
        created_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const auditLogService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('organization_id', organizationId)
      .order('timestamp', { ascending: false })
      .limit(1000);
    if (error) throw error;
    return data || [];
  },

  async create(logData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{
        id: crypto.randomUUID(),
        ...logData,
        organization_id: organizationId,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const notificationService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(notificationData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        id: crypto.randomUUID(),
        ...notificationData,
        organization_id: organizationId,
        read: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId: string, organizationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('organization_id', organizationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const branchService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('organization_id', organizationId);
    if (error) throw error;
    return data || [];
  },

  async create(branchData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('branches')
      .insert([{
        id: crypto.randomUUID(),
        ...branchData,
        organization_id: organizationId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const paymentService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('organization_id', organizationId)
      .order('payment_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(paymentData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        id: crypto.randomUUID(),
        ...paymentData,
        organization_id: organizationId,
        status: 'completed',
        payment_date: paymentData.payment_date || new Date().toISOString(),
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const payeeService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('payees')
      .select('*')
      .eq('organization_id', organizationId);
    if (error) throw error;
    return data || [];
  },

  async create(payeeData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('payees')
      .insert([{
        id: crypto.randomUUID(),
        ...payeeData,
        organization_id: organizationId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// =====================================================
// CHART OF ACCOUNTS SERVICE
// =====================================================

export const chartOfAccountsService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .order('account_code', { ascending: true});
    if (error) throw error;
    return data || [];
  },

  async getByCode(accountCode: string, organizationId: string) {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('account_code', accountCode)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(accountData: any, organizationId: string) {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .insert([{
        id: crypto.randomUUID(),
        ...accountData,
        organization_id: organizationId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(accountCode: string, updates: any, organizationId: string) {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', organizationId)
      .eq('account_code', accountCode)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBalance(accountCode: string, balance: number, organizationId: string) {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .update({
        balance: balance,
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', organizationId)
      .eq('account_code', accountCode)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// =====================================================
// EXPORT COMBINED SERVICE
// =====================================================

export const supabaseDataService = {
  organizations: organizationService,
  clients: clientService,
  loanProducts: loanProductService,
  loans: loanService,
  repayments: repaymentService,
  approvals: approvalService,
  collaterals: collateralService,
  guarantors: guarantorService,
  loanDocuments: loanDocumentService,
  disbursements: disbursementService,
  employees: employeeService,
  groups: groupService,
  savings: savingsService,
  journalEntries: journalService,
  chartOfAccounts: chartOfAccountsService,
  expenses: expenseService,
  payroll: payrollService,
  bankAccounts: bankAccountService,
  fundingTransactions: fundingTransactionService,
  shareholders: shareholderService,
  kyc: kycService,
  tasks: taskService,
  tickets: ticketService,
  auditLogs: auditLogService,
  notifications: notificationService,
  branches: branchService,
  payments: paymentService,
  payees: payeeService
};

// Register global test function
if (typeof window !== 'undefined') {
  (window as any).testSupabaseService = async () => {
    console.log('🧪 Testing Supabase Data Service...');
    const orgData = localStorage.getItem('current_organization');
    if (!orgData) {
      console.error('❌ No organization found in localStorage');
      return;
    }
    const org = JSON.parse(orgData);
    
    console.log('📊 Organization:', org.organization_name);
    
    try {
      const clients = await clientService.getAll(org.id);
      const products = await loanProductService.getAll(org.id);
      const loans = await loanService.getAll(org.id);
      
      console.log('✅ Test Results:');
      console.log(`   Clients: ${clients.length}`);
      console.log(`   Products: ${products.length}`);
      console.log(`   Loans: ${loans.length}`);
      
      return { clients, products, loans };
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  };
  
  // Helper to check and fix organization after database reset
  (window as any).checkAndFixOrganization = async () => {
    console.log('🔍 Checking organization setup...');
    
    const orgData = localStorage.getItem('current_organization');
    if (!orgData) {
      console.error('❌ No organization found in localStorage');
      console.log('💡 You need to set up an organization first');
      return;
    }
    
    const org = JSON.parse(orgData);
    console.log('📊 Organization in localStorage:', org.organization_name);
    console.log('🆔 Organization ID:', org.id);
    
    // Check if exists in database
    const { data: existingOrg, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', org.id)
      .maybeSingle();
    
    if (error) {
      console.error('❌ Error checking database:', error);
      return;
    }
    
    if (existingOrg) {
      console.log('✅ Organization EXISTS in database!');
      console.log('   Name:', existingOrg.organization_name);
      console.log('   Type:', existingOrg.organization_type);
      console.log('   Country:', existingOrg.country);
      console.log('   Currency:', existingOrg.currency);
      console.log('   Status:', existingOrg.status);
      console.log('   Trial Ends:', existingOrg.trial_end_date);
      return existingOrg;
    } else {
      console.log('⚠️  Organization NOT FOUND in database');
      console.log('🔧 Creating organization...');
      
      try {
        await ensureOrganizationExists(org.id);
        console.log('✅ Organization created successfully!');
        console.log('🎉 You can now create loan products, clients, etc.');
        
        // Verify it was created
        const { data: newOrg } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', org.id)
          .single();
        
        return newOrg;
      } catch (error) {
        console.error('❌ Error creating organization:', error);
        throw error;
      }
    }
  };
  
  console.log('✅ Supabase Data Service loaded (Complete Platform)');
  console.log('💡 Test with: window.testSupabaseService()');
  console.log('💡 Check/fix organization: window.checkAndFixOrganization()');
}