/**
 * Update existing organization in Supabase to add password_hash field
 * This is needed for organizations created before the password field was added
 * 
 * Run in console: window.updateOrgPassword('your-org-email', 'your-password')
 */

import { supabase } from '../lib/supabase';

export const updateOrganizationPassword = async (email: string, password: string) => {
  console.log('🔄 ===== UPDATING ORGANIZATION PASSWORD =====');
  console.log('📧 Email:', email);
  
  try {
    // Find the organization
    const { data: orgs, error: findError } = await supabase
      .from('organizations')
      .select('*')
      .or(`email.eq.${email},contact_person_email.eq.${email}`)
      .limit(1);

    if (findError) {
      console.error('❌ Error finding organization:', findError);
      return;
    }

    if (!orgs || orgs.length === 0) {
      console.error('❌ Organization not found with email:', email);
      return;
    }

    const org = orgs[0];
    console.log('✅ Found organization:', org.organization_name);

    // Update the password
    const { data, error: updateError } = await supabase
      .from('organizations')
      .update({
        password_hash: password,
        username: org.username || org.contact_person_email?.split('@')[0].toUpperCase(),
        status: org.status || 'active'
      })
      .eq('id', org.id)
      .select();

    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      return;
    }

    console.log('✅ Password updated successfully!');
    console.log('🔐 You can now login with:');
    console.log('   Email:', org.email, 'OR', org.contact_person_email);
    console.log('   Password:', password);
    console.log('🔄 ===== UPDATE COMPLETE =====');

    return data;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
};

// Register globally for console access
if (typeof window !== 'undefined') {
  (window as any).updateOrgPassword = updateOrganizationPassword;
  console.log('💡 Password update tool ready! Usage: window.updateOrgPassword("your-email@domain.com", "YourPassword123")');
}
