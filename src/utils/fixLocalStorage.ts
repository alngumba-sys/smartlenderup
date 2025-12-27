/**
 * Fix localStorage database structure
 * Run in console: window.fixLocalStorage()
 */

export const fixLocalStorage = () => {
  console.log('🔧 ===== FIXING LOCALSTORAGE =====');
  
  const dbData = localStorage.getItem('bv_funguo_db');
  
  if (!dbData) {
    console.log('📦 Creating new database structure...');
    const newDb = {
      organizations: [],
      users: [],
      clients: [],
      loans: [],
      loan_products: [],
      repayments: [],
      savings_accounts: [],
      shareholders: [],
      banks: [],
      expenses: [],
      tasks: [],
      notifications: [],
      payroll: [],
      journal_entries: [],
      chart_of_accounts: [],
      credit_score_history: [],
      settings: [],
      documents: [],
      loan_approval_workflows: []
    };
    localStorage.setItem('bv_funguo_db', JSON.stringify(newDb));
    console.log('✅ New database structure created');
  } else {
    console.log('📦 Database exists, checking structure...');
    const db = JSON.parse(dbData);
    
    let fixed = false;
    
    if (!db.organizations) {
      db.organizations = [];
      fixed = true;
      console.log('✅ Added organizations array');
    }
    
    if (fixed) {
      localStorage.setItem('bv_funguo_db', JSON.stringify(db));
      console.log('✅ Database structure fixed');
    } else {
      console.log('✅ Database structure is OK');
    }
    
    console.log('📊 Current organizations:', db.organizations?.length || 0);
  }
  
  console.log('🔧 ===== FIX COMPLETE =====');
  console.log('💡 Now try registering your organization again');
};

// Register globally for console access
if (typeof window !== 'undefined') {
  (window as any).fixLocalStorage = fixLocalStorage;
  console.log('💡 Fix tool ready! Type: window.fixLocalStorage()');
}
