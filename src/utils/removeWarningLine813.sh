#!/bin/bash
# This script removes line 813 from supabaseDataService.ts
# Line 813 contains: console.warn('   "🚀 AUTO-FIX: STARTING AUTOMATIC DUPLICATE CLEANUP"');

# Use sed to delete line 813
sed -i '813d' ./services/supabaseDataService.ts

echo "✅ Removed warning line 813"
