-- ============================================
-- CREATE PROJECT_STATES TABLE
-- ============================================
-- This table stores the entire organization state as a JSON blob
-- for fast loading and saving (alternative to individual table queries)
-- ============================================

-- Create the project_states table
CREATE TABLE IF NOT EXISTS project_states (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL,
  state JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_organization 
    FOREIGN KEY (organization_id) 
    REFERENCES organizations(id) 
    ON DELETE CASCADE
);

-- Create index for faster lookups by organization
CREATE INDEX IF NOT EXISTS idx_project_states_org 
  ON project_states(organization_id);

-- Create index for faster lookups by updated_at
CREATE INDEX IF NOT EXISTS idx_project_states_updated 
  ON project_states(updated_at DESC);

-- Disable RLS for testing
ALTER TABLE project_states DISABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE project_states IS 'Stores entire organization state as JSON for fast bulk operations';

-- Success message
SELECT '✅ project_states table created successfully!' as status;
SELECT '🔍 You can now save/load organization data as JSON blobs' as info;
