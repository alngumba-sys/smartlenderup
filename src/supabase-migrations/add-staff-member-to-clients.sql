-- ==========================================
-- ADD STAFF MEMBER ASSIGNMENT TO CLIENTS
-- ==========================================

-- Add staff_member_id column to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS staff_member_id UUID REFERENCES payees(id) ON DELETE SET NULL;

-- Add comment for documentation
COMMENT ON COLUMN clients.staff_member_id IS 'Assigned relationship manager/staff member for this client';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_staff_member_id ON clients(staff_member_id);

-- Success message
SELECT 'Staff member assignment column added to clients table successfully! ✅' as status;
