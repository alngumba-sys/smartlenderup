#!/usr/bin/env node

/**
 * Fix all sonner@2.0.3 imports to just 'sonner'
 * This resolves WebAssembly compilation errors caused by version specifier syntax
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  './components/tabs/ClientsTab.tsx',
  './components/tabs/LoansTab.tsx',
  './components/tabs/PaymentsTab.tsx',
  './components/tabs/AuditTrailTab.tsx',
  './components/tabs/DocumentsTab.tsx',
  './components/tabs/AccountingTab.tsx',
  './components/tabs/CollectionSheetsTab.tsx',
  './components/tabs/BankAccountsTab.tsx',
  './components/tabs/DocumentManagementTab.tsx',
  './components/tabs/InstitutionsTab.tsx',
  './components/tabs/PayrollCommissionsTab.tsx',
  './components/client-tabs/ClientApplyTab.tsx',
  './components/client-tabs/ClientProfileTab.tsx',
  './components/client-tabs/ClientPaymentsTab.tsx',
  './components/LoanDetailsModal.tsx',
  './components/ClientDetailsModal.tsx',
  './components/modals/CreditScoringParametersModal.tsx',
  './components/modals/AddGuarantorModal.tsx',
  './components/modals/AddCollateralModal.tsx',
  './components/modals/ShareholderModals.tsx',
  './components/modals/AddPayrollModal.tsx',
  './components/modals/DisbursementModal.tsx',
  './components/modals/AddLoanDocumentModal.tsx',
  './components/modals/ComprehensiveLoanDetailsModal.tsx',
  './components/modals/NewLoanModal.tsx',
  './components/modals/AssignClientsModal.tsx',
  './components/modals/StaffAssignmentsModal.tsx',
  './components/modals/SaveCommissionPopup.tsx',
  './components/modals/ProfileModal.tsx',
  './components/LoginPage.tsx',
  './components/superadmin/SettingsTab.tsx',
  './components/ai/AIRemindersPanel.tsx',
  './components/ai/ExecutiveSummary.tsx',
  './components/ai/BankReconciliation.tsx',
  './components/DataBackupPanel.tsx',
  './components/DataRecoveryTool.tsx',
  './components/CheckoutForm.tsx',
  './components/LoanProductDiagnostic.tsx',
  './components/LoanProductDebugPanel.tsx',
  './components/SchemaMigrationPanel.tsx',
  './components/PricingControlPanel.tsx',
  './components/ContactMessagesView.tsx',
  './components/DatabaseSetupNotice.tsx',
  './components/DevMigrationPanel.tsx',
  './components/StaffManagement.tsx',
  './components/StaffLogin.tsx',
  './components/DataImportExport.tsx',
  './components/ClientLogin.tsx',
  './components/ClientLoanNotificationCard.tsx',
  './components/diagnostics/LoanStatusDiagnostic.tsx',
];

let fixedCount = 0;
let errorCount = 0;

filesToFix.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      const originalContent = content;
      
      // Replace all instances of 'sonner@2.0.3' with 'sonner'
      content = content.replace(/from ['"]sonner@2\.0\.3['"]/g, "from 'sonner'");
      
      if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`✅ Fixed: ${file}`);
        fixedCount++;
      } else {
        console.log(`⏭️  Skipped (no changes): ${file}`);
      }
    } else {
      console.log(`⚠️  Not found: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Fixed: ${fixedCount} files`);
console.log(`   ❌ Errors: ${errorCount} files`);
console.log(`\n🎉 Done! Run: npm install && npm run dev`);
