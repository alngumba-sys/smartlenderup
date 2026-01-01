# Organization Name & Logo Dynamic Update Summary

## ✅ Completed Updates

### 1. Core Utilities
- `/utils/organizationUtils.ts` - Added `getOrganizationLogo()` function

### 2. Main Application
- `/App.tsx` - Updated header to use dynamic organization name, logo, and country-based tagline

### 3. Reports (Updated)
- `/components/reports/CollectionsReport.tsx` - Now uses dynamic organization name and logo

## 📋 Files Still Need Updates

The following files contain hardcoded "BV FUNGUO LTD" references and need to be updated to use `getOrganizationName()` and `getOrganizationLogo()`:

### Reports (6 files)
1. `/components/reports/CashFlowReport.tsx` - 2 occurrences
2. `/components/reports/ProfitLossReport.tsx` - 2 occurrences  
3. `/components/reports/PARReport.tsx` - 1 occurrence
4. `/components/reports/BalanceSheetReport.tsx` - 2 occurrences
5. `/components/reports/IncomeStatementReport.tsx` - 2 occurrences
6. `/components/reports/TrialBalanceReport.tsx` - 2 occurrences
7. `/components/reports/RegulatoryReport.tsx` - 3 occurrences
8. `/components/reports/ManagementReport.tsx` - 4 occurrences

### Main Components (2 files)
9. `/components/LoginPage.tsx` - 1 occurrence (default parameter)
10. `/components/PrintableStatement.tsx` - 1 occurrence

### Tab Components (8 files)
11. `/components/tabs/DashboardTab.tsx` - 5 occurrences (in descriptions)
12. `/components/tabs/ClientsTab.tsx` - 8 occurrences (in SMS/email templates and descriptions)
13. `/components/tabs/PaymentsTab.tsx` - 1 occurrence
14. `/components/tabs/GroupsTab.tsx` - 1 occurrence
15. `/components/tabs/AccountingTab.tsx` - 1 occurrence (Trial Balance header)
16. `/components/tabs/SavingsReportsTab.tsx` - 1 occurrence (comment)
17. `/components/tabs/CollectionSheetsTab.tsx` - 3 occurrences (SMS/email templates)

### Client Tab Components (3 files)
18. `/components/client-tabs/ClientHomeTab.tsx` - 1 occurrence
19. `/components/client-tabs/ClientApplyTab.tsx` - 1 occurrence
20. `/components/client-tabs/ClientProfileTab.tsx` - 1 occurrence

### Modals (1 file)
21. `/components/modals/RiskFactorModal.tsx` - 1 occurrence

### Data Files (1 file)  
22. `/data/dummyData.ts` - 2 occurrences (comments only)

## 🔧 Required Changes Pattern

For each file, you need to:

1. **Add imports** at the top:
```typescript
import { getOrganizationName, getOrganizationLogo } from '../utils/organizationUtils';
// or '../../utils/organizationUtils' depending on file location
```

2. **Get organization data** in the component:
```typescript
const organizationName = getOrganizationName();
const organizationLogo = getOrganizationLogo();
```

3. **Replace hardcoded text**:
   - Replace `"BV FUNGUO LTD"` with `{organizationName}`
   - Replace `alt="BV FUNGUO LTD Logo"` with `alt="Organization Logo"` or `alt={\`\${organizationName} Logo\`}`
   - Replace `src={logo}` with `src={organizationLogo || logo}` (with fallback)

4. **For SMS/Email templates**, use template literals:
```typescript
defaultValue={`Dear [Client Name], ... - ${organizationName}`}
```

## Priority Order

1. **HIGH**: All report components (users will print these)
2. **MEDIUM**: Main components (LoginPage, PrintableStatement)
3. **LOW**: Tab components (mostly in help text and templates)
4. **IGNORE**: Data files (comments only)

## Notes

- The logo should always have a fallback to the default logo if organization hasn't uploaded one
- Make sure to use the correct relative import path based on file location
- SMS and email templates should be updated to use dynamic organization name
- Comments in data files can be left as-is or updated for consistency
