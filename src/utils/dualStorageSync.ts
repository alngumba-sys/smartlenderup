import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

/**
 * ============================================
 * DUAL STORAGE SYNC PATTERN
 * ============================================
 * 
 * This utility saves data to BOTH:
 * 1. project_states table (JSON blob) - for fast bulk operations
 * 2. Individual tables (normalized) - for Super Admin queries
 * 
 * This ensures compatibility with both the manager view
 * (using project_states) and Super Admin view (using individual tables)
 */

// ============================================
// SYNC FUNCTIONS
// ============================================

/**
 * Sync clients to individual 'clients' table
 */
export async function syncClientsToTable(
  userId: string,
  organizationId: string,
  clients: any[]
): Promise<boolean> {
  try {
    if (!clients || clients.length === 0) {
      console.log('ℹ️ No clients to sync');
      return true;
    }

    // Delete existing clients for this organization
    await supabase
      .from('clients')
      .delete()
      .eq('organization_id', organizationId);

    // Insert all clients - ONLY use fields that exist in Supabase schema
    const clientRecords = clients.map(client => {
      // ✅ FIX: Parse firstName/lastName from name if not present
      let firstName = client.firstName || client.first_name || '';
      let lastName = client.lastName || client.last_name || '';
      
      // If firstName/lastName are missing but name exists, parse it
      if ((!firstName || !lastName) && client.name) {
        const nameParts = client.name.trim().split(' ');
        firstName = firstName || nameParts[0] || '';
        lastName = lastName || nameParts.slice(1).join(' ') || '';
      }
      
      // Construct full name from firstName + lastName
      const fullName = client.name || `${firstName} ${lastName}`.trim() || 'Unknown Client';
      
      // Handle ID: If client.id is in "CL" format, it should go to client_number
      // For the UUID id field, we'll let Supabase auto-generate it
      const isClientNumberFormat = typeof client.id === 'string' && client.id.startsWith('CL');
      const clientNumber = isClientNumberFormat 
        ? client.id 
        : (client.clientId || client.client_number || `CL${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`);
      
      const record: any = {
        // Don't set id - let Supabase auto-generate UUID
        // id will be auto-generated as UUID by database
        organization_id: organizationId,
        // ONLY INCLUDE FIELDS THAT ACTUALLY EXIST IN SUPABASE SCHEMA:
        client_number: clientNumber,
        first_name: firstName || 'Unknown',
        last_name: lastName || '',
        name: fullName,
        phone: client.phone || '',
        date_of_birth: client.dateOfBirth || client.date_of_birth || null,
        county: client.county || '',
        town: client.town || '',
        address: client.address || '',
        occupation: client.occupation || '',
        monthly_income: client.monthlyIncome || client.monthly_income || 0,
        kyc_status: client.kycStatus || client.kyc_status || 'pending',
        status: (client.status || 'active').toLowerCase(),
        created_at: client.createdAt || client.created_at || new Date().toISOString(),
        updated_at: client.updatedAt || client.updated_at || new Date().toISOString(),
      };
      
      // Optional fields - only add if they exist in BOTH client data AND schema
      if (client.email) record.email = client.email;
      if (client.employer) record.employer = client.employer;
      if (client.phone_secondary || client.phoneSecondary) {
        record.phone_secondary = client.phone_secondary || client.phoneSecondary;
      }
      if (client.sub_county || client.subCounty) {
        record.sub_county = client.sub_county || client.subCounty;
      }
      if (client.ward) record.ward = client.ward;
      if (client.id_number || client.idNumber) {
        record.id_number = client.id_number || client.idNumber;
      }
      if (client.id_type || client.idType) {
        record.id_type = client.id_type || client.idType;
      }
      if (client.employer_phone || client.employerPhone) {
        record.employer_phone = client.employer_phone || client.employerPhone;
      }
      if (client.business_name || client.businessName) {
        record.business_name = client.business_name || client.businessName;
      }
      if (client.business_type || client.businessType) {
        record.business_type = client.business_type || client.businessType;
      }
      if (client.business_location || client.businessLocation) {
        record.business_location = client.business_location || client.businessLocation;
      }
      if (client.years_in_business || client.yearsInBusiness) {
        record.years_in_business = client.years_in_business || client.yearsInBusiness;
      }
      if (client.next_of_kin_name || client.nextOfKinName) {
        record.next_of_kin_name = client.next_of_kin_name || client.nextOfKinName;
      }
      if (client.next_of_kin_phone || client.nextOfKinPhone) {
        record.next_of_kin_phone = client.next_of_kin_phone || client.nextOfKinPhone;
      }
      if (client.next_of_kin_relationship || client.nextOfKinRelationship) {
        record.next_of_kin_relationship = client.next_of_kin_relationship || client.nextOfKinRelationship;
      }
      if (client.verification_status || client.verificationStatus) {
        record.verification_status = client.verification_status || client.verificationStatus;
      }
      if (client.photo_url || client.photoUrl) {
        record.photo_url = client.photo_url || client.photoUrl;
      }
      
      // Gender - validate and convert to lowercase
      if (client.gender && ['male', 'female', 'other'].includes(client.gender.toLowerCase())) {
        record.gender = client.gender.toLowerCase();
      }
      
      // Marital status - validate and convert to lowercase
      if (client.maritalStatus && ['single', 'married', 'divorced', 'widowed'].includes(client.maritalStatus.toLowerCase())) {
        record.marital_status = client.maritalStatus.toLowerCase();
      } else if (client.marital_status && ['single', 'married', 'divorced', 'widowed'].includes(client.marital_status.toLowerCase())) {
        record.marital_status = client.marital_status.toLowerCase();
      }
      
      return record;
    });

    const { error } = await supabase
      .from('clients')
      .insert(clientRecords);

    if (error) {
      console.error('❌ Error syncing clients:', error);
      return false;
    }

    console.log(`✅ Synced ${clients.length} clients to table`);
    return true;
  } catch (error) {
    console.error('❌ Exception syncing clients:', error);
    return false;
  }
}

/**
 * Sync all entities from project state to individual tables
 * This is the main function that orchestrates syncing all data types
 */
export async function syncAllEntitiesToTables(
  userId: string,
  organizationId: string,
  projectState: any
): Promise<boolean> {
  try {
    console.log('🔄 Starting sync to individual tables...');
    
    // Sync clients
    if (projectState.clients && projectState.clients.length > 0) {
      const clientsSuccess = await syncClientsToTable(userId, organizationId, projectState.clients);
      if (!clientsSuccess) {
        console.error('❌ Failed to sync clients');
        return false;
      }
    }
    
    // TODO: Add other entity syncs here when needed:
    // - syncLoansToTable
    // - syncRepaymentsToTable
    // - syncLoanProductsToTable
    // - etc.
    
    console.log('✅ All entities synced successfully');
    return true;
  } catch (error) {
    console.error('❌ Exception syncing entities:', error);
    return false;
  }
}