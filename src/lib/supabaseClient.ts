import { createClient } from '@supabase/supabase-js';

// Supabase project configuration
const supabaseUrl = 'https://mqunjutuftoueoxuyznn.supabase.co';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual anon key from Supabase dashboard

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          organization_name: string;
          registration_number: string | null;
          industry: string;
          organization_type: string;
          country: string;
          currency: string;
          email: string;
          phone: string;
          alternative_phone: string | null;
          website: string | null;
          county: string;
          town: string;
          address: string;
          postal_code: string | null;
          date_of_incorporation: string;
          organization_logo: string | null;
          contact_person_first_name: string;
          contact_person_last_name: string;
          contact_person_title: string;
          contact_person_email: string;
          contact_person_phone: string;
          number_of_employees: number | null;
          expected_clients: number | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      clients: {
        Row: {
          id: string;
          organization_id: string;
          first_name: string;
          last_name: string;
          id_number: string;
          phone: string;
          email: string | null;
          date_of_birth: string;
          gender: string;
          marital_status: string;
          number_of_dependents: number;
          county: string;
          town: string;
          address: string;
          postal_code: string | null;
          occupation: string;
          employer: string | null;
          monthly_income: number;
          other_income: number;
          status: string;
          kyc_status: string;
          risk_rating: string;
          date_registered: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      loans: {
        Row: {
          id: string;
          organization_id: string;
          client_id: string;
          loan_product_id: string;
          amount: number;
          interest_rate: number;
          term_months: number;
          purpose: string;
          status: string;
          application_date: string;
          approval_date: string | null;
          disbursement_date: string | null;
          first_payment_date: string | null;
          total_payable: number;
          monthly_payment: number;
          balance: number;
          principal_paid: number;
          interest_paid: number;
          payment_method: string;
          guarantor_required: boolean;
          collateral_required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['loans']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['loans']['Insert']>;
      };
      loan_products: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          min_amount: number;
          max_amount: number;
          interest_rate: number;
          min_term: number;
          max_term: number;
          processing_fee_percentage: number;
          guarantor_required: boolean;
          collateral_required: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['loan_products']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['loan_products']['Insert']>;
      };
      repayments: {
        Row: {
          id: string;
          organization_id: string;
          loan_id: string;
          amount: number;
          principal_amount: number;
          interest_amount: number;
          payment_date: string;
          payment_method: string;
          reference_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['repayments']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['repayments']['Insert']>;
      };
      savings_accounts: {
        Row: {
          id: string;
          organization_id: string;
          client_id: string;
          account_number: string;
          account_type: string;
          balance: number;
          interest_rate: number;
          status: string;
          opening_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['savings_accounts']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['savings_accounts']['Insert']>;
      };
      savings_transactions: {
        Row: {
          id: string;
          organization_id: string;
          account_id: string;
          transaction_type: string;
          amount: number;
          balance_after: number;
          transaction_date: string;
          reference_number: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['savings_transactions']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['savings_transactions']['Insert']>;
      };
      shareholders: {
        Row: {
          id: string;
          organization_id: string;
          shareholder_id: string;
          name: string;
          id_number: string;
          phone: string;
          email: string | null;
          shares: number;
          share_value: number;
          total_investment: number;
          join_date: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['shareholders']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['shareholders']['Insert']>;
      };
      shareholder_transactions: {
        Row: {
          id: string;
          organization_id: string;
          shareholder_id: string;
          transaction_type: string;
          amount: number;
          shares: number;
          transaction_date: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['shareholder_transactions']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['shareholder_transactions']['Insert']>;
      };
      expenses: {
        Row: {
          id: string;
          organization_id: string;
          expense_id: string;
          category: string;
          description: string;
          amount: number;
          payee_id: string | null;
          payment_method: string;
          payment_date: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>;
      };
      payees: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          category: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payees']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payees']['Insert']>;
      };
      bank_accounts: {
        Row: {
          id: string;
          organization_id: string;
          bank_name: string;
          account_name: string;
          account_number: string;
          branch: string | null;
          account_type: string;
          balance: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bank_accounts']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bank_accounts']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          description: string | null;
          assigned_to: string | null;
          due_date: string;
          priority: string;
          status: string;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      kyc_records: {
        Row: {
          id: string;
          organization_id: string;
          client_id: string;
          document_type: string;
          status: string;
          verified_date: string | null;
          verified_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['kyc_records']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['kyc_records']['Insert']>;
      };
      approvals: {
        Row: {
          id: string;
          organization_id: string;
          loan_id: string;
          stage: string;
          approver_role: string;
          approver_name: string | null;
          status: string;
          decision: string | null;
          comments: string | null;
          decision_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['approvals']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['approvals']['Insert']>;
      };
      funding_transactions: {
        Row: {
          id: string;
          organization_id: string;
          transaction_id: string;
          source: string;
          amount: number;
          transaction_date: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['funding_transactions']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['funding_transactions']['Insert']>;
      };
      processing_fee_records: {
        Row: {
          id: string;
          organization_id: string;
          loan_id: string;
          fee_amount: number;
          collected_date: string;
          payment_method: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['processing_fee_records']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['processing_fee_records']['Insert']>;
      };
      disbursements: {
        Row: {
          id: string;
          organization_id: string;
          loan_id: string;
          amount: number;
          disbursement_date: string;
          method: string;
          reference_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['disbursements']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['disbursements']['Insert']>;
      };
      payroll_runs: {
        Row: {
          id: string;
          organization_id: string;
          run_id: string;
          month: string;
          year: number;
          total_gross: number;
          total_deductions: number;
          total_net: number;
          status: string;
          processed_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payroll_runs']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payroll_runs']['Insert']>;
      };
      journal_entries: {
        Row: {
          id: string;
          organization_id: string;
          entry_id: string;
          entry_date: string;
          description: string;
          account: string;
          debit: number;
          credit: number;
          reference_type: string | null;
          reference_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['journal_entries']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['journal_entries']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string;
          performed_by: string;
          action: string;
          entity_type: string;
          entity_id: string;
          details: string;
          timestamp: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };
      tickets: {
        Row: {
          id: string;
          organization_id: string;
          ticket_id: string;
          title: string;
          description: string;
          category: string;
          priority: string;
          status: string;
          raised_by: string;
          assigned_to: string | null;
          created_date: string;
          resolved_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tickets']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tickets']['Insert']>;
      };
      groups: {
        Row: {
          id: string;
          organization_id: string;
          group_id: string;
          name: string;
          registration_date: string;
          chairperson: string;
          secretary: string;
          treasurer: string;
          member_count: number;
          total_savings: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['groups']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['groups']['Insert']>;
      };
      guarantors: {
        Row: {
          id: string;
          organization_id: string;
          loan_id: string;
          name: string;
          id_number: string;
          phone: string;
          relationship: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['guarantors']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['guarantors']['Insert']>;
      };
      collaterals: {
        Row: {
          id: string;
          organization_id: string;
          loan_id: string;
          type: string;
          description: string;
          estimated_value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['collaterals']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['collaterals']['Insert']>;
      };
      loan_documents: {
        Row: {
          id: string;
          organization_id: string;
          loan_id: string;
          document_type: string;
          file_url: string;
          uploaded_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['loan_documents']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['loan_documents']['Insert']>;
      };
    };
  };
}