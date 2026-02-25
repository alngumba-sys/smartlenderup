/**
 * Email Service
 * 
 * Sends emails via Supabase Edge Functions using Resend
 * Supports loan notifications, payment reminders, and system alerts
 */

import { supabase } from '../lib/supabase';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

/**
 * Send an email via Supabase Edge Function
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log('📧 Sending email to:', options.to);
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: options
    });

    if (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }

    console.log('✅ Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
}

/**
 * Email Templates for BV Funguo Ltd
 */

/**
 * Loan Approval Notification
 */
export function loanApprovalEmail(
  clientName: string,
  loanId: string,
  amount: number,
  currency: string,
  repaymentPeriod: number
): EmailTemplate {
  return {
    subject: `🎉 Your Loan Has Been Approved - Loan #${loanId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0c4279 0%, #ec7347 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #ec7347; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .details { background: #f9f9f9; padding: 15px; border-left: 4px solid #ec7347; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Loan Approved!</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${clientName}</strong>,</p>
            
            <p>Congratulations! We are pleased to inform you that your loan application has been <strong>APPROVED</strong>.</p>
            
            <div class="details">
              <h3>Loan Details:</h3>
              <p><strong>Loan ID:</strong> ${loanId}</p>
              <p><strong>Approved Amount:</strong> ${currency} ${amount.toLocaleString()}</p>
              <p><strong>Repayment Period:</strong> ${repaymentPeriod} months</p>
            </div>
            
            <div class="warning">
              <p><strong>⚠️ Next Steps:</strong></p>
              <ul>
                <li>Visit our office to complete disbursement paperwork</li>
                <li>Bring your ID and any required collateral documents</li>
                <li>Funds will be disbursed within 24-48 hours after paperwork completion</li>
              </ul>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>
            <strong>BV Funguo Ltd</strong><br>
            Microfinance Solutions</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} BV Funguo Ltd. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Dear ${clientName},

Congratulations! Your loan application has been APPROVED.

Loan Details:
- Loan ID: ${loanId}
- Approved Amount: ${currency} ${amount.toLocaleString()}
- Repayment Period: ${repaymentPeriod} months

Next Steps:
- Visit our office to complete disbursement paperwork
- Bring your ID and any required collateral documents
- Funds will be disbursed within 24-48 hours

Best regards,
BV Funguo Ltd
    `
  };
}

/**
 * Loan Rejection Notification
 */
export function loanRejectionEmail(
  clientName: string,
  loanId: string,
  rejectionReason?: string
): EmailTemplate {
  return {
    subject: `Loan Application Update - Loan #${loanId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0c4279 0%, #666 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .info { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Loan Application Update</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${clientName}</strong>,</p>
            
            <p>Thank you for your interest in BV Funguo Ltd's financial services.</p>
            
            <p>After careful review, we regret to inform you that we are unable to approve your loan application <strong>#${loanId}</strong> at this time.</p>
            
            ${rejectionReason ? `
            <div class="info">
              <p><strong>Reason:</strong> ${rejectionReason}</p>
            </div>
            ` : ''}
            
            <p>We encourage you to reapply in the future. In the meantime, you may contact our customer service team to discuss alternative options or ways to improve your application.</p>
            
            <p>Best regards,<br>
            <strong>BV Funguo Ltd</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} BV Funguo Ltd. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Dear ${clientName},

After careful review, we regret to inform you that we are unable to approve your loan application #${loanId} at this time.

${rejectionReason ? `Reason: ${rejectionReason}\n\n` : ''}
We encourage you to reapply in the future or contact our team for alternative options.

Best regards,
BV Funguo Ltd
    `
  };
}

/**
 * Payment Reminder
 */
export function paymentReminderEmail(
  clientName: string,
  loanId: string,
  amountDue: number,
  currency: string,
  dueDate: string,
  daysUntilDue: number
): EmailTemplate {
  const isOverdue = daysUntilDue < 0;
  const urgency = isOverdue ? '🚨 OVERDUE' : daysUntilDue <= 3 ? '⏰ URGENT' : '📅 REMINDER';
  
  return {
    subject: `${urgency}: Payment Due for Loan #${loanId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${isOverdue ? '#d32f2f' : '#ec7347'}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .payment-info { background: #f9f9f9; padding: 20px; border-left: 4px solid #ec7347; margin: 20px 0; }
          .warning { background: ${isOverdue ? '#ffebee' : '#fff3cd'}; border-left: 4px solid ${isOverdue ? '#d32f2f' : '#ffc107'}; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${urgency}</h1>
            <h2>Payment ${isOverdue ? 'Overdue' : 'Due'}</h2>
          </div>
          <div class="content">
            <p>Dear <strong>${clientName}</strong>,</p>
            
            <p>This is a ${isOverdue ? '<strong>payment overdue notice</strong>' : 'friendly reminder'} for your loan payment.</p>
            
            <div class="payment-info">
              <h3>Payment Details:</h3>
              <p><strong>Loan ID:</strong> ${loanId}</p>
              <p><strong>Amount Due:</strong> ${currency} ${amountDue.toLocaleString()}</p>
              <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
              ${isOverdue ? `
                <p style="color: #d32f2f;"><strong>Status:</strong> OVERDUE by ${Math.abs(daysUntilDue)} days</p>
              ` : `
                <p><strong>Days Until Due:</strong> ${daysUntilDue} days</p>
              `}
            </div>
            
            <div class="warning">
              <p><strong>${isOverdue ? '⚠️ Important:' : '💡 Payment Methods:'}</strong></p>
              ${isOverdue ? `
                <p>Your payment is now overdue. Please make payment immediately to avoid:</p>
                <ul>
                  <li>Late payment fees</li>
                  <li>Impact on your credit score</li>
                  <li>Potential legal action</li>
                </ul>
              ` : `
                <ul>
                  <li>Mobile Money (M-PESA): Pay bill number [XXXX]</li>
                  <li>Bank Deposit: Account [XXXX]</li>
                  <li>Office Payment: Visit any BV Funguo branch</li>
                </ul>
              `}
            </div>
            
            <p>If you've already made this payment, please disregard this message.</p>
            
            <p>For assistance, contact us at info@bvfunguo.com or visit our office.</p>
            
            <p>Best regards,<br>
            <strong>BV Funguo Ltd</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} BV Funguo Ltd. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Dear ${clientName},

${isOverdue ? 'PAYMENT OVERDUE NOTICE' : 'Payment Reminder'}

Payment Details:
- Loan ID: ${loanId}
- Amount Due: ${currency} ${amountDue.toLocaleString()}
- Due Date: ${new Date(dueDate).toLocaleDateString()}
${isOverdue ? `- Status: OVERDUE by ${Math.abs(daysUntilDue)} days` : `- Days Until Due: ${daysUntilDue} days`}

${isOverdue ? 'Please make payment immediately to avoid late fees and credit score impact.' : 'Please ensure payment is made on or before the due date.'}

Best regards,
BV Funguo Ltd
    `
  };
}

/**
 * Disbursement Confirmation
 */
export function disbursementConfirmationEmail(
  clientName: string,
  loanId: string,
  amount: number,
  currency: string,
  disbursementDate: string,
  firstPaymentDate: string
): EmailTemplate {
  return {
    subject: `✅ Loan Disbursed - Loan #${loanId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .details { background: #e8f5e9; padding: 20px; border-left: 4px solid #4caf50; margin: 20px 0; }
          .info { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Loan Disbursed!</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${clientName}</strong>,</p>
            
            <p>Great news! Your loan has been successfully disbursed.</p>
            
            <div class="details">
              <h3>Disbursement Details:</h3>
              <p><strong>Loan ID:</strong> ${loanId}</p>
              <p><strong>Amount Disbursed:</strong> ${currency} ${amount.toLocaleString()}</p>
              <p><strong>Disbursement Date:</strong> ${new Date(disbursementDate).toLocaleDateString()}</p>
              <p><strong>First Payment Due:</strong> ${new Date(firstPaymentDate).toLocaleDateString()}</p>
            </div>
            
            <div class="info">
              <p><strong>📋 Important Information:</strong></p>
              <ul>
                <li>Please check your account/mobile wallet for the funds</li>
                <li>Keep track of your repayment schedule</li>
                <li>Make payments on time to maintain good credit standing</li>
                <li>Contact us if you have any questions</li>
              </ul>
            </div>
            
            <p>Thank you for choosing BV Funguo Ltd. We look forward to serving you!</p>
            
            <p>Best regards,<br>
            <strong>BV Funguo Ltd</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} BV Funguo Ltd. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Dear ${clientName},

Your loan has been successfully disbursed!

Disbursement Details:
- Loan ID: ${loanId}
- Amount: ${currency} ${amount.toLocaleString()}
- Disbursement Date: ${new Date(disbursementDate).toLocaleDateString()}
- First Payment Due: ${new Date(firstPaymentDate).toLocaleDateString()}

Please check your account for the funds and keep track of your repayment schedule.

Best regards,
BV Funguo Ltd
    `
  };
}

/**
 * Payment Confirmation
 */
export function paymentConfirmationEmail(
  clientName: string,
  loanId: string,
  amount: number,
  currency: string,
  paymentDate: string,
  receiptNumber: string,
  remainingBalance: number
): EmailTemplate {
  const isPaidOff = remainingBalance <= 0;
  
  return {
    subject: `${isPaidOff ? '🎉' : '✅'} Payment Received - Loan #${loanId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${isPaidOff ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)' : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .details { background: #f9f9f9; padding: 20px; border-left: 4px solid #2196f3; margin: 20px 0; }
          .success { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isPaidOff ? '🎉 Loan Fully Paid!' : '✅ Payment Received'}</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${clientName}</strong>,</p>
            
            <p>${isPaidOff ? 'Congratulations! Your loan has been fully paid off.' : 'Thank you for your payment. We have received your installment.'}</p>
            
            <div class="details">
              <h3>Payment Details:</h3>
              <p><strong>Loan ID:</strong> ${loanId}</p>
              <p><strong>Amount Paid:</strong> ${currency} ${amount.toLocaleString()}</p>
              <p><strong>Payment Date:</strong> ${new Date(paymentDate).toLocaleDateString()}</p>
              <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
              <p><strong>Remaining Balance:</strong> ${currency} ${Math.max(0, remainingBalance).toLocaleString()}</p>
            </div>
            
            ${isPaidOff ? `
            <div class="success">
              <p><strong>🎊 Congratulations!</strong></p>
              <p>You have successfully completed your loan repayment. Thank you for your commitment and timely payments.</p>
              <p>We would love to serve you again in the future. You may now be eligible for larger loan amounts with better terms.</p>
            </div>
            ` : `
            <p>Keep up the good work! Regular payments help maintain your excellent credit standing with us.</p>
            `}
            
            <p>Thank you for being a valued customer of BV Funguo Ltd.</p>
            
            <p>Best regards,<br>
            <strong>BV Funguo Ltd</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} BV Funguo Ltd. All rights reserved.</p>
            <p>Receipt Number: ${receiptNumber}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Dear ${clientName},

${isPaidOff ? 'Congratulations! Your loan has been fully paid off!' : 'Payment received - Thank you!'}

Payment Details:
- Loan ID: ${loanId}
- Amount Paid: ${currency} ${amount.toLocaleString()}
- Payment Date: ${new Date(paymentDate).toLocaleDateString()}
- Receipt Number: ${receiptNumber}
- Remaining Balance: ${currency} ${Math.max(0, remainingBalance).toLocaleString()}

${isPaidOff ? 'Thank you for your commitment. You may now be eligible for larger loans with better terms.' : 'Thank you for your payment!'}

Best regards,
BV Funguo Ltd

Receipt: ${receiptNumber}
    `
  };
}

/**
 * Helper function to send loan approval notification
 */
export async function sendLoanApprovalNotification(
  clientEmail: string,
  clientName: string,
  loanId: string,
  amount: number,
  currency: string,
  repaymentPeriod: number
): Promise<boolean> {
  const template = loanApprovalEmail(clientName, loanId, amount, currency, repaymentPeriod);
  
  return await sendEmail({
    to: clientEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Helper function to send loan rejection notification
 */
export async function sendLoanRejectionNotification(
  clientEmail: string,
  clientName: string,
  loanId: string,
  rejectionReason?: string
): Promise<boolean> {
  const template = loanRejectionEmail(clientName, loanId, rejectionReason);
  
  return await sendEmail({
    to: clientEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Helper function to send payment reminder
 */
export async function sendPaymentReminderNotification(
  clientEmail: string,
  clientName: string,
  loanId: string,
  amountDue: number,
  currency: string,
  dueDate: string,
  daysUntilDue: number
): Promise<boolean> {
  const template = paymentReminderEmail(clientName, loanId, amountDue, currency, dueDate, daysUntilDue);
  
  return await sendEmail({
    to: clientEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Helper function to send disbursement confirmation
 */
export async function sendDisbursementConfirmationNotification(
  clientEmail: string,
  clientName: string,
  loanId: string,
  amount: number,
  currency: string,
  disbursementDate: string,
  firstPaymentDate: string
): Promise<boolean> {
  const template = disbursementConfirmationEmail(clientName, loanId, amount, currency, disbursementDate, firstPaymentDate);
  
  return await sendEmail({
    to: clientEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Helper function to send payment confirmation
 */
export async function sendPaymentConfirmationNotification(
  clientEmail: string,
  clientName: string,
  loanId: string,
  amount: number,
  currency: string,
  paymentDate: string,
  receiptNumber: string,
  remainingBalance: number
): Promise<boolean> {
  const template = paymentConfirmationEmail(clientName, loanId, amount, currency, paymentDate, receiptNumber, remainingBalance);
  
  return await sendEmail({
    to: clientEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
