-- Check what columns exist in the shareholders table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'shareholders'
    AND table_schema = 'public'
ORDER BY 
    ordinal_position;

-- Check if there are any shareholders
SELECT COUNT(*) as shareholder_count FROM shareholders;

-- If there are shareholders, show sample data
SELECT * FROM shareholders LIMIT 3;
