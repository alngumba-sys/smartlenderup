# 🏗️ SmartLenderUp - System Architecture

Complete technical architecture of your full-stack microfinance platform.

---

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Browser (Chrome, Safari, Firefox, Edge)                        │
│  Mobile Browser (iOS Safari, Android Chrome)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript                                          │
│  ├── Landing Page (LoginPage.tsx)                               │
│  ├── Staff Portal (InternalStaffPortal.tsx)                     │
│  ├── Client Portal (ClientPortal.tsx)                           │
│  ├── Modals & Forms (Registration, Loan Application)            │
│  └── Components (Tabs, Cards, Charts)                           │
│                                                                  │
│  Styling: Tailwind CSS 4.0                                      │
│  Icons: Lucide React                                            │
│  Charts: Recharts                                               │
│  Notifications: Sonner                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     STATE MANAGEMENT                            │
├─────────────────────────────────────────────────────────────────┤
│  React Context API                                              │
│  ├── AuthContext (User authentication state)                    │
│  ├── DataContext (Application data)                             │
│  ├── ThemeContext (Dark/Light mode)                             │
│  └── NavigationContext (UI state)                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API SERVICE LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  /services/api.ts                                               │
│  ├── authAPI (login, register, logout)                          │
│  ├── loansAPI (create, approve, disburse)                       │
│  ├── clientsAPI (CRUD operations)                               │
│  ├── paymentsAPI (record, track)                                │
│  ├── mpesaAPI (STK push, verify)                                │
│  ├── savingsAPI (accounts, transactions)                        │
│  ├── notificationsAPI (list, mark read)                         │
│  └── reportsAPI (dashboard, analytics)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API Calls
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API/BACKEND LAYER                            │
│                  (Vercel Serverless Functions)                  │
├─────────────────────────────────────────────────────────────────┤
│  Authentication Endpoints:                                       │
│  ├── POST /api/auth/login                                       │
│  └── POST /api/auth/register                                    │
│                                                                  │
│  Loan Management Endpoints:                                     │
│  ├── POST /api/loans/create                                     │
│  ├── GET /api/loans/:id                                         │
│  └── PATCH /api/loans/:id                                       │
│                                                                  │
│  Payment Endpoints:                                             │
│  ├── POST /api/payments/create                                  │
│  └── GET /api/payments                                          │
│                                                                  │
│  M-Pesa Integration:                                            │
│  ├── POST /api/mpesa/stk-push                                   │
│  └── POST /api/mpesa/callback                                   │
│                                                                  │
│  Client Management:                                             │
│  ├── POST /api/clients/create                                   │
│  ├── GET /api/clients/:id                                       │
│  └── PATCH /api/clients/:id                                     │
│                                                                  │
│  Additional Endpoints:                                          │
│  ├── Savings (create, transaction)                              │
│  ├── Notifications (list, read)                                 │
│  ├── Reports (dashboard, portfolio)                             │
│  └── Uploads (documents, photos)                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ├─────────────────┐
                         │                 │
                         ▼                 ▼
┌──────────────────────────────┐  ┌─────────────────────────────┐
│   DATABASE LAYER             │  │  EXTERNAL SERVICES          │
│   (Supabase PostgreSQL)      │  │                             │
├──────────────────────────────┤  ├─────────────────────────────┤
│  18 Tables:                  │  │  M-Pesa API                 │
│                              │  │  ├── OAuth Token            │
│  User Management:            │  │  ├── STK Push               │
│  ├── users                   │  │  ├── Transaction Query      │
│  ├── organizations           │  │  └── Callback Handler       │
│  └── groups                  │  │                             │
│                              │  │  Email Service (Resend)     │
│  Client Management:          │  │  ├── Transactional emails   │
│  ├── clients                 │  │  ├── Notifications          │
│  └── client_documents        │  │  └── Marketing campaigns    │
│                              │  │                             │
│  Loan Management:            │  │  SMS Service (Africa's      │
│  ├── loan_products           │  │  Talking)                   │
│  ├── loans                   │  │  ├── SMS campaigns          │
│  ├── loan_guarantors         │  │  ├── Payment reminders      │
│  └── loan_collateral         │  │  └── Notifications          │
│                              │  │                             │
│  Financial:                  │  │  Storage (Supabase)         │
│  ├── payments                │  │  ├── Document uploads       │
│  ├── mpesa_transactions      │  │  ├── Profile photos         │
│  ├── savings_accounts        │  │  └── File management        │
│  └── savings_transactions    │  │                             │
│                              │  └─────────────────────────────┘
│  Communication:              │
│  ├── sms_campaigns           │
│  ├── sms_logs                │
│  └── notifications           │
│                              │
│  System:                     │
│  ├── audit_logs              │
│  └── system_settings         │
│                              │
│  Security Features:          │
│  ├── Row Level Security      │
│  ├── Triggers & Functions    │
│  ├── Indexes                 │
│  └── Constraints             │
└──────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. User enters credentials
       ▼
┌─────────────────────────────┐
│  LoginPage.tsx              │
│  (React Component)          │
└──────┬──────────────────────┘
       │
       │ 2. Call authAPI.login()
       ▼
┌─────────────────────────────┐
│  /services/api.ts           │
│  authAPI.login()            │
└──────┬──────────────────────┘
       │
       │ 3. POST /api/auth/login
       ▼
┌─────────────────────────────┐
│  /api/auth/login.ts         │
│  (Vercel Function)          │
└──────┬──────────────────────┘
       │
       │ 4. Validate credentials
       ▼
┌─────────────────────────────┐
│  Supabase Auth              │
│  auth.signInWithPassword()  │
└──────┬──────────────────────┘
       │
       │ 5. Query user profile
       ▼
┌─────────────────────────────┐
│  Supabase DB                │
│  SELECT * FROM users        │
└──────┬──────────────────────┘
       │
       │ 6. Return JWT token + user data
       ▼
┌─────────────────────────────┐
│  Browser                    │
│  - Store token in           │
│    localStorage             │
│  - Update AuthContext       │
│  - Navigate to portal       │
└─────────────────────────────┘
```

---

## 💰 Loan Application Flow

```
Client Portal                Staff Portal
     │                           │
     │ 1. Fill loan form         │
     ▼                           │
[Apply Tab]                      │
     │                           │
     │ 2. Submit application     │
     ▼                           │
POST /api/loans/create           │
     │                           │
     │ 3. Save to database       │
     ▼                           │
[loans table]                    │
status: pending                  │
     │                           │
     │ 4. Create notification    │
     ▼                           │
[notifications table]            │
     │                           │
     │ ◄───────────────────────┐ │
     │                         │ │
     │                  5. Review loan
     │                         │ │
     │                         ▼ │
     │              [Loan Management Tab]
     │                         │
     │                  6. Approve/Reject
     │                         │
     │                         ▼
     │              PATCH /api/loans/:id
     │                         │
     │                  7. Update status
     │                         │
     │                         ▼
     │                   [loans table]
     │                   status: approved
     │                         │
     │ ◄───────────────────────┘
     │ 8. Notification sent
     ▼
[Client sees approval]
```

---

## 💳 M-Pesa Payment Flow

```
1. Client initiates payment
   │
   ▼
POST /api/mpesa/stk-push
   │
   ├─ phone_number: 254712345678
   ├─ amount: 5000
   └─ loan_id: uuid
   │
   ▼
2. Get M-Pesa OAuth token
   │
   ▼
3. Generate timestamp & password
   │
   ▼
4. Send STK Push request to Safaricom
   │
   └─────────────────────────────┐
                                 │
5. Save transaction             │
   │                             │
   ▼                             ▼
[mpesa_transactions]     [Client's Phone]
status: pending          STK Push appears
   │                             │
   │                     User enters PIN
   │                             │
   │                     Payment processed
   │                             │
   │ ◄───────────────────────────┘
   │
6. M-Pesa calls /api/mpesa/callback
   │
   ├─ ResultCode: 0 (success)
   ├─ MpesaReceiptNumber: RKL9X8Y7Z6
   └─ Amount: 5000
   │
   ▼
7. Update transaction status
   │
   ▼
[mpesa_transactions]
status: success
   │
   ▼
8. Create payment record
   │
   ▼
[payments table]
   │
   ▼
9. Update loan balance
   │
   ▼
[loans table]
paid_amount: +5000
outstanding_balance: -5000
   │
   ▼
10. Send notification to client
   │
   ▼
[notifications table]
"Payment of KES 5,000 received"
```

---

## 🗄️ Database Schema Overview

### Core Entities

```
users (Authentication & Profiles)
├── id (UUID, PK)
├── email (TEXT, UNIQUE)
├── full_name (TEXT)
├── role (TEXT: admin, manager, loan_officer, client)
├── organization_id (UUID, FK → organizations)
└── status (TEXT: active, suspended, inactive)

organizations (SACCOs, MFIs, Credit Unions)
├── id (UUID, PK)
├── name (TEXT)
├── type (TEXT: sacco, mfi, credit_union)
├── subscription_tier (TEXT: starter, growth, professional)
└── subscription_status (TEXT: trial, active, suspended)

clients (Client Profiles & KYC)
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── client_number (TEXT, UNIQUE)
├── first_name, last_name (TEXT)
├── id_number (TEXT, UNIQUE)
├── phone_primary (TEXT)
├── kyc_status (TEXT: pending, verified, rejected)
└── credit_score (INTEGER)

loans (Loan Applications & Tracking)
├── id (UUID, PK)
├── loan_number (TEXT, UNIQUE)
├── client_id (UUID, FK → clients)
├── principal_amount (DECIMAL)
├── interest_rate (DECIMAL)
├── total_amount (DECIMAL)
├── outstanding_balance (DECIMAL)
└── status (TEXT: pending, approved, disbursed, active, completed)

payments (Payment Transactions)
├── id (UUID, PK)
├── loan_id (UUID, FK → loans)
├── payment_number (TEXT, UNIQUE)
├── amount (DECIMAL)
├── payment_method (TEXT: mpesa, cash, bank_transfer)
├── mpesa_receipt_number (TEXT)
└── status (TEXT: pending, completed, failed)

mpesa_transactions (M-Pesa Integration)
├── id (UUID, PK)
├── transaction_id (TEXT, UNIQUE)
├── checkout_request_id (TEXT)
├── phone_number (TEXT)
├── amount (DECIMAL)
├── loan_id (UUID, FK → loans)
├── payment_id (UUID, FK → payments)
└── status (TEXT: pending, success, failed)
```

### Relationships

```
organizations 1──────┐
                     │ has many
                     ▼
                   users 1─────┐
                                │ has many
                                ▼
                              clients 1──────┐
                                             │ has many
                                             ▼
                                           loans 1──────┐
                                                        │ has many
                                                        ▼
                                                     payments
                                                        │
                                                        │ may have
                                                        ▼
                                                  mpesa_transactions
```

---

## 🔒 Security Architecture

### Row Level Security (RLS)

```
Policy: "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id)

Policy: "Staff can view organization clients"
ON clients
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.organization_id = clients.organization_id
  )
)

Policy: "Users can view own loans"
ON loans
FOR SELECT
USING (
  client_id IN (
    SELECT id FROM clients
    WHERE user_id = auth.uid()
  )
)
```

### Authentication

```
1. User Login
   ↓
2. Supabase Auth validates credentials
   ↓
3. Generate JWT token
   ├── Payload: { sub: user_id, role: user_role, exp: expiry }
   └── Signed with secret key
   ↓
4. Token sent to client
   ↓
5. Client stores in localStorage
   ↓
6. All API requests include:
   Authorization: Bearer <token>
   ↓
7. Server verifies token
   ├── Valid → Process request
   └── Invalid → Return 401 Unauthorized
```

### Environment Variables Security

```
Frontend (VITE_ prefix):
├── VITE_SUPABASE_URL → Exposed to browser (safe)
└── VITE_SUPABASE_ANON_KEY → Exposed to browser (safe, RLS protects data)

Backend (No prefix):
├── SUPABASE_SERVICE_ROLE_KEY → Server-side only (CRITICAL - NEVER EXPOSE)
├── MPESA_CONSUMER_SECRET → Server-side only
└── RESEND_API_KEY → Server-side only

Protection:
├── .env file in .gitignore
├── Vercel environment variables encrypted
└── Service keys only in serverless functions
```

---

## 📊 Data Flow Examples

### Example 1: Creating a Loan

```
Frontend                    API                         Database
   │                        │                              │
   │ 1. User fills form     │                              │
   │                        │                              │
   │ 2. POST /api/loans/create                             │
   ├────────────────────────►                              │
   │  { client_id,          │                              │
   │    principal_amount,   │                              │
   │    duration_months }   │                              │
   │                        │                              │
   │                        │ 3. Validate request          │
   │                        │                              │
   │                        │ 4. Calculate interest        │
   │                        │    total_amount =            │
   │                        │    principal + interest      │
   │                        │                              │
   │                        │ 5. Generate loan_number      │
   │                        │    LN-20241219-1234          │
   │                        │                              │
   │                        │ 6. INSERT INTO loans         │
   │                        ├──────────────────────────────►
   │                        │                              │
   │                        │ 7. INSERT INTO loan_guarantors (if any)
   │                        ├──────────────────────────────►
   │                        │                              │
   │                        │ 8. INSERT INTO notifications │
   │                        ├──────────────────────────────►
   │                        │                              │
   │                        │ 9. Return created loan       │
   │                        │◄──────────────────────────────
   │                        │                              │
   │ 10. Response           │                              │
   │◄────────────────────────                              │
   │  { success: true,      │                              │
   │    loan: {...} }       │                              │
   │                        │                              │
   │ 11. Update UI          │                              │
   │     Show success msg   │                              │
```

### Example 2: Dashboard Analytics

```
Frontend                    API                         Database
   │                        │                              │
   │ 1. Load dashboard      │                              │
   │                        │                              │
   │ 2. GET /api/reports/dashboard                         │
   ├────────────────────────►                              │
   │                        │                              │
   │                        │ 3. Run aggregation queries   │
   │                        │                              │
   │                        │ SELECT COUNT(*) FROM clients │
   │                        ├──────────────────────────────►
   │                        │◄──────────────────────────────
   │                        │ total_clients: 150           │
   │                        │                              │
   │                        │ SELECT SUM(principal_amount) │
   │                        │ FROM loans                   │
   │                        │ WHERE status = 'disbursed'   │
   │                        ├──────────────────────────────►
   │                        │◄──────────────────────────────
   │                        │ total_disbursed: 5000000     │
   │                        │                              │
   │                        │ (More queries for other metrics)
   │                        │                              │
   │                        │ 4. Compile results           │
   │                        │                              │
   │ 5. Response            │                              │
   │◄────────────────────────                              │
   │  { total_clients: 150, │                              │
   │    total_disbursed: 5M,│                              │
   │    active_loans: 45,   │                              │
   │    ... }               │                              │
   │                        │                              │
   │ 6. Render charts       │                              │
   │    Update metrics      │                              │
```

---

## 🚀 Deployment Architecture

```
Developer Machine
    │
    │ git push
    ▼
┌───────────────────┐
│  GitHub           │
│  Repository       │
└────────┬──────────┘
         │ webhook
         ▼
┌───────────────────────────────────────┐
│  Vercel Platform                      │
├───────────────────────────────────────┤
│  1. Detect push                       │
│  2. Clone repository                  │
│  3. Install dependencies (npm install)│
│  4. Run build (npm run build)         │
│  5. Optimize assets                   │
│  6. Deploy to Edge Network            │
└────────┬──────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Vercel Edge Network (Global CDN)           │
├─────────────────────────────────────────────┤
│  Locations:                                 │
│  ├── North America (US East, US West)      │
│  ├── Europe (London, Frankfurt, Amsterdam) │
│  ├── Asia (Singapore, Tokyo, Hong Kong)    │
│  └── Africa (South Africa)                 │
└────────┬────────────────────────────────────┘
         │
         ▼
    End Users
    (Worldwide)
```

---

## 📈 Scalability

### Current Capacity (Free Tier)

```
Vercel:
├── Bandwidth: 100 GB/month
├── Build time: 100 hours/month
├── Serverless executions: Unlimited
└── Edge requests: Unlimited

Supabase:
├── Database: 500 MB
├── Bandwidth: 2 GB/month
├── Storage: 1 GB
└── Concurrent connections: 50

Estimated capacity:
├── Users: 1,000-5,000
├── Transactions/month: 10,000
├── API calls/month: 100,000
└── Page views/month: 50,000
```

### Scaling Strategy

```
Phase 1: 0-100 users
├── Free tier sufficient
└── Cost: $0/month

Phase 2: 100-1,000 users
├── Upgrade Supabase to Pro ($25/mo)
├── Keep Vercel free
└── Cost: $25/month

Phase 3: 1,000-10,000 users
├── Supabase Pro: $25/mo
├── Vercel Pro: $20/mo
├── Add caching layer (Redis)
└── Cost: $65/month

Phase 4: 10,000+ users
├── Supabase Team: $599/mo
├── Vercel Enterprise: Custom
├── Dedicated database
├── Load balancing
└── Cost: $1,000+/month
```

---

## 🔧 Technology Stack Summary

### Frontend
- **Framework**: React 18.2
- **Language**: TypeScript 5.0
- **Build Tool**: Vite 4.4
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React 0.263
- **Charts**: Recharts 2.8
- **Notifications**: Sonner 1.0

### Backend
- **Runtime**: Node.js 18+
- **Functions**: Vercel Serverless
- **API Type**: RESTful
- **Authentication**: Supabase Auth (JWT)

### Database
- **Type**: PostgreSQL 15
- **Provider**: Supabase
- **ORM**: Supabase Client JS
- **Tables**: 18
- **Security**: Row Level Security

### Infrastructure
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **DNS**: Vercel DNS
- **SSL**: Auto-provisioned (Let's Encrypt)

### Integrations
- **Payments**: M-Pesa (Safaricom)
- **Email**: Resend
- **SMS**: Africa's Talking
- **Storage**: Supabase Storage

### Development Tools
- **Version Control**: Git
- **Repository**: GitHub
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript

---

## 📊 Performance Metrics

### Target Performance

```
Page Load Time:
├── First Contentful Paint: < 1.5s
├── Largest Contentful Paint: < 2.5s
├── Time to Interactive: < 3.5s
└── Total Page Load: < 4s

API Response Time:
├── Authentication: < 500ms
├── Data queries: < 300ms
├── Complex reports: < 1s
└── M-Pesa STK push: < 2s

Database Performance:
├── Simple queries: < 50ms
├── Complex joins: < 200ms
├── Aggregations: < 500ms
└── Bulk operations: < 2s

Uptime:
└── Target: 99.9% (8.76 hours downtime/year)
```

---

This architecture supports **1,000s of users** and **100,000s of transactions** with room to scale! 🚀
