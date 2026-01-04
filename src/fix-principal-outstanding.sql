-- SQL Script to Fix Principal Outstanding Values in Loans Table
-- Run this in your Supabase SQL Editor

-- Update principalOutstanding to be calculated proportionally from outstandingBalance
UPDATE loans
SET "principalOutstanding" = 
  CASE 
    -- If we have interestPaid, calculate precisely
    WHEN "interestPaid" IS NOT NULL THEN 
      GREATEST(0, "principalAmount" - ("paidAmount" - "interestPaid"))
    
    -- Otherwise calculate proportionally: outstanding * (principal / total repayable)
    WHEN "totalRepayable" > 0 THEN 
      ABS("outstandingBalance") * ("principalAmount" / "totalRepayable")
    
    -- Fallback: use outstanding balance
    ELSE 
      ABS("outstandingBalance")
  END
WHERE "organizationId" = (SELECT id FROM organizations WHERE name = 'BV Funguo Ltd' LIMIT 1);

-- Verify the update
SELECT 
  id,
  "clientName",
  "principalAmount",
  "totalInterest",
  "totalRepayable",
  "paidAmount",
  "interestPaid",
  "outstandingBalance",
  "principalOutstanding",
  -- Show the calculation breakdown
  ROUND("principalOutstanding", 2) as "Principal Outstanding",
  ROUND(ABS("outstandingBalance") - "principalOutstanding", 2) as "Interest Outstanding"
FROM loans
WHERE "organizationId" = (SELECT id FROM organizations WHERE name = 'BV Funguo Ltd' LIMIT 1)
  AND status IN ('Active', 'Disbursed')
ORDER BY "disbursementDate" DESC;
