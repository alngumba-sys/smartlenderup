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
    const { email, password, full_name, phone, role = 'client', organization_data } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    let organizationId = null;

    // If organization data is provided, create organization first
    if (organization_data) {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organization_data.name,
          type: organization_data.type,
          registration_number: organization_data.registration_number,
          email: organization_data.email || email,
          phone: organization_data.phone || phone,
          location: organization_data.location,
          county: organization_data.county,
          physical_address: organization_data.physical_address,
          logo_url: organization_data.logo_url,
          subscription_tier: 'starter',
          subscription_status: 'trial',
        })
        .select()
        .single();

      if (orgError) {
        // Rollback: delete auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        return res.status(500).json({ error: 'Failed to create organization' });
      }

      organizationId = orgData.id;
    }

    // Create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        phone,
        role,
        organization_id: organizationId,
        status: 'active',
      })
      .select()
      .single();

    if (userError) {
      // Rollback: delete auth user and organization
      await supabase.auth.admin.deleteUser(authData.user.id);
      if (organizationId) {
        await supabase.from('organizations').delete().eq('id', organizationId);
      }
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    return res.status(201).json({
      success: true,
      user: userData,
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
