-- ==========================================
-- CLIENT PORTAL & NOTIFICATIONS SETUP
-- ==========================================
-- This migration adds:
-- 1. Client password fields for client login
-- 2. Notifications table
-- 3. Staff member tracking on loans
-- ==========================================

-- Add client password fields to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS client_password TEXT,
ADD COLUMN IF NOT EXISTS has_changed_password BOOLEAN DEFAULT FALSE;

-- Add staff member fields to loans table
ALTER TABLE loans
ADD COLUMN IF NOT EXISTS staff_member_id TEXT,
ADD COLUMN IF NOT EXISTS staff_member_name TEXT;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('alert', 'info', 'success', 'warning')),
  category TEXT NOT NULL CHECK (category IN ('loan', 'payment', 'client', 'system', 'compliance', 'client_application')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  action_required BOOLEAN DEFAULT FALSE,
  related_id TEXT,
  related_type TEXT CHECK (related_type IN ('loan', 'client', 'payment')),
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key to organizations
  CONSTRAINT fk_notifications_organization 
    FOREIGN KEY (organization_id) 
    REFERENCES organizations(id) 
    ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their organization's notifications"
  ON notifications FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert notifications for their organization"
  ON notifications FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their organization's notifications"
  ON notifications FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete their organization's notifications"
  ON notifications FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Client portal and notifications setup complete!';
  RAISE NOTICE '   - Client password fields added to clients table';
  RAISE NOTICE '   - Staff member fields added to loans table';
  RAISE NOTICE '   - Notifications table created with RLS policies';
END $$;
