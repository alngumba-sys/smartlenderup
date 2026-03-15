import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

export function UrgentFixBanner() {
  const openSupabase = () => {
    window.open('https://supabase.com/dashboard/project/_/sql/new', '_blank');
  };

  const copySQLToClipboard = () => {
    const sql = `-- Remove duplicates
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY organization_id, product_code 
    ORDER BY created_at DESC
  ) as row_num
  FROM loan_products
)
DELETE FROM loan_products
WHERE id IN (SELECT id FROM duplicates WHERE row_num > 1);

-- Prevent future duplicates
ALTER TABLE loan_products
DROP CONSTRAINT IF EXISTS unique_product_code_per_org;

ALTER TABLE loan_products
ADD CONSTRAINT unique_product_code_per_org 
UNIQUE (organization_id, product_code);`;

    navigator.clipboard.writeText(sql);
    alert('✅ SQL copied to clipboard! Now paste it in Supabase SQL Editor.');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-300 rounded-full blur-lg animate-pulse"></div>
              <AlertTriangle className="relative size-8 animate-bounce" />
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
              🚨 DUPLICATE KEY ERROR DETECTED
            </h2>
            <p className="text-lg mb-4 text-red-50">
              Your database has <strong>duplicate product codes</strong> causing the warning: 
              <code className="bg-black/30 px-2 py-1 rounded ml-2 text-yellow-300">
                "⚠️ Duplicate key on attempt 1. Retrying..."
              </code>
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={copySQLToClipboard}
                className="px-6 py-3 bg-white text-red-600 rounded-lg font-bold text-lg hover:bg-red-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                📋 1. Copy SQL Fix
              </button>
              
              <button
                onClick={openSupabase}
                className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <ExternalLink className="size-5" />
                2. Open Supabase SQL Editor
              </button>
              
              <div className="px-4 py-2 bg-black/30 rounded-lg">
                <p className="text-sm text-white font-medium">
                  ⏱️ Takes 30 seconds • ✅ Fixes permanently
                </p>
              </div>
            </div>
            
            <div className="mt-3 flex items-center gap-2 text-sm text-red-100">
              <span className="inline-block w-2 h-2 bg-red-300 rounded-full animate-pulse"></span>
              <span>After running SQL: Refresh page and warning disappears forever</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
