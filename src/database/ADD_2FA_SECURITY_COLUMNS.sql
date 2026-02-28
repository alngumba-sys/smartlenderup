-- =====================================================
-- ADD 2FA AND SECURITY COLUMNS TO CLIENTS TABLE
-- Migration for Two-Factor Authentication support
-- =====================================================

-- Add 2FA requirement flag
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS requires_2fa BOOLEAN DEFAULT false;

-- Add 2FA secret for TOTP (future use)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;

-- Add 2FA verified timestamp
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS two_factor_verified_at TIMESTAMPTZ;

-- Add account status for security controls
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' 
CHECK (account_status IN ('active', 'suspended', 'locked', 'pending'));

-- Add failed login attempt counter
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;

-- Add last failed login timestamp
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS last_failed_login_at TIMESTAMPTZ;

-- Add account locked until timestamp
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- Add last successful login
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Add password changed at timestamp
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- Comments for documentation
COMMENT ON COLUMN clients.requires_2fa IS 'Whether two-factor authentication is required for this client';
COMMENT ON COLUMN clients.two_factor_secret IS 'TOTP secret for authenticator apps (optional, future use)';
COMMENT ON COLUMN clients.two_factor_verified_at IS 'Timestamp when 2FA was last successfully verified';
COMMENT ON COLUMN clients.account_status IS 'Account status: active, suspended, locked, or pending';
COMMENT ON COLUMN clients.failed_login_attempts IS 'Counter for failed login attempts (resets on successful login)';
COMMENT ON COLUMN clients.last_failed_login_at IS 'Timestamp of last failed login attempt';
COMMENT ON COLUMN clients.locked_until IS 'Account is locked until this timestamp (for rate limiting)';
COMMENT ON COLUMN clients.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN clients.password_changed_at IS 'Timestamp of last password change';

-- Create index for account status lookups
CREATE INDEX IF NOT EXISTS idx_clients_account_status ON clients(account_status);

-- Create index for 2FA lookups
CREATE INDEX IF NOT EXISTS idx_clients_requires_2fa ON clients(requires_2fa) WHERE requires_2fa = true;

-- =====================================================
-- OPTIONAL: Enable 2FA for specific clients
-- =====================================================

-- Uncomment to enable 2FA for a specific client:
-- UPDATE clients SET requires_2fa = true WHERE phone = '0724314868';

-- Uncomment to enable 2FA for all VIP clients:
-- UPDATE clients SET requires_2fa = true WHERE client_category = 'VIP';

-- Uncomment to enable 2FA for clients with loans over a certain amount:
-- UPDATE clients 
-- SET requires_2fa = true 
-- WHERE id IN (
--   SELECT DISTINCT client_id FROM loans WHERE principal_amount > 100000
-- );

-- =====================================================
-- FUNCTION: Reset failed login attempts
-- =====================================================

CREATE OR REPLACE FUNCTION reset_failed_login_attempts(client_phone TEXT)
RETURNS void AS $$
BEGIN
  UPDATE clients 
  SET 
    failed_login_attempts = 0,
    last_failed_login_at = NULL,
    locked_until = NULL
  WHERE phone = client_phone;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Record failed login attempt
-- =====================================================

CREATE OR REPLACE FUNCTION record_failed_login_attempt(client_phone TEXT)
RETURNS void AS $$
DECLARE
  current_attempts INTEGER;
BEGIN
  -- Increment failed attempts
  UPDATE clients 
  SET 
    failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
    last_failed_login_at = NOW()
  WHERE phone = client_phone
  RETURNING failed_login_attempts INTO current_attempts;
  
  -- Lock account after 5 failed attempts (15 minute lockout)
  IF current_attempts >= 5 THEN
    UPDATE clients 
    SET locked_until = NOW() + INTERVAL '15 minutes'
    WHERE phone = client_phone;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Check if account is locked
-- =====================================================

CREATE OR REPLACE FUNCTION is_account_locked(client_phone TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  locked_until_time TIMESTAMPTZ;
  account_stat TEXT;
BEGIN
  SELECT locked_until, account_status 
  INTO locked_until_time, account_stat
  FROM clients 
  WHERE phone = client_phone;
  
  -- Check if account is suspended
  IF account_stat = 'suspended' OR account_stat = 'locked' THEN
    RETURN true;
  END IF;
  
  -- Check if temporary lock has expired
  IF locked_until_time IS NOT NULL AND locked_until_time > NOW() THEN
    RETURN true;
  END IF;
  
  -- If lock expired, clear it
  IF locked_until_time IS NOT NULL AND locked_until_time <= NOW() THEN
    UPDATE clients 
    SET locked_until = NULL, failed_login_attempts = 0
    WHERE phone = client_phone;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Example Queries
-- =====================================================

-- View clients with 2FA enabled:
-- SELECT phone, name, requires_2fa, last_login_at 
-- FROM clients 
-- WHERE requires_2fa = true;

-- View locked accounts:
-- SELECT phone, name, failed_login_attempts, locked_until 
-- FROM clients 
-- WHERE locked_until > NOW() OR account_status IN ('locked', 'suspended');

-- Reset a locked account:
-- SELECT reset_failed_login_attempts('0724314868');
