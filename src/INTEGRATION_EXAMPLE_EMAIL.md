# 📧 Email Integration Example - Step by Step

## Quick Integration Guide

### **1. Import the Email Service**

Add to the top of your component file:

```typescript
import { 
  sendLoanApprovalNotification,
  sendLoanRejectionNotification,
  sendDisbursementConfirmationNotification,
  sendPaymentConfirmationNotification
} from '../../services/emailService';
```

---

## **Example 1: Loan Approval Notification**

### File: `/components/tabs/ApprovalsTab.tsx`

**Before:**
```typescript
const handleApprove = (approvalId: string) => {
  approveApproval(approvalId, 'Management Team');
};
```

**After:**
```typescript
const handleApprove = async (approvalId: string) => {
  // Approve the loan
  approveApproval(approvalId, 'Management Team');
  
  // Find the approval and related loan
  const approval = approvals.find(a => a.id === approvalId);
  if (!approval) return;
  
  const loan = loans.find(l => l.id === approval.relatedId);
  if (!loan) return;
  
  const client = clients.find(c => c.id === loan.clientId);
  if (!client || !client.email) return; // Only send if client has email
  
  // Send approval email
  console.log('📧 Sending loan approval email to:', client.email);
  const emailSent = await sendLoanApprovalNotification(
    client.email,
    client.name,
    loan.loanId || loan.id,
    loan.approvedAmount || loan.requestedAmount,
    getCurrencyCode(),
    loan.repaymentPeriod
  );
  
  if (emailSent) {
    console.log('✅ Approval email sent successfully');
    toast.success(`Loan approved! Email sent to ${client.name}`);
  } else {
    console.warn('⚠️ Loan approved but email failed to send');
    toast.warning(`Loan approved! (Email notification failed)`);
  }
};
```

---

## **Example 2: Loan Rejection Notification**

### File: `/components/tabs/ApprovalsTab.tsx`

**Before:**
```typescript
const handleReject = (approvalId: string) => {
  rejectApproval(approvalId, rejectionReason);
  setRejectionReason('');
};
```

**After:**
```typescript
const handleReject = async (approvalId: string) => {
  // Reject the loan
  rejectApproval(approvalId, rejectionReason);
  
  // Find the approval and related loan
  const approval = approvals.find(a => a.id === approvalId);
  if (!approval) return;
  
  const loan = loans.find(l => l.id === approval.relatedId);
  if (!loan) return;
  
  const client = clients.find(c => c.id === loan.clientId);
  if (!client || !client.email) {
    setRejectionReason('');
    return;
  }
  
  // Send rejection email
  console.log('📧 Sending loan rejection email to:', client.email);
  const emailSent = await sendLoanRejectionNotification(
    client.email,
    client.name,
    loan.loanId || loan.id,
    rejectionReason
  );
  
  if (emailSent) {
    console.log('✅ Rejection email sent successfully');
    toast.success(`Loan rejected. Email sent to ${client.name}`);
  } else {
    console.warn('⚠️ Loan rejected but email failed to send');
  }
  
  setRejectionReason('');
};
```

---

## **Example 3: Disbursement Confirmation**

### File: `/components/modals/DisbursementModal.tsx`

Add this after successful disbursement:

```typescript
// After updating loan with disbursement details
const handleDisbursement = async (data: DisbursementFormData) => {
  // ... existing disbursement code ...
  
  // Update the loan
  updateLoan(loan.id, {
    status: 'Active',
    disbursementDate: data.disbursementDate,
    bankAccountId: data.bankAccountId,
    // ... other fields
  });
  
  // Send disbursement confirmation email
  const client = clients.find(c => c.id === loan.clientId);
  if (client && client.email) {
    const firstPaymentDate = calculateFirstPaymentDate(
      data.disbursementDate, 
      loan.repaymentFrequency
    );
    
    console.log('📧 Sending disbursement confirmation to:', client.email);
    const emailSent = await sendDisbursementConfirmationNotification(
      client.email,
      client.name,
      loan.loanId || loan.id,
      loan.approvedAmount,
      getCurrencyCode(),
      data.disbursementDate,
      firstPaymentDate
    );
    
    if (emailSent) {
      toast.success(`Loan disbursed! Confirmation sent to ${client.name}`);
    } else {
      toast.success(`Loan disbursed! (Email notification failed)`);
    }
  }
  
  onClose();
};

// Helper function to calculate first payment date
function calculateFirstPaymentDate(disbursementDate: string, frequency: string): string {
  const date = new Date(disbursementDate);
  
  switch (frequency) {
    case 'Daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'Weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'Bi-Weekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'Monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1); // Default to monthly
  }
  
  return date.toISOString().split('T')[0];
}
```

---

## **Example 4: Payment Confirmation**

### File: `/components/modals/RecordPaymentModal.tsx`

Add this after recording a payment:

```typescript
const handleRecordPayment = async (data: PaymentFormData) => {
  // ... existing payment recording code ...
  
  // Record the payment
  const payment = {
    id: generateId(),
    loanId: loan.id,
    amount: data.amount,
    paymentDate: data.paymentDate,
    receiptNumber: data.receiptNumber,
    paymentMethod: data.paymentMethod,
    // ... other fields
  };
  
  addRepayment(payment);
  
  // Update loan outstanding balance
  const updatedLoan = updateLoan(loan.id, {
    paidAmount: (loan.paidAmount || 0) + data.amount,
    outstandingBalance: (loan.outstandingBalance || 0) - data.amount,
  });
  
  // Send payment confirmation email
  const client = clients.find(c => c.id === loan.clientId);
  if (client && client.email) {
    console.log('📧 Sending payment confirmation to:', client.email);
    const emailSent = await sendPaymentConfirmationNotification(
      client.email,
      client.name,
      loan.loanId || loan.id,
      data.amount,
      getCurrencyCode(),
      data.paymentDate,
      data.receiptNumber,
      updatedLoan.outstandingBalance
    );
    
    if (emailSent) {
      toast.success(`Payment recorded! Receipt sent to ${client.email}`);
    } else {
      toast.success(`Payment recorded! (Email failed to send)`);
    }
  } else {
    toast.success('Payment recorded successfully');
  }
  
  onClose();
};
```

---

## **Example 5: Automated Payment Reminders**

### Create a new file: `/utils/emailScheduler.ts`

```typescript
import { supabase } from '../lib/supabase';
import { sendPaymentReminderNotification } from '../services/emailService';

/**
 * Send payment reminders for upcoming due dates
 * Run this daily (can be triggered via Supabase cron job)
 */
export async function sendDailyPaymentReminders() {
  try {
    console.log('📧 Starting daily payment reminder check...');
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get current organization
    const orgData = localStorage.getItem('current_organization');
    if (!orgData) return;
    const org = JSON.parse(orgData);
    
    // Fetch all active loans from Supabase
    const { data: loans, error } = await supabase
      .from('loans')
      .select('*')
      .eq('organization_id', org.id)
      .in('status', ['Active', 'Disbursed'])
      .gt('balance', 0);
    
    if (error) {
      console.error('Error fetching loans:', error);
      return;
    }
    
    console.log(`Found ${loans?.length || 0} active loans`);
    
    // Check each loan for upcoming payments
    for (const loan of loans || []) {
      if (!loan.next_payment_date) continue;
      
      const dueDate = new Date(loan.next_payment_date);
      dueDate.setHours(0, 0, 0, 0);
      
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Send reminders at: 7 days, 3 days, 1 day before, and on due date
      const shouldSendReminder = [7, 3, 1, 0].includes(daysUntilDue);
      
      // Also send overdue reminders (1, 3, 7, 14, 30 days overdue)
      const isOverdue = daysUntilDue < 0;
      const daysOverdue = Math.abs(daysUntilDue);
      const shouldSendOverdueReminder = isOverdue && [1, 3, 7, 14, 30].includes(daysOverdue);
      
      if (shouldSendReminder || shouldSendOverdueReminder) {
        // Fetch client details
        const { data: client } = await supabase
          .from('clients')
          .select('*')
          .eq('id', loan.client_id)
          .single();
        
        if (!client || !client.email) {
          console.log(`Skipping loan ${loan.loan_number}: No client email`);
          continue;
        }
        
        console.log(`📧 Sending reminder for loan ${loan.loan_number} to ${client.email} (${daysUntilDue} days)`);
        
        // Send the reminder
        const sent = await sendPaymentReminderNotification(
          client.email,
          client.name,
          loan.loan_number,
          loan.next_payment_amount || (loan.balance / (loan.repayment_period - (loan.paid_installments || 0))),
          loan.currency || 'KES',
          loan.next_payment_date,
          daysUntilDue
        );
        
        if (sent) {
          console.log(`✅ Reminder sent for loan ${loan.loan_number}`);
          
          // Log the reminder in audit trail (optional)
          await supabase.from('audit_logs').insert({
            organization_id: org.id,
            entity_type: 'loan',
            entity_id: loan.id,
            action: 'email_reminder_sent',
            details: {
              type: isOverdue ? 'overdue_reminder' : 'payment_reminder',
              days_until_due: daysUntilDue,
              client_email: client.email
            },
            performed_by: 'system'
          });
        }
      }
    }
    
    console.log('✅ Payment reminder check complete');
  } catch (error) {
    console.error('❌ Error in payment reminder scheduler:', error);
  }
}

/**
 * Call this function daily via Supabase Edge Function cron job
 */
```

### Schedule it with Supabase Cron (Edge Function):

Create `/supabase/functions/daily-reminders/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('🔔 Running daily payment reminders...')
    
    // Your reminder logic here
    // (Simplified version - full implementation would query loans and send emails)
    
    return new Response(
      JSON.stringify({ success: true, message: 'Reminders sent' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## 🎯 **Quick Start Checklist**

- [ ] Deploy Edge Functions to Supabase
- [ ] Set `RESEND_API_KEY` in Supabase environment
- [ ] Test email sending from dashboard
- [ ] Add email field to client signup forms
- [ ] Integrate approval notifications in ApprovalsTab
- [ ] Integrate disbursement notifications in DisbursementModal
- [ ] Integrate payment confirmations in RecordPaymentModal
- [ ] Set up automated reminders (optional)

---

## 📚 **Full Documentation**

See `/EMAIL_SYSTEM_SETUP_COMPLETE.md` for complete setup guide!

---

**Need help?** All the email service code is in `/services/emailService.ts` with detailed comments! 🚀
