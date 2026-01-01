-- =====================================================
-- FIX PART 2: Add columns to groups and tasks
-- =====================================================

-- GROUPS (12 missing columns)
ALTER TABLE groups ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS group_id TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS meeting_time TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS chairperson TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS chairperson_phone TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS secretary TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS treasurer TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS total_members INTEGER DEFAULT 0;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS active_members INTEGER DEFAULT 0;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS group_status TEXT DEFAULT 'Active';
ALTER TABLE groups ADD COLUMN IF NOT EXISTS default_rate NUMERIC;

-- TASKS (6 missing columns)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_by TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_date TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS related_entity_type TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS related_entity_id TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes TEXT;
