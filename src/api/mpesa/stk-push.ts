import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// M-Pesa credentials
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || '';
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || '';
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || '';
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox'; // sandbox or production

// M-Pesa API URLs
const MPESA_BASE_URL = MPESA_ENV === 'sandbox' 
  ? 'https://sandbox.safaricom.co.ke' 
  : 'https://api.safaricom.co.ke';

// Get M-Pesa OAuth token
async function getMpesaToken(): Promise<string> {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  
  const response = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });

  const data = await response.json();
  return data.access_token;
}

// Generate timestamp for M-Pesa
function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Generate password for M-Pesa
function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  const str = `${shortcode}${passkey}${timestamp}`;
  return Buffer.from(str).toString('base64');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    const { phone_number, amount, account_reference, loan_id } = req.body;

    if (!phone_number || !amount) {
      return res.status(400).json({ error: 'Phone number and amount are required' });
    }

    // Format phone number (remove + and ensure it starts with 254)
    let formattedPhone = phone_number.replace(/\+/g, '').replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Get M-Pesa access token
    const accessToken = await getMpesaToken();

    // Generate timestamp and password
    const timestamp = generateTimestamp();
    const password = generatePassword(MPESA_SHORTCODE, MPESA_PASSKEY, timestamp);

    // Prepare STK push request
    const stkPushData = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.floor(amount), // M-Pesa requires integer
      PartyA: formattedPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: account_reference || 'SmartLenderUp',
      TransactionDesc: 'Loan Payment',
    };

    // Make STK push request to M-Pesa
    const stkResponse = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPushData),
    });

    const stkData = await stkResponse.json();

    // Save transaction to database
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const transactionData = {
      transaction_type: 'stk_push',
      merchant_request_id: stkData.MerchantRequestID,
      checkout_request_id: stkData.CheckoutRequestID,
      amount: amount,
      phone_number: formattedPhone,
      account_reference: account_reference || 'SmartLenderUp',
      transaction_desc: 'Loan Payment',
      result_code: stkData.ResponseCode,
      result_desc: stkData.ResponseDescription || stkData.CustomerMessage,
      loan_id: loan_id || null,
      status: stkData.ResponseCode === '0' ? 'pending' : 'failed',
      raw_response: stkData,
    };

    const { data: transactionRecord, error: dbError } = await supabase
      .from('mpesa_transactions')
      .insert(transactionData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Return response
    if (stkData.ResponseCode === '0') {
      return res.status(200).json({
        success: true,
        message: 'STK push sent successfully. Please check your phone.',
        merchant_request_id: stkData.MerchantRequestID,
        checkout_request_id: stkData.CheckoutRequestID,
        transaction_id: transactionRecord?.id,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: stkData.CustomerMessage || stkData.ResponseDescription || 'STK push failed',
        code: stkData.ResponseCode,
      });
    }
  } catch (error) {
    console.error('M-Pesa STK push error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
