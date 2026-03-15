/**
 * Check RLS status on startup and show helpful message if needed
 */

import { supabase } from '../lib/supabase';

let hasChecked = false;

export async function checkRLSOnStartup(): Promise<void> {
  // Only check once per session
  if (hasChecked) return;
  hasChecked = true;

  try {
    // Try a simple query to test RLS
    const { error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);

    if (error && error.code === '42501') {
      // RLS is blocking access
      showRLSMessage();
    }
  } catch (err) {
    // Silently fail - don't block app
  }
}

function showRLSMessage(): void {
  console.log('');
  console.log('%c╔════════════════════════════════════════════════════════════════╗', 'color: #ff9800; font-weight: bold');
  console.log('%c║  🔒 ROW LEVEL SECURITY (RLS) IS ENABLED                       ║', 'color: #ff9800; font-weight: bold');
  console.log('%c╚════════════════════════════════════════════════════════════════╝', 'color: #ff9800; font-weight: bold');
  console.log('');
  console.log('%c📋 TO FIX THIS:', 'color: #4caf50; font-weight: bold; font-size: 14px');
  console.log('');
  console.log('%c  1. Open: /INSTRUCTIONS.html', 'color: #2196f3; font-size: 13px');
  console.log('%c  2. Copy the SQL script', 'color: #2196f3; font-size: 13px');
  console.log('%c  3. Run it in Supabase SQL Editor', 'color: #2196f3; font-size: 13px');
  console.log('%c  4. Refresh this page', 'color: #2196f3; font-size: 13px');
  console.log('');
  console.log('%c⏱️  Takes only 2 minutes!', 'color: #4caf50; font-weight: bold');
  console.log('');
  console.log('%cYour app will work normally in the meantime using local storage.', 'color: #666; font-style: italic');
  console.log('');
}
