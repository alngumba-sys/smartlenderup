-- Migration: Add organization_code column to organizations table
-- Purpose: Support organization-prefixed numbering for clients, loans, staff, etc.
-- Format: Organization code will be 2-4 letter prefix (e.g., "BVF" for BV Funguo Ltd)

-- Add organization_code column
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS organization_code TEXT;

-- Add unique constraint on organization_code
ALTER TABLE public.organizations 
ADD CONSTRAINT organizations_organization_code_unique UNIQUE (organization_code);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_organization_code 
ON public.organizations(organization_code);

-- Auto-generate organization codes for existing organizations
-- This function generates a code from the organization name
DO $$
DECLARE
  org_record RECORD;
  generated_code TEXT;
  words TEXT[];
  attempt INT;
BEGIN
  FOR org_record IN 
    SELECT id, organization_name, name 
    FROM public.organizations 
    WHERE organization_code IS NULL
  LOOP
    -- Use organization_name if available, otherwise use name
    generated_code := NULL;
    attempt := 0;
    
    -- Get organization name
    DECLARE
      org_name TEXT := COALESCE(org_record.organization_name, org_record.name, 'ORG');
    BEGIN
      -- Clean and split into words
      words := regexp_split_to_array(
        upper(regexp_replace(org_name, '[^A-Z0-9\s]', '', 'g')),
        '\s+'
      );
      
      -- Remove empty strings
      words := array_remove(words, '');
      
      -- Generate code based on words
      IF array_length(words, 1) >= 2 THEN
        -- Take first letter of first 3 words
        generated_code := substring(words[1], 1, 1);
        IF array_length(words, 1) >= 2 THEN
          generated_code := generated_code || substring(words[2], 1, 1);
        END IF;
        IF array_length(words, 1) >= 3 THEN
          generated_code := generated_code || substring(words[3], 1, 1);
        END IF;
      ELSIF array_length(words, 1) = 1 THEN
        -- Take first 3 letters of single word
        generated_code := substring(words[1], 1, 3);
      ELSE
        -- Fallback to first 3 chars of org ID
        generated_code := upper(substring(org_record.id::text, 1, 3));
      END IF;
      
      -- Ensure uniqueness by adding numbers if needed
      WHILE EXISTS (
        SELECT 1 FROM public.organizations 
        WHERE organization_code = generated_code || CASE WHEN attempt > 0 THEN attempt::text ELSE '' END
      ) LOOP
        attempt := attempt + 1;
        IF attempt > 99 THEN
          -- Give up and use UUID
          generated_code := upper(substring(org_record.id::text, 1, 6));
          EXIT;
        END IF;
      END LOOP;
      
      -- Add attempt number if needed
      IF attempt > 0 AND attempt <= 99 THEN
        generated_code := generated_code || attempt::text;
      END IF;
      
      -- Update organization with generated code
      UPDATE public.organizations 
      SET organization_code = generated_code,
          updated_at = NOW()
      WHERE id = org_record.id;
      
      RAISE NOTICE 'Generated code % for organization %', generated_code, org_name;
    END;
  END LOOP;
END $$;

-- Add comment to explain the column
COMMENT ON COLUMN public.organizations.organization_code IS 
'Unique 2-4 letter code used as prefix for client numbers, loan numbers, staff numbers, etc. Example: BVF for BV Funguo Ltd';
