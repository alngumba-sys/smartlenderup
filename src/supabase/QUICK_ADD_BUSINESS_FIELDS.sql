-- =====================================================
-- QUICK ADD BUSINESS FIELDS TO CLIENTS TABLE
-- =====================================================
-- Run this in Supabase SQL Editor to add business fields
-- to your clients table if they don't already exist
-- =====================================================

-- Add business fields to clients table (safe to run multiple times)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_location TEXT,
ADD COLUMN IF NOT EXISTS years_in_business INTEGER;

-- Add column comments for documentation
COMMENT ON COLUMN clients.business_type IS 'Type of business (e.g., Retail, Agriculture, Services, Manufacturing, etc.)';
COMMENT ON COLUMN clients.business_name IS 'Registered or trading name of the business';
COMMENT ON COLUMN clients.business_location IS 'Physical location or address of the business';
COMMENT ON COLUMN clients.years_in_business IS 'Number of years the business has been operating';

-- Create index for business_type for faster filtering (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_clients_business_type ON clients(business_type);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- 1. Verify columns were added successfully
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'clients'
AND column_name IN ('business_type', 'business_name', 'business_location', 'years_in_business')
ORDER BY column_name;

-- 2. Check column comments
SELECT 
  cols.column_name,
  pg_catalog.col_description(c.oid, cols.ordinal_position::int) as column_comment
FROM information_schema.columns cols
JOIN pg_catalog.pg_class c ON c.relname = cols.table_name
WHERE cols.table_name = 'clients'
AND cols.column_name IN ('business_type', 'business_name', 'business_location', 'years_in_business')
ORDER BY cols.column_name;

-- 3. Verify index was created
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'clients'
AND indexname = 'idx_clients_business_type';

-- =====================================================
-- SAMPLE DATA QUERY
-- =====================================================

-- View clients with business information (if any exist)
SELECT 
  id,
  first_name,
  last_name,
  business_type,
  business_name,
  business_location,
  years_in_business,
  monthly_income
FROM clients
WHERE business_type IS NOT NULL
LIMIT 10;

-- =====================================================
-- BUSINESS ANALYTICS QUERIES
-- =====================================================

-- Count clients by business type
SELECT 
  business_type,
  COUNT(*) as client_count
FROM clients
WHERE business_type IS NOT NULL
GROUP BY business_type
ORDER BY client_count DESC;

-- Average years in business by type
SELECT 
  business_type,
  AVG(years_in_business) as avg_years,
  COUNT(*) as total_clients
FROM clients
WHERE business_type IS NOT NULL
AND years_in_business IS NOT NULL
GROUP BY business_type
ORDER BY avg_years DESC;

-- Established businesses (5+ years)
SELECT 
  business_name,
  business_type,
  business_location,
  years_in_business,
  monthly_income
FROM clients
WHERE years_in_business >= 5
ORDER BY years_in_business DESC;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Business fields have been successfully added to the clients table!';
  RAISE NOTICE '   - business_type (TEXT)';
  RAISE NOTICE '   - business_name (TEXT)';
  RAISE NOTICE '   - business_location (TEXT)';
  RAISE NOTICE '   - years_in_business (INTEGER)';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Index created: idx_clients_business_type';
  RAISE NOTICE '📝 Column comments added for documentation';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All business fields are now ready to use!';
END $$;
