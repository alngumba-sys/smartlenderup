-- ============================================
-- CREATE PROJECT_STATES TABLE
-- Single-Object Sync Pattern for SmartLenderUp
-- ============================================

-- Drop existing table if you want to start fresh (CAREFUL!)
-- DROP TABLE IF EXISTS project_states;

-- Create the project_states table
CREATE TABLE IF NOT EXISTS project_states (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  state JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add a unique constraint on organization_id
  CONSTRAINT unique_org_state UNIQUE (organization_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_states_org_id ON project_states(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_states_updated_at ON project_states(updated_at);

-- Create a GIN index for JSONB queries (optional, for advanced querying)
CREATE INDEX IF NOT EXISTS idx_project_states_state_gin ON project_states USING GIN (state);

-- Enable Row Level Security (RLS)
ALTER TABLE project_states ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can only see their organization's state
CREATE POLICY "Users can view their organization's state"
  ON project_states
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Users can insert their organization's state
CREATE POLICY "Users can insert their organization's state"
  ON project_states
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Users can update their organization's state
CREATE POLICY "Users can update their organization's state"
  ON project_states
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Users can delete their organization's state
CREATE POLICY "Users can delete their organization's state"
  ON project_states
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_project_states_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER project_states_updated_at
  BEFORE UPDATE ON project_states
  FOR EACH ROW
  EXECUTE FUNCTION update_project_states_updated_at();

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if table was created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'project_states') as column_count
FROM information_schema.tables 
WHERE table_name = 'project_states';

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'project_states';

-- ============================================
-- COMPLETE! ✅
-- ============================================

/*
Usage Examples:

1. Insert/Update state (upsert):
INSERT INTO project_states (id, organization_id, state)
VALUES ('org_state_123', '123', '{"clients": [], "loans": []}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  state = EXCLUDED.state,
  updated_at = NOW();

2. Load state:
SELECT state, updated_at 
FROM project_states 
WHERE organization_id = '123';

3. Check state size:
SELECT 
  id,
  organization_id,
  pg_size_pretty(pg_column_size(state)) as state_size,
  updated_at
FROM project_states;
*/
