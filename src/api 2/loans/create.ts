import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const {
      client_id,
      loan_product_id,
      principal_amount,
      duration_months,
      purpose,
      guarantors,
      collateral,
    } = req.body;

    if (!client_id || !principal_amount || !duration_months) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get loan product details
    let interest_rate = 10; // Default
    let processing_fee = 0;
    let insurance_fee = 0;

    if (loan_product_id) {
      const { data: product } = await supabase
        .from('loan_products')
        .select('*')
        .eq('id', loan_product_id)
        .single();

      if (product) {
        interest_rate = product.interest_rate;
        processing_fee = (principal_amount * (product.processing_fee_percentage || 0)) / 100 + (product.processing_fee_fixed || 0);
        insurance_fee = (principal_amount * (product.insurance_fee_percentage || 0)) / 100;
      }
    }

    // Calculate loan amounts
    const interest_amount = (principal_amount * interest_rate * duration_months) / (100 * 12);
    const total_amount = principal_amount + interest_amount + processing_fee + insurance_fee;
    const monthly_installment = total_amount / duration_months;

    // Generate loan number
    const loan_number = `LN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Create loan
    const { data: loanData, error: loanError } = await supabase
      .from('loans')
      .insert({
        loan_number,
        client_id,
        loan_product_id,
        loan_officer_id: user.id,
        principal_amount,
        interest_rate,
        duration_months,
        processing_fee,
        insurance_fee,
        total_amount,
        monthly_installment,
        outstanding_balance: total_amount,
        paid_amount: 0,
        purpose,
        status: 'pending',
        application_date: new Date().toISOString(),
        days_in_arrears: 0,
      })
      .select()
      .single();

    if (loanError) {
      return res.status(500).json({ error: 'Failed to create loan' });
    }

    // Add guarantors if provided
    if (guarantors && guarantors.length > 0) {
      const guarantorRecords = guarantors.map((g: any) => ({
        loan_id: loanData.id,
        guarantor_name: g.name,
        guarantor_phone: g.phone,
        guarantor_id_number: g.id_number,
        guarantor_email: g.email,
        relationship_to_client: g.relationship,
      }));

      await supabase.from('loan_guarantors').insert(guarantorRecords);
    }

    // Add collateral if provided
    if (collateral && collateral.length > 0) {
      const collateralRecords = collateral.map((c: any) => ({
        loan_id: loanData.id,
        collateral_type: c.type,
        description: c.description,
        estimated_value: c.value,
      }));

      await supabase.from('loan_collateral').insert(collateralRecords);
    }

    // Create notification for client
    const { data: clientData } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', client_id)
      .single();

    if (clientData?.user_id) {
      await supabase.from('notifications').insert({
        user_id: clientData.user_id,
        title: 'Loan Application Received',
        message: `Your loan application for KES ${principal_amount.toLocaleString()} has been received and is under review.`,
        type: 'info',
        read: false,
      });
    }

    return res.status(201).json({
      success: true,
      loan: loanData,
      message: 'Loan application created successfully',
    });
  } catch (error) {
    console.error('Create loan error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
