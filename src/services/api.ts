// API Service for SmartLenderUp Platform
// This file contains all API calls to the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('supabase_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================
// AUTHENTICATION API
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: any;
  session: any;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: string;
  organization_data?: {
    name: string;
    type: string;
    registration_number?: string;
    email?: string;
    phone?: string;
    location?: string;
    county?: string;
    physical_address?: string;
    logo_url?: string;
  };
}

export const authAPI = {
  login: (data: LoginRequest) =>
    apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    apiRequest<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () => {
    localStorage.removeItem('supabase_token');
    localStorage.removeItem('bv_funguo_credentials');
  },
};

// ============================================
// LOANS API
// ============================================

export interface CreateLoanRequest {
  client_id: string;
  loan_product_id?: string;
  principal_amount: number;
  duration_months: number;
  purpose?: string;
  guarantors?: Array<{
    name: string;
    phone: string;
    id_number: string;
    email?: string;
    relationship?: string;
  }>;
  collateral?: Array<{
    type: string;
    description: string;
    value: number;
  }>;
}

export interface UpdateLoanRequest {
  action: 'approve' | 'reject' | 'disburse';
  notes?: string;
  disbursement_method?: 'mpesa' | 'bank_transfer' | 'cash' | 'cheque';
  disbursement_reference?: string;
}

export const loansAPI = {
  create: (data: CreateLoanRequest) =>
    apiRequest<any>('/loans/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (id: string) =>
    apiRequest<any>(`/loans/${id}`, {
      method: 'GET',
    }),

  update: (id: string, data: UpdateLoanRequest) =>
    apiRequest<any>(`/loans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  list: (filters?: {
    status?: string;
    client_id?: string;
    organization_id?: string;
  }) => {
    const params = new URLSearchParams(filters as any);
    return apiRequest<any>(`/loans?${params}`, {
      method: 'GET',
    });
  },
};

// ============================================
// CLIENTS API
// ============================================

export interface CreateClientRequest {
  first_name: string;
  last_name: string;
  id_number: string;
  phone_primary: string;
  email?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  occupation?: string;
  monthly_income?: number;
  physical_address?: string;
  county?: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  next_of_kin_relationship?: string;
}

export const clientsAPI = {
  create: (data: CreateClientRequest) =>
    apiRequest<any>('/clients/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (id: string) =>
    apiRequest<any>(`/clients/${id}`, {
      method: 'GET',
    }),

  update: (id: string, data: Partial<CreateClientRequest>) =>
    apiRequest<any>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  list: (filters?: {
    status?: string;
    organization_id?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams(filters as any);
    return apiRequest<any>(`/clients?${params}`, {
      method: 'GET',
    });
  },
};

// ============================================
// PAYMENTS API
// ============================================

export interface CreatePaymentRequest {
  loan_id: string;
  amount: number;
  payment_method: 'mpesa' | 'bank_transfer' | 'cash' | 'cheque' | 'bank_deposit';
  payment_reference?: string;
  notes?: string;
}

export const paymentsAPI = {
  create: (data: CreatePaymentRequest) =>
    apiRequest<any>('/payments/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByLoan: (loanId: string) =>
    apiRequest<any>(`/payments?loan_id=${loanId}`, {
      method: 'GET',
    }),

  getById: (id: string) =>
    apiRequest<any>(`/payments/${id}`, {
      method: 'GET',
    }),
};

// ============================================
// M-PESA API
// ============================================

export interface MpesaStkPushRequest {
  phone_number: string;
  amount: number;
  account_reference?: string;
  loan_id?: string;
}

export const mpesaAPI = {
  stkPush: (data: MpesaStkPushRequest) =>
    apiRequest<any>('/mpesa/stk-push', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  checkStatus: (checkoutRequestId: string) =>
    apiRequest<any>(`/mpesa/query?checkout_request_id=${checkoutRequestId}`, {
      method: 'GET',
    }),
};

// ============================================
// SAVINGS API
// ============================================

export interface CreateSavingsAccountRequest {
  client_id: string;
  account_type: 'regular' | 'fixed' | 'target' | 'children';
  interest_rate: number;
  minimum_balance?: number;
}

export interface SavingsTransactionRequest {
  savings_account_id: string;
  transaction_type: 'deposit' | 'withdrawal';
  amount: number;
  payment_method: 'mpesa' | 'cash' | 'bank_transfer' | 'cheque';
  reference_number?: string;
  description?: string;
}

export const savingsAPI = {
  createAccount: (data: CreateSavingsAccountRequest) =>
    apiRequest<any>('/savings/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  transaction: (data: SavingsTransactionRequest) =>
    apiRequest<any>('/savings/transaction', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAccount: (id: string) =>
    apiRequest<any>(`/savings/${id}`, {
      method: 'GET',
    }),

  getTransactions: (accountId: string) =>
    apiRequest<any>(`/savings/${accountId}/transactions`, {
      method: 'GET',
    }),
};

// ============================================
// NOTIFICATIONS API
// ============================================

export const notificationsAPI = {
  list: (unreadOnly: boolean = false) =>
    apiRequest<any>(`/notifications?unread=${unreadOnly}`, {
      method: 'GET',
    }),

  markAsRead: (id: string) =>
    apiRequest<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  markAllAsRead: () =>
    apiRequest<any>('/notifications/read-all', {
      method: 'PATCH',
    }),
};

// ============================================
// REPORTS API
// ============================================

export interface ReportParams {
  start_date?: string;
  end_date?: string;
  organization_id?: string;
  loan_officer_id?: string;
}

export const reportsAPI = {
  dashboard: (params?: ReportParams) => {
    const query = new URLSearchParams(params as any);
    return apiRequest<any>(`/reports/dashboard?${query}`, {
      method: 'GET',
    });
  },

  loans: (params?: ReportParams) => {
    const query = new URLSearchParams(params as any);
    return apiRequest<any>(`/reports/loans?${query}`, {
      method: 'GET',
    });
  },

  portfolio: (params?: ReportParams) => {
    const query = new URLSearchParams(params as any);
    return apiRequest<any>(`/reports/portfolio?${query}`, {
      method: 'GET',
    });
  },

  arrears: (params?: ReportParams) => {
    const query = new URLSearchParams(params as any);
    return apiRequest<any>(`/reports/arrears?${query}`, {
      method: 'GET',
    });
  },
};

// ============================================
// FILE UPLOAD API
// ============================================

export const uploadAPI = {
  uploadDocument: async (file: File, type: string, clientId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (clientId) {
      formData.append('client_id', clientId);
    }

    const token = localStorage.getItem('supabase_token');
    const response = await fetch(`${API_BASE_URL}/upload/document`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  uploadProfilePhoto: async (file: File, userId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);

    const token = localStorage.getItem('supabase_token');
    const response = await fetch(`${API_BASE_URL}/upload/profile-photo`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },
};

// Export all APIs
export default {
  auth: authAPI,
  loans: loansAPI,
  clients: clientsAPI,
  payments: paymentsAPI,
  mpesa: mpesaAPI,
  savings: savingsAPI,
  notifications: notificationsAPI,
  reports: reportsAPI,
  upload: uploadAPI,
};
