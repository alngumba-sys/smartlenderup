/**
 * One-time sync of current organization to Supabase
 * Run this in browser console: window.syncOrganization()
 */

import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

export const syncOrganizationToSupabase = async () => {
  try {
    // Get current organization from localStorage
    const orgData = localStorage.getItem('current_organization');
    
    if (!orgData) {
      console.error('No organization found in localStorage');
      toast.error('No organization found', {
        description: 'Please create an organization first'
      });
      return { success: false, error: 'No organization data' };
    }

    const org = JSON.parse(orgData);
    console.log('📤 Syncing organization to Supabase:', org.organizationName);

    // Map localStorage organization data to Supabase schema
    const supabaseOrg = {
      id: org.id, // Use the UUID from registration
      organization_name: org.organizationName,
      registration_number: org.registrationNumber || null,
      industry: org.industry,
      organization_type: org.organizationType,
      country: org.country,
      currency: org.currency,
      email: org.email,
      phone: org.phone,
      alternative_phone: org.alternativePhone || null,
      website: org.website || null,
      county: org.county,
      town: org.town,
      address: org.address,
      postal_code: org.postalCode || null,
      date_of_incorporation: org.dateOfIncorporation,
      organization_logo: org.organizationLogo || null,
      contact_person_first_name: org.contactPersonFirstName,
      contact_person_last_name: org.contactPersonLastName,
      contact_person_title: org.contactPersonTitle,
      contact_person_email: org.contactPersonEmail,
      contact_person_phone: org.contactPersonPhone,
      number_of_employees: org.numberOfEmployees || null,
      expected_clients: org.expectedClients || null,
      description: org.description || null,
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('organizations')
      .upsert(supabaseOrg, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('❌ Error syncing organization:', error);
      toast.error('Sync Failed', {
        description: error.message
      });
      return { success: false, error };
    }

    console.log('✅ Organization synced successfully!', data);
    toast.success('Organization Synced!', {
      description: `${org.organizationName} is now in Supabase`,
      duration: 5000
    });

    return { success: true, data };
  } catch (error) {
    console.error('❌ Error syncing organization:', error);
    toast.error('Sync Failed', {
      description: 'Check console for details'
    });
    return { success: false, error };
  }
};

// Register globally for console access
if (typeof window !== 'undefined') {
  (window as any).syncOrganization = syncOrganizationToSupabase;
  console.log('💡 Organization sync ready! Type: window.syncOrganization()');
}
