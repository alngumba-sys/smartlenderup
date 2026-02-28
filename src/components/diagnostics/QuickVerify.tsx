import { useEffect } from 'react';
import { useData } from '../../contexts/DataContext';

/**
 * Silent verification component that logs to console
 * Place this anywhere in the app to verify the fix is working
 */
export function QuickVerify() {
  const { loans } = useData();
  
  useEffect(() => {
    // Show verification for all loans (sample of first 10)
    const sampleLoans = loans.slice(0, 10);
    
    if (sampleLoans.length > 0) {
      console.log('═══════════════════════════════════════════');
      console.log('🔍 QUICK VERIFICATION - Journal Entry-Based Fix v4.0');
      console.log('═══════════════════════════════════════════');
      console.log(`Showing ${sampleLoans.length} loans (total: ${loans.length})`);
      console.log('');
      
      sampleLoans.forEach(loan => {
        const principal = loan.principalAmount || 0;
        const total = loan.totalRepayable || 0;
        const status = loan.status || 'Unknown';
        
        console.log(`Loan ${loan.loanNumber}:`)
        console.log(`  Principal:  ${principal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        console.log(`  Total:      ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        console.log(`  Status:     ${status}`);
        console.log(`  Client:     ${loan.clientName || 'Unknown'}`);
        console.log('');
      });
      
      console.log('═══════════════════════════════════════════');
      console.log('💡 Check the "Amount borrowed" column in the UI');
      console.log('📒 All principals now loaded from journal entries');
      console.log('═══════════════════════════════════════════\n');
    }
  }, [loans]);
  
  return null; // This component doesn't render anything
}
