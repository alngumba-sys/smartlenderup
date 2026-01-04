-- =====================================================
-- COMPLETE PART 3: CREATE TABLES + ADD COLUMNS
-- Groups, Tasks
-- =====================================================

-- 6. CREATE GROUPS TABLE
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  group_id TEXT,
  name TEXT NOT NULL,
  location TEXT,
  meeting_day TEXT,
  meeting_time TEXT,
  chairperson TEXT,
  chairperson_phone TEXT,
  secretary TEXT,
  treasurer TEXT,
  total_members INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  group_status TEXT DEFAULT 'Active',
  default_rate NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS group_id TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS meeting_time TEXT,
ADD COLUMN IF NOT EXISTS chairperson TEXT,
ADD COLUMN IF NOT EXISTS chairperson_phone TEXT,
ADD COLUMN IF NOT EXISTS secretary TEXT,
ADD COLUMN IF NOT EXISTS treasurer TEXT,
ADD COLUMN IF NOT EXISTS total_members INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_members INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS group_status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS default_rate NUMERIC;

-- 7. CREATE TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  assigned_by TEXT,
  status TEXT DEFAULT 'Pending',
  priority TEXT DEFAULT 'Medium',
  due_date TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  completed_date TIMESTAMPTZ,
  related_entity_type TEXT,
  related_entity_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS assigned_by TEXT,
ADD COLUMN IF NOT EXISTS created_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS completed_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS related_entity_type TEXT,
ADD COLUMN IF NOT EXISTS related_entity_id TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_groups_org_id ON groups(organization_id);
CREATE INDEX IF NOT EXISTS idx_groups_group_id ON groups(group_id);
CREATE INDEX IF NOT EXISTS idx_groups_group_status ON groups(group_status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_date ON tasks(created_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view groups in their organization" ON groups;
CREATE POLICY "Users can view groups in their organization"
  ON groups FOR SELECT
  USING (organization_id IN (SELECT id FROM organizations WHERE id = organization_id));

DROP POLICY IF EXISTS "Users can view all tasks" ON tasks;
CREATE POLICY "Users can view all tasks"
  ON tasks FOR SELECT
  USING (true);
