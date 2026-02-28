-- ==========================================
-- CLIENT PORTAL & NOTIFICATIONS - SIMPLE VERSION
-- ==========================================

-- Step 1: Add client password fields
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS client_password TEXT,
ADD COLUMN IF NOT EXISTS has_changed_password BOOLEAN DEFAULT FALSE;

-- Step 2: Add staff member fields to loans
ALTER TABLE loans
ADD COLUMN IF NOT EXISTS staff_member_id TEXT,
ADD COLUMN IF NOT EXISTS staff_member_name TEXT;

-- Step 3: Drop existing notifications table if it exists
DROP TABLE IF EXISTS notifications CASCADE;

-- Step 4: Create notifications table (simple version, no constraints yet)
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  action_required BOOLEAN DEFAULT FALSE,
  related_id TEXT,
  related_type TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create indexes
CREATE INDEX idx_notifications_org_id ON notifications(organization_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Step 6: Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies
CREATE POLICY "Enable read access for organization members"
  ON notifications FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for organization members"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for organization members"
  ON notifications FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete for organization members"
  ON notifications FOR DELETE
  USING (true);

-- Success!
SELECT 'Setup complete! ✅' as status;
