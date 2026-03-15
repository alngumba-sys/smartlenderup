-- ============================================
-- CREATE CONTACT_MESSAGES TABLE
-- ============================================
-- This table stores contact form submissions from the landing page
-- ============================================

-- Create the contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_status 
  ON contact_messages(status);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created 
  ON contact_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_email 
  ON contact_messages(email);

-- Disable RLS for testing
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE contact_messages IS 'Stores contact form submissions from the website';

-- Success message
SELECT '✅ contact_messages table created successfully!' as status;
SELECT '📧 Contact form submissions will now be stored in database' as info;
