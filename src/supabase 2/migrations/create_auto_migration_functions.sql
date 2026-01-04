-- ============================================
-- AUTO SCHEMA MIGRATION - HELPER FUNCTIONS
-- ============================================
-- This file creates the necessary functions to support
-- automatic schema migration in the SmartLenderUp platform
-- ============================================

-- Function to get all columns in a table
CREATE OR REPLACE FUNCTION get_table_columns(table_name TEXT)
RETURNS TABLE(column_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT c.column_name::TEXT
  FROM information_schema.columns c
  WHERE c.table_name = get_table_columns.table_name
  AND c.table_schema = 'public'
  ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_table_columns(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_columns(TEXT) TO anon;

-- Function to execute dynamic SQL statements
CREATE OR REPLACE FUNCTION execute_sql(sql_statement TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE sql_statement;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO anon;

-- Function to check if a column exists in a table
CREATE OR REPLACE FUNCTION column_exists(
  table_name TEXT,
  column_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = column_exists.table_name
    AND column_name = column_exists.column_name
  ) INTO exists;
  
  RETURN exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION column_exists(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION column_exists(TEXT, TEXT) TO anon;

-- Function to add a column if it doesn't exist
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  table_name TEXT,
  column_name TEXT,
  column_type TEXT,
  column_default TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  sql TEXT;
  column_def TEXT;
BEGIN
  -- Check if column already exists
  IF column_exists(table_name, column_name) THEN
    RETURN FALSE; -- Column already exists
  END IF;
  
  -- Build column definition
  column_def := column_name || ' ' || column_type;
  
  -- Add default if provided
  IF column_default IS NOT NULL THEN
    column_def := column_def || ' DEFAULT ' || column_default;
  END IF;
  
  -- Build and execute ALTER TABLE statement
  sql := 'ALTER TABLE ' || table_name || ' ADD COLUMN ' || column_def;
  
  EXECUTE sql;
  
  RETURN TRUE; -- Column was added
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION add_column_if_not_exists(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_column_if_not_exists(TEXT, TEXT, TEXT, TEXT) TO anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Auto-migration helper functions created successfully!';
  RAISE NOTICE '✅ Functions available:';
  RAISE NOTICE '   - get_table_columns(table_name)';
  RAISE NOTICE '   - execute_sql(sql_statement)';
  RAISE NOTICE '   - column_exists(table_name, column_name)';
  RAISE NOTICE '   - add_column_if_not_exists(table_name, column_name, column_type, column_default)';
END $$;
