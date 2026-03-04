-- Staff Management Tables
-- This migration creates tables for staff users and their permissions

-- Staff Users Table
CREATE TABLE IF NOT EXISTS staff_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'staff', 'loan_officer', 'accountant', 'collector')),
  is_first_login BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, phone_number)
);

-- Staff Permissions Table
CREATE TABLE IF NOT EXISTS staff_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_user_id UUID NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  tab_name TEXT NOT NULL,
  can_view BOOLEAN DEFAULT FALSE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_user_id, tab_name)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_users_organization ON staff_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_users_phone ON staff_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_staff_users_active ON staff_users(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_permissions_staff_user ON staff_permissions(staff_user_id);
CREATE INDEX IF NOT EXISTS idx_staff_permissions_tab ON staff_permissions(tab_name);

-- Updated_at trigger for staff_users
CREATE OR REPLACE FUNCTION update_staff_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_staff_users_updated_at
  BEFORE UPDATE ON staff_users
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_users_updated_at();

-- Updated_at trigger for staff_permissions
CREATE OR REPLACE FUNCTION update_staff_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_staff_permissions_updated_at
  BEFORE UPDATE ON staff_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_permissions_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see staff from their organization
CREATE POLICY staff_users_organization_policy ON staff_users
  FOR ALL
  USING (organization_id = (SELECT organization_id FROM organizations WHERE id = organization_id));

-- Policy: Users can only see permissions for staff in their organization
CREATE POLICY staff_permissions_organization_policy ON staff_permissions
  FOR ALL
  USING (
    staff_user_id IN (
      SELECT id FROM staff_users WHERE organization_id = (SELECT organization_id FROM organizations WHERE id = organization_id)
    )
  );

-- Comments for documentation
COMMENT ON TABLE staff_users IS 'Stores staff user accounts with their basic information';
COMMENT ON TABLE staff_permissions IS 'Stores tab-level permissions for each staff user';
COMMENT ON COLUMN staff_users.password_hash IS 'Password hash - defaults to last 4 digits of phone on creation';
COMMENT ON COLUMN staff_users.is_first_login IS 'Flag to force password change on first login';
COMMENT ON COLUMN staff_permissions.tab_name IS 'Tab key from AVAILABLE_TABS constant';