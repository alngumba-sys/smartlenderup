-- Add granular_permissions column to staff_users table
-- This column stores the granular permission configuration as JSON

-- Check if column exists first
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'staff_users' 
        AND column_name = 'granular_permissions'
    ) THEN
        ALTER TABLE public.staff_users 
        ADD COLUMN granular_permissions jsonb;
        
        COMMENT ON COLUMN public.staff_users.granular_permissions IS 'Stores granular permission configuration: { useGranularPermissions: boolean, role: string, customPermissions: string[] }';
    END IF;
END $$;

-- Sample data structure for granular_permissions column:
-- {
--   "useGranularPermissions": true,
--   "role": "Loan Officer",
--   "customPermissions": [] -- Empty if using role, populated if using custom permissions
-- }

-- Example update (for reference):
-- UPDATE staff_users 
-- SET granular_permissions = '{"useGranularPermissions": true, "role": "Manager", "customPermissions": []}'::jsonb
-- WHERE id = 'your-staff-id';
