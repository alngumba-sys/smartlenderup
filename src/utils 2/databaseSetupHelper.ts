// Database Setup Helper - Displays helpful setup instructions in console
import { supabase } from '../lib/supabase';

async function checkDatabaseSetup() {
  console.log('\n🔍 ===== CHECKING DATABASE SETUP =====\n');

  const issues: string[] = [];

  try {
    // Check contact_messages table
    const { error: contactError } = await supabase
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (contactError) {
      if (contactError.message.includes('does not exist') || contactError.message.includes('404')) {
        issues.push('❌ contact_messages table is missing');
        console.error('❌ contact_messages table not found');
      } else {
        console.error('⚠️ contact_messages error:', contactError.message);
      }
    } else {
      console.log('✅ contact_messages table exists');
    }

    // Check pricing_config table and trial_days column
    const { data, error: pricingError } = await supabase
      .from('pricing_config')
      .select('trial_days')
      .limit(1);

    if (pricingError) {
      if (pricingError.message.includes('column')) {
        issues.push('❌ pricing_config.trial_days column is missing');
        console.error('❌ pricing_config.trial_days column not found');
      } else if (pricingError.message.includes('does not exist')) {
        issues.push('❌ pricing_config table is missing');
        console.error('❌ pricing_config table not found');
      } else {
        console.error('⚠️ pricing_config error:', pricingError.message);
      }
    } else {
      console.log('✅ pricing_config.trial_days column exists');
    }

  } catch (err) {
    console.error('⚠️ Error checking database:', err);
  }

  console.log('\n');

  if (issues.length > 0) {
    console.log('🚨 ===== DATABASE SETUP REQUIRED =====\n');
    console.log('The following issues were found:\n');
    issues.forEach(issue => console.log(issue));
    console.log('\n📋 TO FIX:\n');
    console.log('1. Open Supabase SQL Editor: https://supabase.com/dashboard');
    console.log('2. Copy SQL from: /supabase-setup.sql');
    console.log('3. Run the query');
    console.log('4. Refresh this page\n');
    console.log('📖 Detailed instructions: /DATABASE-SETUP-GUIDE.md');
    console.log('⚡ Quick reference: /QUICK-FIX.md\n');
    console.log('=====================================\n');
  } else {
    console.log('✅ ===== DATABASE SETUP COMPLETE =====');
    console.log('All required tables and columns exist!\n');
  }
}

// Auto-run on import
checkDatabaseSetup();

// Export for manual checks
export { checkDatabaseSetup };
