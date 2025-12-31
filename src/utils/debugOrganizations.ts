/**
 * Debug utility to check organizations in localStorage
 * Run in console: window.debugOrgs()
 */

export const debugOrganizations = () => {
  console.log('🔍 ===== ORGANIZATION DEBUG =====');
  
  const dbData = localStorage.getItem('bv_funguo_db');
  
  if (!dbData) {
    console.log('❌ No database found in localStorage');
    return;
  }
  
  try {
    const db = JSON.parse(dbData);
    console.log('📦 Database structure:', Object.keys(db));
    console.log('🏢 Total organizations:', db.organizations?.length || 0);
    
    if (db.organizations && db.organizations.length > 0) {
      console.log('\n📋 Organization Details:');
      db.organizations.forEach((org: any, index: number) => {
        console.log(`\n--- Organization ${index + 1} ---`);
        console.log('ID:', org.id);
        console.log('Name:', org.organization_name);
        console.log('Email:', org.email);
        console.log('Contact Email:', org.contact_person_email);
        console.log('Username:', org.username);
        console.log('Password Hash:', org.password_hash);
        console.log('Status:', org.status);
        console.log('\n✅ Login Credentials:');
        console.log('  Email:', org.email);
        console.log('  OR Contact Email:', org.contact_person_email);
        console.log('  Password:', org.password_hash);
      });
    } else {
      console.log('❌ No organizations found in database');
    }
    
    console.log('\n🔍 ===== END DEBUG =====');
  } catch (error) {
    console.error('❌ Error parsing database:', error);
  }
};

// Register globally for console access
if (typeof window !== 'undefined') {
  (window as any).debugOrgs = debugOrganizations;
  console.log('💡 Debug tool ready! Type: window.debugOrgs()');
}
