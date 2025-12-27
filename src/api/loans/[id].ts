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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid loan ID' });
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

    // GET - Fetch loan details
    if (req.method === 'GET') {
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .select(`
          *,
          client:clients(*),
          loan_product:loan_products(*),
          guarantors:loan_guarantors(*),
          collateral:loan_collateral(*),
          payments:payments(*)
        `)
        .eq('id', id)
        .single();

      if (loanError || !loanData) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      return res.status(200).json({
        success: true,
        loan: loanData,
      });
    }

    // PATCH - Update loan (approve, reject, disburse)
    if (req.method === 'PATCH') {
      const { action, notes, disbursement_method, disbursement_reference } = req.body;

      let updateData: any = {};

      if (action === 'approve') {
        updateData = {
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          notes,
        };
      } else if (action === 'reject') {
        updateData = {
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          notes,
        };
      } else if (action === 'disburse') {
        updateData = {
          status: 'disbursed',
          disbursed_by: user.id,
          disbursed_at: new Date().toISOString(),
          disbursement_method,
          disbursement_reference,
          notes,
        };
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }

      const { data: updatedLoan, error: updateError } = await supabase
        .from('loans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update loan' });
      }

      // Send notification to client
      const { data: clientData } = await supabase
        .from('clients')
        .select('user_id')
        .eq('id', updatedLoan.client_id)
        .single();

      if (clientData?.user_id) {
        let notificationTitle = '';
        let notificationMessage = '';
        let notificationType: any = 'info';

        if (action === 'approve') {
          notificationTitle = 'Loan Approved!';
          notificationMessage = `Congratulations! Your loan application for KES ${updatedLoan.principal_amount.toLocaleString()} has been approved.`;
          notificationType = 'loan_approved';
        } else if (action === 'reject') {
          notificationTitle = 'Loan Application Update';
          notificationMessage = `Your loan application has been reviewed. Please contact us for more information.`;
          notificationType = 'warning';
        } else if (action === 'disburse') {
          notificationTitle = 'Loan Disbursed!';
          notificationMessage = `Your loan of KES ${updatedLoan.principal_amount.toLocaleString()} has been disbursed via ${disbursement_method}.`;
          notificationType = 'success';
        }

        await supabase.from('notifications').insert({
          user_id: clientData.user_id,
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          read: false,
        });
      }

      return res.status(200).json({
        success: true,
        loan: updatedLoan,
        message: `Loan ${action}d successfully`,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Loan operation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
