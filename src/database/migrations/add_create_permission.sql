-- Migration: Add can_create column to staff_permissions table
-- Date: 2026-03-04
-- Description: Adds the can_create permission column to enable full CRUD permissions (View, Create, Edit, Delete)

-- Add can_create column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'staff_permissions' 
    AND column_name = 'can_create'
  ) THEN
    ALTER TABLE staff_permissions 
    ADD COLUMN can_create BOOLEAN DEFAULT FALSE;
    
    RAISE NOTICE 'Added can_create column to staff_permissions table';
  ELSE
    RAISE NOTICE 'can_create column already exists in staff_permissions table';
  END IF;
END $$;

-- Update existing records to set can_create based on can_edit
-- (If they can edit, they can likely create as well)
UPDATE staff_permissions 
SET can_create = can_edit 
WHERE can_create IS NULL OR can_create = FALSE;

RAISE NOTICE 'Migration completed: can_create column added and populated';
