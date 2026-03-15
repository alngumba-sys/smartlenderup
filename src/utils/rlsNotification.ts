/**
 * One-time RLS error notification
 * Shows only once per session to avoid spam
 */

let rlsErrorShown = false;

export function showRLSError() {
  if (!rlsErrorShown) {
    console.log('%c═══════════════════════════════════════════════════════', 'color: #f44336; font-weight: bold');
    console.log('%c🔒 RLS (Row Level Security) IS ENABLED', 'color: #f44336; font-weight: bold; font-size: 16px');
    console.log('%c═══════════════════════════════════════════════════════', 'color: #f44336; font-weight: bold');
    console.log('%c', 'font-size: 14px');
    console.log('%cTO FIX THIS:', 'color: #4caf50; font-weight: bold; font-size: 14px');
    console.log('%c1. Open /INSTRUCTIONS.html in your browser', 'color: #2196f3; font-size: 13px');
    console.log('%c2. Follow the steps to run SQL script in Supabase', 'color: #2196f3; font-size: 13px');
    console.log('%c3. Refresh this page', 'color: #2196f3; font-size: 13px');
    console.log('%c', 'font-size: 14px');
    console.log('%c═══════════════════════════════════════════════════════', 'color: #f44336; font-weight: bold');
    
    rlsErrorShown = true;
  }
}

export function resetRLSNotification() {
  rlsErrorShown = false;
}
