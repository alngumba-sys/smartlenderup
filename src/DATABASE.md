# SmartLenderUp Database Structure

## Overview
This file documents the local storage database structure used in Figma Make for testing. This structure is designed to mirror the Supabase database schema for seamless migration.

## Database Tables (17 Core Tables)

### 1. Organizations
Main table for organization accounts
- **Primary Key**: `id` (string, format: ORG-timestamp-random)
- **Unique**: `username` (4-digit alphanumeric for login)
- **Fields**: organization_name, registration_number, industry, organization_type, country, currency, email, phone, alternative_phone, website, county, town, address, postal_code, date_of_incorporation, organization_logo, contact_person details, number_of_employees, expected_clients, description, password_hash, status, timestamps

### 2. Users
Staff/employee accounts within organizations
- **Primary Key**: `id` (string, format: USR-timestamp-random)
- **Foreign Key**: `organization_id` → Organizations
- **Fields**: username, email, phone, first_name, last_name, role, password_hash, status, timestamps

### 3. Clients
Individual or group clients
- **Primary Key**: `id` (string, format: CLT-timestamp-random)
- **Foreign Key**: `organization_id` → Organizations
- **Fields**: client_type, client_number, first_name, last_name, group_name, id_number, phone, email, date_of_birth, gender, marital_status, county, sub_county, ward, village, address, credit_score, credit_tier, status, timestamps

### 4. Loans
Loan applications and active loans
- **Primary Key**: `id` (string, format: LN-timestamp-random)
- **Foreign Keys**: 
  - `organization_id` → Organizations
  - `client_id` → Clients
  - `loan_product_id` → LoanProducts
- **Fields**: loan_number, principal_amount, interest_rate, loan_term_months, disbursement_date, maturity_date, repayment_frequency, loan_purpose, collateral_type, collateral_value, phase, status, total_repayable, total_paid, balance, timestamps

### 5. LoanProducts
Loan product configurations
- **Primary Key**: `id` (string, format: LP-timestamp-random)
- **Foreign Key**: `organization_id` → Organizations
- **Fields**: product_name, product_code, description, min_amount, max_amount, min_term_months, max_term_months, interest_rate, interest_type, processing_fee_percentage, processing_fee_fixed, min_credit_score, status, timestamps

### 6. Repayments
Loan repayment transactions
- **Primary Key**: `id` (string, format: REP-timestamp-random)
- **Foreign Keys**: 
  - `organization_id` → Organizations
  - `loan_id` → Loans
- **Fields**: payment_date, amount, payment_method, transaction_reference, principal_paid, interest_paid, penalty_paid, status, timestamps

### 7. SavingsAccounts
Client savings accounts
- **Primary Key**: `id` (string, format: SAV-timestamp-random)
- **Foreign Keys**: 
  - `organization_id` → Organizations
  - `client_id` → Clients
- **Fields**: account_number, account_type, balance, interest_rate, status, timestamps

### 8. Transactions
Savings account transactions
- **Primary Key**: `id` (string, format: TXN-timestamp-random)
- **Foreign Keys**: 
  - `organization_id` → Organizations
  - `account_id` → SavingsAccounts
- **Fields**: transaction_type, amount, balance_after, transaction_date, description, reference, created_at

### 9. GroupMembers
Members of group clients
- **Primary Key**: `id` (string, format: GM-timestamp-random)
- **Foreign Keys**: 
  - `organization_id` → Organizations
  - `group_id` → Clients
  - `member_id` → Clients
- **Fields**: role, join_date, status, created_at

### 10. Collateral
Loan collateral records
- **Primary Key**: `id` (string, format: COL-timestamp-random)
- **Foreign Keys**: 
  - `organization_id` → Organizations
  - `loan_id` → Loans
- **Fields**: collateral_type, description, estimated_value, verification_status, timestamps

### 11. AuditLogs
System audit trail
- **Primary Key**: `id` (string, format: AUD-timestamp-random)
- **Foreign Keys**: 
  - `organization_id` → Organizations
  - `user_id` → Users
- **Fields**: action, entity_type, entity_id, changes (JSON), ip_address, created_at

### 12. Notifications
User/client notifications
- **Primary Key**: `id` (string, format: NOT-timestamp-random)
- **Foreign Keys**: 
  - `organization_id` → Organizations
  - `user_id` → Users (optional)
  - `client_id` → Clients (optional)
- **Fields**: type, title, message, read (boolean), created_at

### 13. MPesaTransactions
M-Pesa integration transactions
- **Primary Key**: `id` (string, format: MP-timestamp-random)
- **Foreign Key**: `organization_id` → Organizations
- **Fields**: transaction_type, mpesa_receipt_number, phone_number, amount, account_reference, transaction_date, status, created_at

### 14. CreditScoreHistory
Credit score calculation history
- **Primary Key**: `id` (string, format: CS-timestamp-random)
- **Foreign Keys**: 
  - `organization_id` → Organizations
  - `client_id` → Clients
- **Fields**: score, tier, factors (JSON), calculated_at

### 15. Settings
Organization-specific settings
- **Primary Key**: `id` (string, format: SET-timestamp-random)
- **Foreign Key**: `organization_id` → Organizations
- **Fields**: setting_key, setting_value (any), updated_at

### 16. Documents
Uploaded documents
- **Primary Key**: `id` (string, format: DOC-timestamp-random)
- **Foreign Keys**: 
  - `organization_id` → Organizations
  - `entity_id` → (various, based on entity_type)
- **Fields**: entity_type, document_type, file_name, file_url, uploaded_by, created_at

### 17. LoanApprovalWorkflows
Loan approval workflow tracking
- **Primary Key**: `id` (string, format: LAW-timestamp-random)
- **Foreign Keys**: 
  - `organization_id` → Organizations
  - `loan_id` → Loans
  - `reviewer_id` → Users (optional)
- **Fields**: phase, status, reviewer_name, comments, reviewed_at, created_at

## Credit Scoring System

### Credit Score Tiers
The platform uses a standardized 5-tier credit scoring system:

| Tier | Score Range | Color | Hex Code |
|------|-------------|-------|----------|
| Poor | 300-579 | Orange | #ec7347 |
| Fair | 580-669 | Yellow | #eab308 |
| Good | 670-739 | Cyan | #06b6d4 |
| Very Good | 740-799 | Blue | #3b82f6 |
| Excellent | 800-850 | Green | #22c55e |

**Minimum Credit Score**: 300 (all clients)

## Loan Approval Workflow Phases

1. **Application** - Initial loan application submission
2. **Review** - Loan officer reviews application and documents
3. **Approval** - Management approval/rejection decision
4. **Disbursement** - Funds disbursement to client
5. **Repayment** - Active loan repayment tracking

## Authentication

### Organization Login
- **Username**: 4-digit alphanumeric code (e.g., "A2K9")
- **Password**: User-defined during registration
- Auto-generated username shown in success modal after registration

### Demo Accounts (for testing)
- **Admin**: Username: `12345`, Password: `Test@1234`
- **Employee**: Username: `employee@bvfunguo.co.ke` or `0712345678`, Password: `Employee@123`

## Database Operations

### Available Methods
- `createOrganization(data)` - Create new organization
- `getOrganizationByUsername(username)` - Find organization by username
- `authenticate(username, password)` - Verify credentials
- `createClient(data)` - Create new client
- `createLoan(data)` - Create new loan
- `createRepayment(data)` - Record repayment
- And many more...

### Utility Functions
- `generateId(prefix)` - Generate unique IDs
- `generateUsername()` - Generate 4-digit alphanumeric username
- `clearDatabase()` - Clear all data
- `exportDatabase()` - Export as JSON
- `importDatabase(data)` - Import from JSON

## Migration to Supabase

The local storage structure exactly mirrors the Supabase schema:
- All field names match Supabase column names
- All foreign key relationships are preserved
- All data types are compatible
- ID generation can be switched to Supabase's UUID format
- Password hashing can be implemented before migration

## Testing Tools

### Database Viewer Component
A floating purple button appears on the login page providing:
- View all organizations with their usernames and passwords
- Export database as JSON
- Clear all data
- View database statistics
- Toggle password visibility

Access it by clicking the purple database icon in the bottom-right corner of the login page.
