import { toast } from 'sonner';

/**
 * Shows helpful migration instructions on app load if trial columns are missing
 */
export function showTrialMigrationHelp() {
  // Only show once per session
  const shownKey = 'trial_migration_help_shown';
  if (sessionStorage.getItem(shownKey)) {
    return;
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 TRIAL SYSTEM SETUP INSTRUCTIONS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('If you see "column trial_start_date does not exist" errors:');
  console.log('');
  console.log('STEP 1: Run this command in browser console:');
  console.log('  window.addTrialColumns()');
  console.log('');
  console.log('STEP 2: Copy the SQL from console output');
  console.log('');
  console.log('STEP 3: Go to Supabase Dashboard > SQL Editor');
  console.log('');
  console.log('STEP 4: Paste and run the SQL');
  console.log('');
  console.log('STEP 5: Refresh this page');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  sessionStorage.setItem(shownKey, 'true');
}

// Auto-show on import (for initial setup guidance)
if (typeof window !== 'undefined') {
  // Disabled auto-show to avoid annoyance - users can call window.addTrialColumns() if needed
  // setTimeout(() => {
  //   showTrialMigrationHelp();
  // }, 2000);
}