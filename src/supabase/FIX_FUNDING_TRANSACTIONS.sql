-- ============================================
-- FIX: Add user_id column to funding_transactions
-- ============================================
-- This script safely adds the missing user_id column
-- Run this in Supabase SQL Editor
-- ============================================

-- First, check if the table exists and add the column if missing
DO $$
BEGIN
    -- Check if funding_transactions table exists
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'funding_transactions'
    ) THEN
        -- Table exists, add column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'funding_transactions' 
            AND column_name = 'user_id'
        ) THEN
            -- Add the missing user_id column
            ALTER TABLE public.funding_transactions 
            ADD COLUMN user_id UUID;
            
            RAISE NOTICE 'Added user_id column to funding_transactions table';
        ELSE
            RAISE NOTICE 'user_id column already exists in funding_transactions table';
        END IF;
    ELSE
        -- Table doesn't exist, create it with all columns
        CREATE TABLE public.funding_transactions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            organization_id UUID,
            user_id UUID,
            bank_account_id UUID,
            shareholder_id UUID,
            transaction_type TEXT DEFAULT 'Credit' CHECK (transaction_type IN ('Credit', 'Debit')),
            amount DECIMAL(15,2) NOT NULL,
            date DATE NOT NULL,
            reference TEXT,
            description TEXT,
            source TEXT,
            shareholder_name TEXT,
            payment_method TEXT,
            depositor_name TEXT,
            related_loan_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_funding_transactions_org ON public.funding_transactions(organization_id);
        CREATE INDEX IF NOT EXISTS idx_funding_transactions_bank ON public.funding_transactions(bank_account_id);
        
        -- Enable RLS
        ALTER TABLE public.funding_transactions ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "funding_transactions_select_policy"
        ON public.funding_transactions FOR SELECT
        TO authenticated
        USING (true);
        
        CREATE POLICY "funding_transactions_insert_policy"
        ON public.funding_transactions FOR INSERT
        TO authenticated
        WITH CHECK (true);
        
        RAISE NOTICE 'Created funding_transactions table with user_id column';
    END IF;
END $$;

-- Success message
SELECT 'Fix applied successfully! The user_id column has been added.' AS result;
