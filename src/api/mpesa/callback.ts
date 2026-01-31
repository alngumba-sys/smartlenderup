import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const callbackData = req.body;

    console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

    // Extract callback data
    const { Body } = callbackData;
    const { stkCallback } = Body;

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    // Parse callback metadata
    let amount = 0;
    let mpesaReceiptNumber = '';
    let phoneNumber = '';
    let transactionDate = '';

    if (CallbackMetadata && CallbackMetadata.Item) {
      CallbackMetadata.Item.forEach((item: any) => {
        switch (item.Name) {
          case 'Amount':
            amount = item.Value;
            break;
          case 'MpesaReceiptNumber':
            mpesaReceiptNumber = item.Value;
            break;
          case 'PhoneNumber':
            phoneNumber = item.Value;
            break;
          case 'TransactionDate':
            transactionDate = item.Value;
            break;
        }
      });
    }

    // Update transaction in database
    const status = ResultCode === 0 ? 'success' : 'failed';
    
    const { data: transactionData, error: updateError } = await supabase
      .from('mpesa_transactions')
      .update({
        result_code: ResultCode.toString(),
        result_desc: ResultDesc,
        mpesa_receipt_number: mpesaReceiptNumber,
        transaction_id: mpesaReceiptNumber,
        transaction_date: transactionDate ? new Date(
          transactionDate.toString().replace(
            /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
            '$1-$2-$3T$4:$5:$6'
          )
        ).toISOString() : null,
        status,
        raw_response: callbackData,
        updated_at: new Date().toISOString(),
      })
      .eq('checkout_request_id', CheckoutRequestID)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // If successful, create payment record
    if (ResultCode === 0 && transactionData?.loan_id) {
      // Get loan details
      const { data: loanData } = await supabase
        .from('loans')
        .select('*')
        .eq('id', transactionData.loan_id)
        .single();

      if (loanData) {
        // Calculate principal and interest split
        const principal_paid = amount * 0.7; // 70% to principal (simplified)
        const interest_paid = amount * 0.3; // 30% to interest (simplified)

        // Generate payment number
        const payment_number = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        // Create payment record
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .insert({
            loan_id: transactionData.loan_id,
            payment_number,
            amount,
            principal_paid,
            interest_paid,
            penalty_paid: 0,
            payment_method: 'mpesa',
            payment_reference: mpesaReceiptNumber,
            mpesa_receipt_number: mpesaReceiptNumber,
            mpesa_transaction_id: mpesaReceiptNumber,
            payment_date: transactionData.transaction_date || new Date().toISOString(),
            status: 'completed',
          })
          .select()
          .single();

        if (!paymentError && paymentData) {
          // Link payment to transaction
          await supabase
            .from('mpesa_transactions')
            .update({ payment_id: paymentData.id })
            .eq('id', transactionData.id);

          // Send notification to client
          const { data: clientData } = await supabase
            .from('clients')
            .select('user_id')
            .eq('id', loanData.client_id)
            .single();

          if (clientData?.user_id) {
            await supabase.from('notifications').insert({
              user_id: clientData.user_id,
              title: 'Payment Received',
              message: `Your payment of KES ${amount.toLocaleString()} has been received. Receipt: ${mpesaReceiptNumber}`,
              type: 'payment_received',
              read: false,
            });
          }
        }
      }
    }

    // M-Pesa expects this response format
    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    // Still return success to M-Pesa to prevent retries
    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  }
}
