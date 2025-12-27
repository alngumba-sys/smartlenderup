import { supabase } from '../lib/supabase';

/**
 * Adds trial and subscription columns to the organizations table
 * Run this once: window.addTrialColumns()
 */
export async function addTrialColumns() {
  console.log('🔧 Adding trial columns to organizations table...');

  try {
    // Note: Supabase doesn't support ALTER TABLE via client
    // We need to use raw SQL via the SQL editor or RPC
    
    console.log('⚠️ MANUAL STEP REQUIRED:');
    console.log('Please run this SQL in your Supabase SQL Editor:');
    console.log('\n--- COPY THIS SQL ---\n');
    
    const sql = `
-- Add trial and subscription columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Add comment for documentation
COMMENT ON COLUMN organizations.trial_start_date IS 'Date when the trial started';
COMMENT ON COLUMN organizations.trial_end_date IS 'Date when the trial ends (14 days from start)';
COMMENT ON COLUMN organizations.subscription_status IS 'trial, active, expired, cancelled';
COMMENT ON COLUMN organizations.payment_status IS 'pending, paid, overdue';

-- Update existing organizations to have trial dates (14 days from created_at)
UPDATE organizations 
SET 
  trial_start_date = created_at,
  trial_end_date = created_at + INTERVAL '14 days',
  subscription_status = 'trial',
  payment_status = 'pending'
WHERE trial_start_date IS NULL;
`;

    console.log(sql);
    console.log('\n--- END SQL ---\n');
    
    console.log('📋 Steps:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Click "SQL Editor" in the left sidebar');
    console.log('3. Click "New query"');
    console.log('4. Copy and paste the SQL above');
    console.log('5. Click "Run" to execute');
    console.log('6. Refresh this page after running the SQL');
    
    return {
      success: false,
      message: 'Manual SQL execution required. See console for instructions.',
      sql
    };

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Register function globally
if (typeof window !== 'undefined') {
  (window as any).addTrialColumns = addTrialColumns;
  console.log('💡 Trial column migration ready! Type: window.addTrialColumns()');
}
