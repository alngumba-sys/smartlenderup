-- ==========================================
-- ADD COMMISSION RATE TO PAYEES/STAFF
-- ==========================================

-- Add commission_rate column to payees table (used for staff)
ALTER TABLE payees
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 10.00;

-- Add comment for documentation
COMMENT ON COLUMN payees.commission_rate IS 'Commission percentage for loan facilitation (applies to Employee type payees)';

-- Update any existing employee payees to have default 10% commission
-- Note: Using correct Supabase column names (payee_type, not type)
UPDATE payees 
SET commission_rate = 10.00 
WHERE (payee_type = 'Employee' OR category = 'Employee') 
AND commission_rate IS NULL;

-- Success message
SELECT 'Commission rate column added successfully! ✅' as status;
