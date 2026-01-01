# SmartLenderUp - API Testing Guide

Complete guide for testing all backend API endpoints using cURL, Postman, or your frontend.

---

## 🛠️ Setup for Testing

### Prerequisites

1. Backend deployed (Vercel + Supabase)
2. Environment variables configured
3. Database tables created
4. Postman installed (optional)

### Base URLs

```bash
# Local development
API_URL=http://localhost:5173/api

# Production
API_URL=https://smartlenderup.vercel.app/api
```

---

## 🔐 1. Authentication APIs

### 1.1 Register New User

**Endpoint:** `POST /api/auth/register`

**Request:**
```bash
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!",
    "full_name": "John Doe",
    "phone": "+254712345678",
    "role": "client"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "role": "client",
    "status": "active"
  },
  "message": "Registration successful"
}
```

### 1.2 Register Organization

**Request:**
```bash
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mysacco.co.ke",
    "password": "SecurePassword123!",
    "full_name": "Jane Admin",
    "phone": "+254712345678",
    "role": "admin",
    "organization_data": {
      "name": "My SACCO",
      "type": "sacco",
      "registration_number": "REG-2024-001",
      "email": "info@mysacco.co.ke",
      "phone": "+254712345678",
      "location": "Nairobi",
      "county": "Nairobi"
    }
  }'
```

### 1.3 Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```bash
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "role": "client"
  },
  "session": {
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "expires_in": 3600
  }
}
```

**Save the access token for subsequent requests!**

---

## 👥 2. Client Management APIs

### 2.1 Create Client

**Endpoint:** `POST /api/clients/create`

**Request:**
```bash
TOKEN="your_access_token_here"

curl -X POST $API_URL/clients/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "first_name": "Mary",
    "last_name": "Wanjiku",
    "id_number": "12345678",
    "phone_primary": "+254712345678",
    "email": "mary.wanjiku@example.com",
    "date_of_birth": "1990-05-15",
    "gender": "female",
    "marital_status": "married",
    "occupation": "Teacher",
    "monthly_income": 45000,
    "county": "Nairobi",
    "physical_address": "Kilimani, Nairobi",
    "next_of_kin_name": "John Wanjiku",
    "next_of_kin_phone": "+254723456789",
    "next_of_kin_relationship": "Husband"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "client": {
    "id": "uuid-here",
    "client_number": "CL-20241219-1234",
    "first_name": "Mary",
    "last_name": "Wanjiku",
    "status": "active",
    "kyc_status": "pending"
  },
  "message": "Client created successfully"
}
```

### 2.2 Get Client by ID

**Endpoint:** `GET /api/clients/:id`

**Request:**
```bash
CLIENT_ID="uuid-here"

curl -X GET $API_URL/clients/$CLIENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 2.3 List All Clients

**Endpoint:** `GET /api/clients`

**Request:**
```bash
curl -X GET "$API_URL/clients?status=active&search=Mary" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 💰 3. Loan Management APIs

### 3.1 Create Loan Application

**Endpoint:** `POST /api/loans/create`

**Request:**
```bash
curl -X POST $API_URL/loans/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "client_id": "client-uuid-here",
    "principal_amount": 50000,
    "duration_months": 12,
    "purpose": "Business expansion",
    "guarantors": [
      {
        "name": "Peter Kamau",
        "phone": "+254712345678",
        "id_number": "87654321",
        "email": "peter@example.com",
        "relationship": "Friend"
      }
    ],
    "collateral": [
      {
        "type": "vehicle",
        "description": "Toyota Probox KCA 123X",
        "value": 800000
      }
    ]
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "loan": {
    "id": "uuid-here",
    "loan_number": "LN-20241219-5678",
    "principal_amount": 50000,
    "interest_rate": 10,
    "duration_months": 12,
    "total_amount": 55000,
    "monthly_installment": 4583.33,
    "status": "pending"
  },
  "message": "Loan application created successfully"
}
```

### 3.2 Get Loan Details

**Endpoint:** `GET /api/loans/:id`

**Request:**
```bash
LOAN_ID="uuid-here"

curl -X GET $API_URL/loans/$LOAN_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "loan": {
    "id": "uuid-here",
    "loan_number": "LN-20241219-5678",
    "client": {
      "first_name": "Mary",
      "last_name": "Wanjiku"
    },
    "principal_amount": 50000,
    "outstanding_balance": 50000,
    "paid_amount": 0,
    "status": "pending",
    "guarantors": [...],
    "collateral": [...],
    "payments": []
  }
}
```

### 3.3 Approve Loan

**Endpoint:** `PATCH /api/loans/:id`

**Request:**
```bash
curl -X PATCH $API_URL/loans/$LOAN_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "action": "approve",
    "notes": "Approved after verification. Credit score: 750"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "loan": {
    "id": "uuid-here",
    "status": "approved",
    "approved_at": "2024-12-19T10:30:00Z"
  },
  "message": "Loan approved successfully"
}
```

### 3.4 Disburse Loan

**Request:**
```bash
curl -X PATCH $API_URL/loans/$LOAN_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "action": "disburse",
    "disbursement_method": "mpesa",
    "disbursement_reference": "RKL9X8Y7Z6",
    "notes": "Disbursed via M-Pesa to 254712345678"
  }'
```

### 3.5 Reject Loan

**Request:**
```bash
curl -X PATCH $API_URL/loans/$LOAN_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "action": "reject",
    "notes": "Insufficient credit history. Please reapply after 3 months."
  }'
```

---

## 💳 4. M-Pesa Integration APIs

### 4.1 Initiate STK Push (Payment Request)

**Endpoint:** `POST /api/mpesa/stk-push`

**Request:**
```bash
curl -X POST $API_URL/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "phone_number": "254708374149",
    "amount": 5000,
    "account_reference": "LN-20241219-5678",
    "loan_id": "loan-uuid-here"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "STK push sent successfully. Please check your phone.",
  "merchant_request_id": "29115-34620561-1",
  "checkout_request_id": "ws_CO_191220191020363925",
  "transaction_id": "uuid-here"
}
```

**What happens next:**
1. User receives STK push on their phone
2. User enters M-Pesa PIN
3. Payment processed
4. Callback sent to `/api/mpesa/callback`
5. Payment recorded in database

### 4.2 Test M-Pesa (Sandbox)

**Test Credentials:**
- Phone: 254708374149
- Amount: Any (try 10, 100, 1000)
- PIN: 1234

**Test Flow:**
```bash
# 1. Send STK push
curl -X POST $API_URL/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "phone_number": "254708374149",
    "amount": 10,
    "account_reference": "TEST"
  }'

# 2. Check your test phone (or SMS)
# 3. Enter PIN: 1234
# 4. Wait 5-10 seconds
# 5. Check database for payment record
```

---

## 💵 5. Payment APIs

### 5.1 Record Manual Payment

**Endpoint:** `POST /api/payments/create`

**Request:**
```bash
curl -X POST $API_URL/payments/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "loan_id": "loan-uuid-here",
    "amount": 5000,
    "payment_method": "cash",
    "payment_reference": "CASH-001",
    "notes": "Cash payment received at branch"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "payment": {
    "id": "uuid-here",
    "payment_number": "PAY-20241219-9012",
    "amount": 5000,
    "payment_method": "cash",
    "status": "completed"
  },
  "message": "Payment recorded successfully"
}
```

### 5.2 Get Loan Payments

**Endpoint:** `GET /api/payments?loan_id=:id`

**Request:**
```bash
curl -X GET "$API_URL/payments?loan_id=$LOAN_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 💰 6. Savings Account APIs

### 6.1 Create Savings Account

**Endpoint:** `POST /api/savings/create`

**Request:**
```bash
curl -X POST $API_URL/savings/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "client_id": "client-uuid-here",
    "account_type": "regular",
    "interest_rate": 5.5,
    "minimum_balance": 1000
  }'
```

### 6.2 Deposit to Savings

**Endpoint:** `POST /api/savings/transaction`

**Request:**
```bash
curl -X POST $API_URL/savings/transaction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "savings_account_id": "account-uuid-here",
    "transaction_type": "deposit",
    "amount": 10000,
    "payment_method": "mpesa",
    "reference_number": "RKL9X8Y7Z6",
    "description": "Monthly savings deposit"
  }'
```

### 6.3 Withdraw from Savings

**Request:**
```bash
curl -X POST $API_URL/savings/transaction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "savings_account_id": "account-uuid-here",
    "transaction_type": "withdrawal",
    "amount": 5000,
    "payment_method": "cash",
    "description": "Emergency withdrawal"
  }'
```

---

## 🔔 7. Notifications APIs

### 7.1 Get All Notifications

**Endpoint:** `GET /api/notifications`

**Request:**
```bash
curl -X GET $API_URL/notifications \
  -H "Authorization: Bearer $TOKEN"
```

### 7.2 Get Unread Notifications

**Request:**
```bash
curl -X GET "$API_URL/notifications?unread=true" \
  -H "Authorization: Bearer $TOKEN"
```

### 7.3 Mark Notification as Read

**Endpoint:** `PATCH /api/notifications/:id/read`

**Request:**
```bash
NOTIFICATION_ID="uuid-here"

curl -X PATCH $API_URL/notifications/$NOTIFICATION_ID/read \
  -H "Authorization: Bearer $TOKEN"
```

### 7.4 Mark All as Read

**Request:**
```bash
curl -X PATCH $API_URL/notifications/read-all \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 8. Reports & Analytics APIs

### 8.1 Dashboard Summary

**Endpoint:** `GET /api/reports/dashboard`

**Request:**
```bash
curl -X GET "$API_URL/reports/dashboard?start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_clients": 150,
    "active_loans": 45,
    "total_disbursed": 5000000,
    "total_collected": 3500000,
    "default_rate": 5.2,
    "portfolio_at_risk": 250000
  }
}
```

### 8.2 Loan Portfolio Report

**Request:**
```bash
curl -X GET "$API_URL/reports/portfolio" \
  -H "Authorization: Bearer $TOKEN"
```

### 8.3 Arrears Report

**Request:**
```bash
curl -X GET "$API_URL/reports/arrears" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📤 9. File Upload APIs

### 9.1 Upload Client Document

**Endpoint:** `POST /api/upload/document`

**Request:**
```bash
curl -X POST $API_URL/upload/document \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "type=national_id" \
  -F "client_id=client-uuid-here"
```

### 9.2 Upload Profile Photo

**Request:**
```bash
curl -X POST $API_URL/upload/profile-photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/photo.jpg" \
  -F "user_id=user-uuid-here"
```

---

## 🧪 Testing Workflow

### Complete Test Scenario

```bash
# 1. Register user
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","full_name":"Test User","role":"admin"}'

# 2. Login
TOKEN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  | jq -r '.session.access_token')

# 3. Create client
CLIENT=$(curl -s -X POST $API_URL/clients/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"first_name":"John","last_name":"Doe","id_number":"12345678","phone_primary":"+254712345678"}' \
  | jq -r '.client.id')

# 4. Create loan
LOAN=$(curl -s -X POST $API_URL/loans/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":\"$CLIENT\",\"principal_amount\":50000,\"duration_months\":12}" \
  | jq -r '.loan.id')

# 5. Approve loan
curl -X PATCH $API_URL/loans/$LOAN \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"approve","notes":"Approved"}'

# 6. Make payment via M-Pesa
curl -X POST $API_URL/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"phone_number\":\"254708374149\",\"amount\":5000,\"loan_id\":\"$LOAN\"}"

echo "Test completed! Loan ID: $LOAN"
```

---

## 📋 Postman Collection

Import this JSON into Postman for easy testing:

```json
{
  "info": {
    "name": "SmartLenderUp API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://smartlenderup.vercel.app/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"test@example.com\",\"password\":\"Test123!\",\"full_name\":\"Test User\"}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"test@example.com\",\"password\":\"Test123!\"}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## ✅ Testing Checklist

- [ ] User registration works
- [ ] Login returns valid token
- [ ] Token persists in requests
- [ ] Client creation works
- [ ] Loan application submitted
- [ ] Loan approval updates status
- [ ] M-Pesa STK push sends
- [ ] Payment recorded after M-Pesa
- [ ] Notifications created
- [ ] Reports return data

---

**Happy Testing! 🧪**

For issues, check `/BACKEND_SETUP.md` troubleshooting section.
