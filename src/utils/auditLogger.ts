import { supabase } from '../lib/supabase';

export interface AuditLogEntry {
  user_id: string;
  user_type: 'client' | 'staff' | 'admin';
  action: string;
  resource_type: 'loan' | 'payment' | 'profile' | 'document' | 'application' | 'settings';
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Logs an audit trail entry for compliance and security monitoring
 */
export async function logAuditTrail(entry: AuditLogEntry) {
  try {
    const logEntry = {
      user_id: entry.user_id,
      user_type: entry.user_type,
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id || null,
      details: entry.details || {},
      ip_address: entry.ip_address || null,
      user_agent: entry.user_agent || navigator.userAgent,
      timestamp: new Date().toISOString(),
      organization_id: getOrganizationId()
    };

    // Insert into audit_logs table
    const { error } = await supabase
      .from('audit_logs')
      .insert(logEntry);

    if (error) {
      // Silently fail if audit_logs table doesn't exist yet
      if (error.code === 'PGRST204' || error.code === '42P01') {
        // Table doesn't exist - log to console only
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Audit logs table not yet created. Run /database/AUDIT_LOGS_SCHEMA.sql');
        }
        return false;
      }
      
      console.error('Failed to log audit trail:', error);
      // Don't throw - audit logging failure shouldn't break user experience
      return false;
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Audit Log:', {
        action: entry.action,
        resource: `${entry.resource_type}${entry.resource_id ? `:${entry.resource_id}` : ''}`,
        user: entry.user_id
      });
    }

    return true;
  } catch (error) {
    console.error('Error in audit logging:', error);
    return false;
  }
}

/**
 * Helper to get current organization ID from localStorage
 */
function getOrganizationId(): string | null {
  try {
    const orgData = localStorage.getItem('current_organization');
    if (orgData) {
      const org = JSON.parse(orgData);
      return org.id || null;
    }
  } catch (error) {
    console.error('Error getting organization ID:', error);
  }
  return null;
}

/**
 * Convenience functions for common audit actions
 */

export function logClientLogin(clientId: string) {
  return logAuditTrail({
    user_id: clientId,
    user_type: 'client',
    action: 'LOGIN',
    resource_type: 'profile'
  });
}

export function logClientLogout(clientId: string) {
  return logAuditTrail({
    user_id: clientId,
    user_type: 'client',
    action: 'LOGOUT',
    resource_type: 'profile'
  });
}

export function logLoanView(clientId: string, loanNumber: string) {
  return logAuditTrail({
    user_id: clientId,
    user_type: 'client',
    action: 'VIEW',
    resource_type: 'loan',
    resource_id: loanNumber,
    details: { view_type: 'loan_details' }
  });
}

export function logPaymentView(clientId: string, paymentId: string) {
  return logAuditTrail({
    user_id: clientId,
    user_type: 'client',
    action: 'VIEW',
    resource_type: 'payment',
    resource_id: paymentId
  });
}

export function logPaymentInitiated(clientId: string, amount: number, method: string) {
  return logAuditTrail({
    user_id: clientId,
    user_type: 'client',
    action: 'INITIATE_PAYMENT',
    resource_type: 'payment',
    details: { amount, method }
  });
}

export function logDocumentDownload(clientId: string, documentId: string, documentName: string) {
  return logAuditTrail({
    user_id: clientId,
    user_type: 'client',
    action: 'DOWNLOAD',
    resource_type: 'document',
    resource_id: documentId,
    details: { document_name: documentName }
  });
}

export function logLoanApplication(clientId: string, loanProductId: string, amount: number) {
  return logAuditTrail({
    user_id: clientId,
    user_type: 'client',
    action: 'SUBMIT',
    resource_type: 'application',
    details: { loan_product_id: loanProductId, amount }
  });
}

export function logProfileUpdate(clientId: string, fieldsUpdated: string[]) {
  return logAuditTrail({
    user_id: clientId,
    user_type: 'client',
    action: 'UPDATE',
    resource_type: 'profile',
    details: { fields_updated: fieldsUpdated }
  });
}

export function logPasswordChange(clientId: string) {
  return logAuditTrail({
    user_id: clientId,
    user_type: 'client',
    action: 'CHANGE_PASSWORD',
    resource_type: 'settings'
  });
}

export function logTwoFactorEnabled(clientId: string) {
  return logAuditTrail({
    user_id: clientId,
    user_type: 'client',
    action: 'ENABLE_2FA',
    resource_type: 'settings'
  });
}

export function logTwoFactorDisabled(clientId: string) {
  return logAuditTrail({
    user_id: clientId,
    user_type: 'client',
    action: 'DISABLE_2FA',
    resource_type: 'settings'
  });
}