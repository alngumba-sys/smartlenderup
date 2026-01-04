/**
 * Detect Supabase Schema
 * 
 * Discovers which columns actually exist in your Supabase tables
 * so we can use only valid columns
 */

import { supabase } from '../lib/supabase';

/**
 * Test which columns exist in the clients table
 */
export async function detectClientColumns() {
  console.log('🔍 Detecting actual Supabase client columns...');
  
  // Try to get one client to see what columns exist
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Error querying clients table:', error);
    
    // If table doesn't exist or we can't query it, return minimal columns
    return {
      exists: false,
      columns: [],
      error: error.message
    };
  }
  
  // If we got data, extract column names
  const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
  
  console.log('✅ Detected columns:', columns);
  
  return {
    exists: true,
    columns: columns,
    sampleData: data && data.length > 0 ? data[0] : null
  };
}

/**
 * Get a safe client object that only uses existing columns
 */
export function getSafeClientObject(clientData: any, availableColumns: string[]) {
  const safe: any = {};
  
  // Mapping of our field names to possible Supabase column names
  const fieldMappings: Record<string, string[]> = {
    // Organization
    organization_id: ['organization_id', 'org_id', 'organisation_id'],
    
    // Client Identification
    id: ['id'],
    client_id: ['client_id', 'id'],
    client_number: ['client_number', 'client_no', 'number'],
    
    // Names
    first_name: ['first_name', 'firstname', 'fname', 'name'],
    last_name: ['last_name', 'lastname', 'lname', 'surname'],
    full_name: ['full_name', 'fullname', 'name'],
    business_name: ['business_name', 'company_name', 'name'],
    
    // Contact
    email: ['email', 'email_address'],
    phone: ['phone', 'phone_number', 'phone_primary', 'mobile', 'contact'],
    phone_primary: ['phone_primary', 'phone', 'phone_number', 'mobile'],
    phone_secondary: ['phone_secondary', 'phone2', 'alternate_phone'],
    
    // Identification
    id_number: ['id_number', 'national_id', 'id_no', 'identification'],
    id_type: ['id_type'],
    
    // Address
    address: ['address', 'physical_address', 'location'],
    physical_address: ['physical_address', 'address'],
    county: ['county', 'region'],
    town: ['town', 'city'],
    
    // Employment
    occupation: ['occupation', 'job', 'profession'],
    employer: ['employer', 'employer_name', 'company'],
    employer_name: ['employer_name', 'employer'],
    monthly_income: ['monthly_income', 'income', 'salary'],
    
    // Status
    status: ['status', 'account_status', 'client_status'],
    kyc_status: ['kyc_status', 'verification_status'],
    
    // Dates
    created_at: ['created_at', 'date_created', 'created'],
    updated_at: ['updated_at', 'date_updated', 'modified'],
    date_of_birth: ['date_of_birth', 'dob', 'birth_date'],
    
    // Other
    gender: ['gender', 'sex'],
    marital_status: ['marital_status'],
    next_of_kin_name: ['next_of_kin_name', 'nok_name', 'kin_name'],
    next_of_kin_phone: ['next_of_kin_phone', 'nok_phone', 'kin_phone'],
    next_of_kin_relationship: ['next_of_kin_relationship', 'nok_relationship', 'kin_relation']
  };
  
  // Helper function to find matching column
  const findColumn = (possibleNames: string[]): string | null => {
    for (const name of possibleNames) {
      if (availableColumns.includes(name)) {
        return name;
      }
    }
    return null;
  };
  
  // Map organization_id
  const orgIdCol = findColumn(fieldMappings.organization_id);
  if (orgIdCol && clientData.organizationId) {
    safe[orgIdCol] = clientData.organizationId;
  }
  
  // Map names
  const firstNameCol = findColumn(fieldMappings.first_name);
  const lastNameCol = findColumn(fieldMappings.last_name);
  const fullNameCol = findColumn(fieldMappings.full_name);
  
  if (firstNameCol) {
    safe[firstNameCol] = clientData.firstName || clientData.first_name || clientData.name?.split(' ')[0] || 'Unknown';
  }
  if (lastNameCol) {
    safe[lastNameCol] = clientData.lastName || clientData.last_name || clientData.name?.split(' ').slice(1).join(' ') || '';
  }
  if (fullNameCol && !firstNameCol) {
    safe[fullNameCol] = clientData.name || `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim();
  }
  
  // Map phone
  const phoneCol = findColumn(fieldMappings.phone_primary) || findColumn(fieldMappings.phone);
  if (phoneCol) {
    safe[phoneCol] = clientData.phone || clientData.phone_primary || '';
  }
  
  // Map email
  const emailCol = findColumn(fieldMappings.email);
  if (emailCol) {
    safe[emailCol] = clientData.email || '';
  }
  
  // Map ID number
  const idNumCol = findColumn(fieldMappings.id_number);
  if (idNumCol) {
    safe[idNumCol] = clientData.idNumber || clientData.id_number || '';
  }
  
  // Map address fields
  const addressCol = findColumn(fieldMappings.physical_address) || findColumn(fieldMappings.address);
  if (addressCol) {
    safe[addressCol] = clientData.address || clientData.physical_address || '';
  }
  
  const countyCol = findColumn(fieldMappings.county);
  if (countyCol) {
    safe[countyCol] = clientData.county || '';
  }
  
  const townCol = findColumn(fieldMappings.town);
  if (townCol) {
    safe[townCol] = clientData.town || clientData.city || '';
  }
  
  // Map status
  const statusCol = findColumn(fieldMappings.status);
  if (statusCol) {
    safe[statusCol] = clientData.status || 'active';
  }
  
  // Map timestamps
  const createdCol = findColumn(fieldMappings.created_at);
  if (createdCol) {
    safe[createdCol] = new Date().toISOString();
  }
  
  const updatedCol = findColumn(fieldMappings.updated_at);
  if (updatedCol) {
    safe[updatedCol] = new Date().toISOString();
  }
  
  return safe;
}

// Register global debug function
if (typeof window !== 'undefined') {
  (window as any).detectSupabaseSchema = detectClientColumns;
  console.log('💡 Detect Supabase schema with: window.detectSupabaseSchema()');
}
