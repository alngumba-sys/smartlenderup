// Email sending function using Resend
// Deploy with: supabase functions deploy send-email --no-verify-jwt

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Resend with API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable not set')
    }

    const resend = new Resend(resendApiKey)
    
    // Parse request body
    const body: EmailRequest = await req.json()
    
    // Validate required fields
    if (!body.to) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: to' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    if (!body.subject) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: subject' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    if (!body.html && !body.text) {
      return new Response(
        JSON.stringify({ error: 'Either html or text content is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Prepare email data
    const emailData = {
      from: body.from || 'BV Funguo Ltd <info@bvfunguo.com>',
      to: Array.isArray(body.to) ? body.to : [body.to],
      subject: body.subject,
      html: body.html || body.text,
      ...(body.text && { text: body.text }),
      ...(body.replyTo && { replyTo: body.replyTo }),
      ...(body.cc && { cc: Array.isArray(body.cc) ? body.cc : [body.cc] }),
      ...(body.bcc && { bcc: Array.isArray(body.bcc) ? body.bcc : [body.bcc] }),
    }

    // Send email via Resend
    console.log('Sending email to:', emailData.to)
    const data = await resend.emails.send(emailData)

    console.log('Email sent successfully:', data)

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        message: 'Email sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error('Error sending email:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send email',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
