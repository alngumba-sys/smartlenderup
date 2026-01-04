-- =====================================================
-- PART 3: GROUPS, TASKS
-- Run this after Part 2 completes successfully
-- =====================================================

-- 6. GROUPS (12 missing columns)
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

-- 7. TASKS (6 missing columns)
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

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
