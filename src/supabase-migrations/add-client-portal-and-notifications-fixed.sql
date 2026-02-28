-- ==========================================
-- CLIENT PORTAL & NOTIFICATIONS SETUP - FIXED
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

-- Create notifications table (without inline CHECK constraints)
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
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

-- Add CHECK constraints after table creation
DO $$ 
BEGIN
  -- Add type constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notifications_type_check'
  ) THEN
    ALTER TABLE notifications 
    ADD CONSTRAINT notifications_type_check 
    CHECK (type IN ('alert', 'info', 'success', 'warning'));
  END IF;

  -- Add category constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notifications_category_check'
  ) THEN
    ALTER TABLE notifications 
    ADD CONSTRAINT notifications_category_check 
    CHECK (category IN ('loan', 'payment', 'client', 'system', 'compliance', 'client_application'));
  END IF;

  -- Add related_type constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notifications_related_type_check'
  ) THEN
    ALTER TABLE notifications 
    ADD CONSTRAINT notifications_related_type_check 
    CHECK (related_type IS NULL OR related_type IN ('loan', 'client', 'payment'));
  END IF;
END $$;

-- Add foreign key constraint to organizations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_notifications_organization'
  ) THEN
    ALTER TABLE notifications
    ADD CONSTRAINT fk_notifications_organization 
    FOREIGN KEY (organization_id) 
    REFERENCES organizations(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their organization's notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications for their organization" ON notifications;
DROP POLICY IF EXISTS "Users can update their organization's notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their organization's notifications" ON notifications;

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
  RAISE NOTICE '   - All constraints and indexes created';
END $$;
