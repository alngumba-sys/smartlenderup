-- =====================================================
-- AUDIT LOGS TABLE SCHEMA
-- For compliance, security monitoring, and forensic analysis
-- =====================================================

-- Drop existing table if it has wrong schema
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Create fresh audit_logs table
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- User Information
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('client', 'staff', 'admin')),
  
  -- Action Details
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('loan', 'payment', 'profile', 'document', 'application', 'settings')),
  resource_id TEXT,
  
  -- Additional Context
  details JSONB DEFAULT '{}',
  
  -- Network Information
  ip_address TEXT,
  user_agent TEXT,
  
  -- Organization (for multi-tenancy)
  organization_id TEXT,
  
  -- Timestamp
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);

-- Composite index for common queries
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action, timestamp DESC);

-- Comments
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all client and staff actions';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of the user who performed the action (client_id or staff_id)';
COMMENT ON COLUMN audit_logs.user_type IS 'Type of user: client, staff, or admin';
COMMENT ON COLUMN audit_logs.action IS 'Action performed: LOGIN, VIEW, DOWNLOAD, UPDATE, etc.';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource accessed';
COMMENT ON COLUMN audit_logs.resource_id IS 'Specific record ID accessed (loan_number, payment_id, etc.)';
COMMENT ON COLUMN audit_logs.details IS 'Additional metadata as JSON (e.g., amount, method, fields_changed)';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the request';
COMMENT ON COLUMN audit_logs.user_agent IS 'Browser/device user agent string';

-- Row-Level Security (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Clients can only view their own audit logs
CREATE POLICY "Clients can view their own audit logs"
ON audit_logs FOR SELECT
USING (user_id = current_setting('app.current_user_id', true) AND user_type = 'client');

-- Policy: Staff can view all audit logs in their organization
CREATE POLICY "Staff can view organization audit logs"
ON audit_logs FOR SELECT
USING (organization_id = current_setting('app.current_org_id', true));

-- Policy: System can insert audit logs (no authentication required for logging)
CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT
WITH CHECK (true);

-- Prevent updates and deletes (audit logs are immutable)
CREATE POLICY "Audit logs cannot be updated"
ON audit_logs FOR UPDATE
USING (false);

CREATE POLICY "Audit logs cannot be deleted"
ON audit_logs FOR DELETE
USING (false);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to safely insert audit log entries
CREATE OR REPLACE FUNCTION log_audit_entry(
  p_user_id TEXT,
  p_user_type TEXT,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::JSONB,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_organization_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    user_type,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent,
    organization_id,
    timestamp
  ) VALUES (
    p_user_id,
    p_user_type,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent,
    p_organization_id,
    NOW()
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent user activity
CREATE OR REPLACE FUNCTION get_user_activity(
  p_user_id TEXT,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  log_timestamp TIMESTAMPTZ,
  details JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.action,
    a.resource_type,
    a.resource_id,
    a.timestamp,
    a.details
  FROM audit_logs a
  WHERE a.user_id = p_user_id
  ORDER BY a.timestamp DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Run this to verify table was created successfully:
-- SELECT COUNT(*) as total_columns 
-- FROM information_schema.columns 
-- WHERE table_name = 'audit_logs';
-- Should return 11 columns

-- =====================================================
-- COMMON AUDIT LOG QUERIES
-- =====================================================

-- View all client actions in the last 24 hours
-- SELECT * FROM audit_logs 
-- WHERE user_id = 'client_id' 
-- AND timestamp > NOW() - INTERVAL '24 hours'
-- ORDER BY timestamp DESC;

-- View failed login attempts
-- SELECT * FROM audit_logs 
-- WHERE action = 'LOGIN_FAILED' 
-- AND timestamp > NOW() - INTERVAL '7 days'
-- ORDER BY timestamp DESC;

-- View all document downloads
-- SELECT * FROM audit_logs 
-- WHERE action = 'DOWNLOAD' 
-- AND resource_type = 'document'
-- ORDER BY timestamp DESC
-- LIMIT 100;

-- View sensitive actions (password changes, 2FA changes, etc.)
-- SELECT * FROM audit_logs 
-- WHERE action IN ('CHANGE_PASSWORD', 'ENABLE_2FA', 'DISABLE_2FA', 'UPDATE_BANK_DETAILS')
-- AND timestamp > NOW() - INTERVAL '30 days'
-- ORDER BY timestamp DESC;

-- Count actions by user
-- SELECT user_id, COUNT(*) as action_count
-- FROM audit_logs
-- WHERE timestamp > NOW() - INTERVAL '30 days'
-- GROUP BY user_id
-- ORDER BY action_count DESC;

-- Count actions by type
-- SELECT action, COUNT(*) as count
-- FROM audit_logs
-- WHERE timestamp > NOW() - INTERVAL '7 days'
-- GROUP BY action
-- ORDER BY count DESC;

-- Use helper function to get user activity
-- SELECT * FROM get_user_activity('user_id_here', 20);