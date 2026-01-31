// Local Storage Database Utility
// This mirrors the Supabase database structure for seamless migration

// ==================== TYPES ====================

export interface Organization {
  id: string;
  username: string; // 4-digit alphanumeric for login
  organization_name: string;
  registration_number: string;
  industry: string;
  organization_type: string;
  country: string;
  currency: string;
  email: string;
  phone: string;
  alternative_phone?: string;
  website?: string;
  county: string;
  town: string;
  address: string;
  postal_code?: string;
  date_of_incorporation?: string;
  organization_logo?: string;
  contact_person_first_name: string;
  contact_person_last_name: string;
  contact_person_title: string;
  contact_person_email: string;
  contact_person_phone: string;
  number_of_employees?: number;
  expected_clients?: number;
  description?: string;
  password_hash: string; // In real app, this would be hashed
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  username: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'loan_officer' | 'accountant' | 'support';
  password_hash: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  organization_id: string;
  client_type: 'individual' | 'group';
  client_number: string;
  first_name?: string;
  last_name?: string;
  group_name?: string;
  id_number: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  marital_status?: string;
  county: string;
  sub_county?: string;
  ward?: string;
  village?: string;
  address: string;
  credit_score: number;
  credit_tier: 'poor' | 'fair' | 'good' | 'very_good' | 'excellent';
  status: 'active' | 'inactive' | 'blacklisted';
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  organization_id: string;
  client_id: string;
  loan_number: string;
  loan_product_id: string;
  principal_amount: number;
  interest_rate: number;
  loan_term_months: number;
  disbursement_date?: string;
  maturity_date?: string;
  repayment_frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  loan_purpose: string;
  collateral_type?: string;
  collateral_value?: number;
  phase: 'application' | 'review' | 'approval' | 'disbursement' | 'repayment';
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'completed' | 'defaulted' | 'written_off';
  total_repayable: number;
  total_paid: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface LoanProduct {
  id: string;
  organization_id: string;
  product_name: string;
  product_code: string;
  description?: string;
  min_amount: number;
  max_amount: number;
  min_term_months: number;
  max_term_months: number;
  interest_rate: number;
  interest_type: 'flat' | 'reducing_balance';
  processing_fee_percentage?: number;
  processing_fee_fixed?: number;
  min_credit_score: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Repayment {
  id: string;
  organization_id: string;
  loan_id: string;
  payment_date: string;
  amount: number;
  payment_method: 'm-pesa' | 'bank_transfer' | 'cash' | 'cheque';
  transaction_reference?: string;
  principal_paid: number;
  interest_paid: number;
  penalty_paid: number;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  created_at: string;
  updated_at: string;
}

export interface SavingsAccount {
  id: string;
  organization_id: string;
  client_id: string;
  account_number: string;
  account_type: string;
  balance: number;
  interest_rate: number;
  status: 'active' | 'inactive' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  organization_id: string;
  account_id: string;
  transaction_type: 'deposit' | 'withdrawal' | 'interest' | 'fee';
  amount: number;
  balance_after: number;
  transaction_date: string;
  description?: string;
  reference?: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  organization_id: string;
  group_id: string;
  member_id: string;
  role: 'chairperson' | 'secretary' | 'treasurer' | 'member';
  join_date: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Collateral {
  id: string;
  organization_id: string;
  loan_id: string;
  collateral_type: string;
  description: string;
  estimated_value: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes?: any;
  ip_address?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  organization_id: string;
  user_id?: string;
  client_id?: string;
  type: 'loan_approved' | 'payment_due' | 'payment_received' | 'loan_overdue' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface MPesaTransaction {
  id: string;
  organization_id: string;
  transaction_type: 'paybill' | 'till' | 'b2c';
  mpesa_receipt_number: string;
  phone_number: string;
  amount: number;
  account_reference?: string;
  transaction_date: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface CreditScoreHistory {
  id: string;
  organization_id: string;
  client_id: string;
  score: number;
  tier: 'poor' | 'fair' | 'good' | 'very_good' | 'excellent';
  factors: any;
  calculated_at: string;
}

export interface Settings {
  id: string;
  organization_id: string;
  setting_key: string;
  setting_value: any;
  updated_at: string;
}

export interface Document {
  id: string;
  organization_id: string;
  entity_type: 'client' | 'loan' | 'organization';
  entity_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
}

export interface LoanApprovalWorkflow {
  id: string;
  organization_id: string;
  loan_id: string;
  phase: 'application' | 'review' | 'approval' | 'disbursement' | 'repayment';
  status: 'pending' | 'approved' | 'rejected';
  reviewer_id?: string;
  reviewer_name?: string;
  comments?: string;
  reviewed_at?: string;
  created_at: string;
}

// ==================== DATABASE CLASS ====================

class Database {
  private storageKey = 'smartlenderup_db';

  private getDB() {
    const data = localStorage.getItem(this.storageKey);
    if (!data) {
      return this.initDB();
    }
    return JSON.parse(data);
  }

  private saveDB(db: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(db));
  }

  private initDB() {
    const db = {
      organizations: [],
      users: [],
      clients: [],
      loans: [],
      loan_products: [],
      repayments: [],
      savings_accounts: [],
      transactions: [],
      group_members: [],
      collateral: [],
      audit_logs: [],
      notifications: [],
      mpesa_transactions: [],
      credit_score_history: [],
      settings: [],
      documents: [],
      loan_approval_workflows: []
    };
    this.saveDB(db);
    return db;
  }

  // Generate unique IDs
  generateId(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${random}`;
  }

  // Generate 4-digit alphanumeric username
  generateUsername(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let username = '';
    for (let i = 0; i < 4; i++) {
      username += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if username already exists
    const db = this.getDB();
    const exists = db.organizations.some((org: Organization) => org.username === username);
    if (exists) {
      return this.generateUsername(); // Regenerate if exists
    }
    
    return username;
  }

  // ==================== ORGANIZATION OPERATIONS ====================

  createOrganization(data: Omit<Organization, 'id' | 'username' | 'status' | 'created_at' | 'updated_at'>): Organization {
    console.log('🏢 createOrganization called with data:', data);
    const db = this.getDB();
    console.log('📦 Current DB before adding org:', db.organizations.length, 'organizations');
    const now = new Date().toISOString();
    
    const organization: Organization = {
      ...data,
      id: this.generateId('ORG'),
      username: this.generateUsername(),
      status: 'active', // Auto-approve for demo
      created_at: now,
      updated_at: now
    };

    console.log('✅ New organization created:', organization);
    db.organizations.push(organization);
    console.log('📦 DB after adding org:', db.organizations.length, 'organizations');
    console.log('📋 All org names:', db.organizations.map(o => o.organization_name));
    
    this.saveDB(db);
    console.log('💾 Organization saved to localStorage');
    
    // Verify it was saved
    const verifyDB = this.getDB();
    const found = verifyDB.organizations.find(o => o.id === organization.id);
    if (found) {
      console.log('✅ VERIFIED: Organization found in localStorage after save');
    } else {
      console.error('❌ ERROR: Organization NOT found in localStorage after save!');
    }
    
    return organization;
  }

  getOrganizationByUsername(username: string): Organization | null {
    const db = this.getDB();
    return db.organizations.find((org: Organization) => org.username === username) || null;
  }

  getOrganizationById(id: string): Organization | null {
    const db = this.getDB();
    return db.organizations.find((org: Organization) => org.id === id) || null;
  }

  getAllOrganizations(): Organization[] {
    const db = this.getDB();
    return db.organizations;
  }

  updateOrganization(id: string, data: Partial<Organization>): Organization | null {
    const db = this.getDB();
    const index = db.organizations.findIndex((org: Organization) => org.id === id);
    
    if (index === -1) return null;
    
    db.organizations[index] = {
      ...db.organizations[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    
    this.saveDB(db);
    return db.organizations[index];
  }

  // ==================== USER OPERATIONS ====================

  createUser(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const db = this.getDB();
    const now = new Date().toISOString();
    
    const user: User = {
      ...data,
      id: this.generateId('USR'),
      created_at: now,
      updated_at: now
    };

    db.users.push(user);
    this.saveDB(db);
    
    return user;
  }

  getUserByUsername(username: string): User | null {
    const db = this.getDB();
    return db.users.find((user: User) => user.username === username) || null;
  }

  getUsersByOrganization(organizationId: string): User[] {
    const db = this.getDB();
    return db.users.filter((user: User) => user.organization_id === organizationId);
  }

  // ==================== CLIENT OPERATIONS ====================

  createClient(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Client {
    const db = this.getDB();
    const now = new Date().toISOString();
    
    const client: Client = {
      ...data,
      id: this.generateId('CLT'),
      created_at: now,
      updated_at: now
    };

    db.clients.push(client);
    this.saveDB(db);
    
    return client;
  }

  getClientsByOrganization(organizationId: string): Client[] {
    const db = this.getDB();
    return db.clients.filter((client: Client) => client.organization_id === organizationId);
  }

  getClientById(id: string): Client | null {
    const db = this.getDB();
    return db.clients.find((client: Client) => client.id === id) || null;
  }

  updateClient(id: string, data: Partial<Client>): Client | null {
    const db = this.getDB();
    const index = db.clients.findIndex((client: Client) => client.id === id);
    
    if (index === -1) return null;
    
    db.clients[index] = {
      ...db.clients[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    
    this.saveDB(db);
    return db.clients[index];
  }

  // ==================== LOAN OPERATIONS ====================

  createLoan(data: Omit<Loan, 'id' | 'created_at' | 'updated_at'>): Loan {
    const db = this.getDB();
    const now = new Date().toISOString();
    
    const loan: Loan = {
      ...data,
      id: this.generateId('LN'),
      created_at: now,
      updated_at: now
    };

    db.loans.push(loan);
    this.saveDB(db);
    
    return loan;
  }

  getLoansByOrganization(organizationId: string): Loan[] {
    const db = this.getDB();
    return db.loans.filter((loan: Loan) => loan.organization_id === organizationId);
  }

  getLoansByClient(clientId: string): Loan[] {
    const db = this.getDB();
    return db.loans.filter((loan: Loan) => loan.client_id === clientId);
  }

  getLoanById(id: string): Loan | null {
    const db = this.getDB();
    return db.loans.find((loan: Loan) => loan.id === id) || null;
  }

  updateLoan(id: string, data: Partial<Loan>): Loan | null {
    const db = this.getDB();
    const index = db.loans.findIndex((loan: Loan) => loan.id === id);
    
    if (index === -1) return null;
    
    db.loans[index] = {
      ...db.loans[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    
    this.saveDB(db);
    return db.loans[index];
  }

  // ==================== LOAN PRODUCT OPERATIONS ====================

  createLoanProduct(data: Omit<LoanProduct, 'id' | 'created_at' | 'updated_at'>): LoanProduct {
    const db = this.getDB();
    const now = new Date().toISOString();
    
    const product: LoanProduct = {
      ...data,
      id: this.generateId('LP'),
      created_at: now,
      updated_at: now
    };

    db.loan_products.push(product);
    this.saveDB(db);
    
    return product;
  }

  getLoanProductsByOrganization(organizationId: string): LoanProduct[] {
    const db = this.getDB();
    return db.loan_products.filter((product: LoanProduct) => product.organization_id === organizationId);
  }

  // ==================== REPAYMENT OPERATIONS ====================

  createRepayment(data: Omit<Repayment, 'id' | 'created_at' | 'updated_at'>): Repayment {
    const db = this.getDB();
    const now = new Date().toISOString();
    
    const repayment: Repayment = {
      ...data,
      id: this.generateId('REP'),
      created_at: now,
      updated_at: now
    };

    db.repayments.push(repayment);
    this.saveDB(db);
    
    return repayment;
  }

  getRepaymentsByLoan(loanId: string): Repayment[] {
    const db = this.getDB();
    return db.repayments.filter((rep: Repayment) => rep.loan_id === loanId);
  }

  // ==================== SAVINGS OPERATIONS ====================

  createSavingsAccount(data: Omit<SavingsAccount, 'id' | 'created_at' | 'updated_at'>): SavingsAccount {
    const db = this.getDB();
    const now = new Date().toISOString();
    
    const account: SavingsAccount = {
      ...data,
      id: this.generateId('SAV'),
      created_at: now,
      updated_at: now
    };

    db.savings_accounts.push(account);
    this.saveDB(db);
    
    return account;
  }

  getSavingsAccountsByClient(clientId: string): SavingsAccount[] {
    const db = this.getDB();
    return db.savings_accounts.filter((acc: SavingsAccount) => acc.client_id === clientId);
  }

  // ==================== AUDIT LOG ====================

  createAuditLog(data: Omit<AuditLog, 'id' | 'created_at'>): AuditLog {
    const db = this.getDB();
    
    const log: AuditLog = {
      ...data,
      id: this.generateId('AUD'),
      created_at: new Date().toISOString()
    };

    db.audit_logs.push(log);
    this.saveDB(db);
    
    return log;
  }

  // ==================== AUTHENTICATION ====================

  authenticate(username: string, password: string): { type: 'organization' | 'user', data: Organization | User } | null {
    const db = this.getDB();
    
    console.log('🔐 Authentication attempt:', { username, password });
    console.log('📊 Total organizations in DB:', db.organizations.length);
    
    // Check organizations by username, email, or contact_person_email
    const org = db.organizations.find((org: Organization) => {
      const usernameMatch = org.username === username;
      const emailMatch = org.email === username;
      const contactEmailMatch = org.contact_person_email === username;
      const passwordMatch = org.password_hash === password;
      
      console.log(`🏢 Checking org: ${org.organization_name}`, {
        username: org.username,
        email: org.email,
        contact_person_email: org.contact_person_email,
        password_hash: org.password_hash,
        status: org.status,
        matches: { usernameMatch, emailMatch, contactEmailMatch, passwordMatch, 
          statusActive: org.status === 'active'
        }
      });
      
      // Allow login even if status is pending (for demo purposes)
      return (usernameMatch || emailMatch || contactEmailMatch) && passwordMatch;
    });
    
    if (org) {
      console.log('✅ Authentication successful for organization:', org.organization_name);
      return { type: 'organization', data: org };
    }

    // Check users
    const user = this.getUserByUsername(username);
    if (user && user.password_hash === password && user.status === 'active') {
      console.log('✅ Authentication successful for user:', user.username);
      return { type: 'user', data: user };
    }

    console.log('❌ Authentication failed - no matching credentials');
    return null;
  }

  // ==================== UTILITY ====================

  clearAllData() {
    const data = this.initDB();
    this.saveDB(data);
  }

  exportDatabase() {
    return this.getDB();
  }

  importDatabase(data: any) {
    this.saveDB(data);
  }

  // ==================== SUPER ADMIN OPERATIONS ====================
  
  getAllClients(): Client[] {
    const db = this.getDB();
    return db.clients || [];
  }

  getAllLoans(): Loan[] {
    const db = this.getDB();
    return db.loans || [];
  }

  getAllUsers(): User[] {
    const db = this.getDB();
    return db.users || [];
  }

  getAllRepayments(): Repayment[] {
    const db = this.getDB();
    return db.repayments || [];
  }

  updateUser(id: string, data: Partial<User>): User | null {
    const db = this.getDB();
    const index = db.users.findIndex((user: User) => user.id === id);
    
    if (index === -1) return null;
    
    db.users[index] = {
      ...db.users[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    
    this.saveDB(db);
    return db.users[index];
  }
}

// Export singleton instance
export const db = new Database();