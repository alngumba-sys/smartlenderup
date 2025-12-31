#!/bin/bash

# Batch remove all remaining syncToSupabase calls from DataContext.tsx
# This script removes lines that contain only syncToSupabase calls and their comments

# Patterns to remove:
# 1. Lines with: syncToSupabase('create', ...);
# 2. Lines with: syncToSupabase('update', ...);
# 3. Lines with: syncToSupabase('delete', ...);
# 4. Comment lines that say "// ✅ SYNC TO SUPABASE"
# 5. Comment lines that say "// Sync to Supabase"

# Usage: Run this in your terminal from project root
# chmod +x /utils/batchRemoveSyncCalls.sh
# ./utils/batchRemoveSyncCalls.sh

echo "Removing all syncToSupabase calls from DataContext.tsx..."

# Backup first
cp contexts/DataContext.tsx contexts/DataContext.tsx.backup

# Remove the lines
sed -i.bak '/^\s*syncToSupabase(/d; /^\s*\/\/ ✅ SYNC TO SUPABASE/d; /^\s*\/\/ Sync to Supabase/d' contexts/DataContext.tsx

echo "✅ Done! Backup saved to contexts/DataContext.tsx.backup"
echo "Check the file and delete the backup if everything looks good."
