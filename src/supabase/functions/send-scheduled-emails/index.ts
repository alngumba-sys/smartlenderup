// Scheduled email function for automated reminders
// Deploy with: supabase functions deploy send-scheduled-emails
// Schedule with pg_cron or call via webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const resend = new Resend(resendApiKey)

    let totalEmailsSent = 0
    const errors: any[] = []
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    console.log(`Running scheduled emails for ${todayStr}`)

    // Get all active automation rules
    const { data: rules, error: rulesError } = await supabase
      .from('email_automation_rules')
      .select('*, email_templates(*), email_settings!inner(organization_id, from_email, from_name, enable_reminders, enable_alerts)')
      .eq('active', true)

    if (rulesError) {
      console.error('Error fetching rules:', rulesError)
      throw rulesError
    }

    console.log(`Found ${rules?.length || 0} active automation rules`)

    // Process each rule
    for (const rule of rules || []) {
      try {
        // Skip if email settings disabled for this type
        if (rule.trigger_type.includes('reminder') && !rule.email_settings.enable_reminders) {
          console.log(`Skipping rule ${rule.name} - reminders disabled`)
          continue
        }
        if (rule.trigger_type.includes('overdue') && !rule.email_settings.enable_alerts) {
          console.log(`Skipping rule ${rule.name} - alerts disabled`)
          continue
        }

        const orgId = rule.organization_id
        console.log(`Processing rule: ${rule.name} for org: ${orgId}`)

        // Handle different trigger types
        if (rule.trigger_type === 'days_before_due') {
          await processDaysBeforeDue(rule, supabase, resend, orgId, totalEmailsSent, errors)
        } else if (rule.trigger_type === 'days_overdue') {
          await processDaysOverdue(rule, supabase, resend, orgId, totalEmailsSent, errors)
        } else if (rule.trigger_type === 'loan_approved') {
          await processLoanApproved(rule, supabase, resend, orgId, totalEmailsSent, errors)
        } else if (rule.trigger_type === 'disbursed') {
          await processDisbursed(rule, supabase, resend, orgId, totalEmailsSent, errors)
        }
      } catch (ruleError: any) {
        console.error(`Error processing rule ${rule.name}:`, ruleError)
        errors.push({ rule: rule.name, error: ruleError.message })
      }
    }

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      emailsSent: totalEmailsSent,
      rulesProcessed: rules?.length || 0,
      errors: errors.length > 0 ? errors : undefined
    }

    console.log('Scheduled emails complete:', response)

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error('Fatal error in scheduled emails:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

// Helper function: Process "days before due" reminders
async function processDaysBeforeDue(rule: any, supabase: any, resend: any, orgId: string, totalEmailsSent: number, errors: any[]) {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + (rule.trigger_days || 0))
  const targetDateStr = targetDate.toISOString().split('T')[0]

  console.log(`Looking for payments due on ${targetDateStr}`)

  // Get payments due on target date
  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*, loans!inner(*, clients!inner(*))')
    .eq('organization_id', orgId)
    .eq('due_date', targetDateStr)
    .in('status', ['pending', 'scheduled'])

  if (paymentsError) {
    console.error('Error fetching payments:', paymentsError)
    return
  }

  console.log(`Found ${payments?.length || 0} payments due on ${targetDateStr}`)

  for (const payment of payments || []) {
    if (!payment.loans?.clients?.email) {
      console.log(`Skipping payment ${payment.id} - no client email`)
      continue
    }

    try {
      const emailBody = replaceTemplateVariables(rule.email_templates.body, payment, rule)
      const emailSubject = replaceTemplateVariables(rule.email_templates.subject, payment, rule)

      await resend.emails.send({
        from: rule.email_settings.from_email || 'BV Funguo Ltd <info@bvfunguo.com>',
        to: [payment.loans.clients.email],
        subject: emailSubject,
        html: emailBody.replace(/\n/g, '<br>')
      })

      // Log the email
      await supabase.from('email_logs').insert({
        organization_id: orgId,
        recipient_email: payment.loans.clients.email,
        recipient_name: payment.loans.clients.name,
        subject: emailSubject,
        template_type: rule.email_templates.template_type,
        loan_id: payment.loan_id,
        client_id: payment.client_id,
        status: 'sent'
      })

      totalEmailsSent++
      console.log(`Sent reminder to ${payment.loans.clients.email}`)
    } catch (emailError: any) {
      console.error(`Error sending to ${payment.loans.clients.email}:`, emailError)
      errors.push({
        payment_id: payment.id,
        client_email: payment.loans.clients.email,
        error: emailError.message
      })

      // Log failed email
      await supabase.from('email_logs').insert({
        organization_id: orgId,
        recipient_email: payment.loans.clients.email,
        recipient_name: payment.loans.clients.name,
        subject: emailSubject,
        template_type: rule.email_templates.template_type,
        loan_id: payment.loan_id,
        client_id: payment.client_id,
        status: 'failed',
        error_message: emailError.message
      })
    }
  }
}

// Helper function: Process overdue reminders
async function processDaysOverdue(rule: any, supabase: any, resend: any, orgId: string, totalEmailsSent: number, errors: any[]) {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() - (rule.trigger_days || 0))
  const targetDateStr = targetDate.toISOString().split('T')[0]

  console.log(`Looking for payments overdue since ${targetDateStr}`)

  // Get overdue payments
  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*, loans!inner(*, clients!inner(*))')
    .eq('organization_id', orgId)
    .eq('due_date', targetDateStr)
    .in('status', ['pending', 'overdue'])

  if (paymentsError) {
    console.error('Error fetching overdue payments:', paymentsError)
    return
  }

  console.log(`Found ${payments?.length || 0} overdue payments`)

  for (const payment of payments || []) {
    if (!payment.loans?.clients?.email) continue

    try {
      const emailBody = replaceTemplateVariables(rule.email_templates.body, payment, rule)
      const emailSubject = replaceTemplateVariables(rule.email_templates.subject, payment, rule)

      await resend.emails.send({
        from: rule.email_settings.from_email || 'BV Funguo Ltd <info@bvfunguo.com>',
        to: [payment.loans.clients.email],
        subject: emailSubject,
        html: emailBody.replace(/\n/g, '<br>')
      })

      // Log the email
      await supabase.from('email_logs').insert({
        organization_id: orgId,
        recipient_email: payment.loans.clients.email,
        recipient_name: payment.loans.clients.name,
        subject: emailSubject,
        template_type: rule.email_templates.template_type,
        loan_id: payment.loan_id,
        client_id: payment.client_id,
        status: 'sent'
      })

      totalEmailsSent++
    } catch (emailError: any) {
      errors.push({ payment_id: payment.id, error: emailError.message })
    }
  }
}

// Helper function: Process loan approved notifications
async function processLoanApproved(rule: any, supabase: any, resend: any, orgId: string, totalEmailsSent: number, errors: any[]) {
  // This would typically be triggered by a database trigger or webhook
  // For now, we'll skip it in the scheduled function
  console.log('Loan approved notifications are event-driven, skipping in scheduled run')
}

// Helper function: Process disbursement notifications
async function processDisbursed(rule: any, supabase: any, resend: any, orgId: string, totalEmailsSent: number, errors: any[]) {
  // This would typically be triggered by a database trigger or webhook
  // For now, we'll skip it in the scheduled function
  console.log('Disbursement notifications are event-driven, skipping in scheduled run')
}

// Helper function: Replace template variables
function replaceTemplateVariables(template: string, payment: any, rule: any): string {
  const client = payment.loans?.clients || {}
  const loan = payment.loans || {}
  
  return template
    .replace(/{{client_name}}/g, client.name || 'Valued Client')
    .replace(/{{loan_id}}/g, loan.loan_number || loan.id || 'N/A')
    .replace(/{{amount}}/g, payment.amount?.toLocaleString() || '0')
    .replace(/{{currency}}/g, 'KSh ')
    .replace(/{{due_date}}/g, payment.due_date || 'TBD')
    .replace(/{{outstanding_balance}}/g, loan.outstanding_balance?.toLocaleString() || '0')
    .replace(/{{interest_rate}}/g, loan.interest_rate || '0')
    .replace(/{{loan_term}}/g, `${loan.loan_term || '0'} ${loan.loan_term_unit || 'months'}`)
    .replace(/{{days_overdue}}/g, rule.trigger_days || '0')
    .replace(/{{late_fee}}/g, '0') // Calculate actual late fee if needed
    .replace(/{{disbursement_date}}/g, loan.disbursement_date || 'TBD')
    .replace(/{{first_payment_date}}/g, 'TBD')
    .replace(/{{organization_name}}/g, 'BV Funguo Ltd')
    .replace(/{{organization_phone}}/g, '+254 XXX XXX XXX')
    .replace(/{{organization_email}}/g, 'info@bvfunguo.com')
}
