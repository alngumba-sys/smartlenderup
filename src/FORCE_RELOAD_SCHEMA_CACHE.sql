-- ═══════════════════════════════════════════════════════════════════
-- 🔥 FORCE PostgREST TO RELOAD SCHEMA CACHE
-- ═══════════════════════════════════════════════════════════════════
-- Run this AFTER creating the RPC function to force cache reload
-- ═══════════════════════════════════════════════════════════════════

-- Method 1: Send NOTIFY signal to PostgREST
NOTIFY pgrst, 'reload schema';

-- Method 2: Also notify with config reload
NOTIFY pgrst, 'reload config';

-- ═══════════════════════════════════════════════════════════════════
-- ✅ AFTER RUNNING THIS:
-- ═══════════════════════════════════════════════════════════════════
-- 1. Wait 5 seconds
-- 2. Refresh your browser (Ctrl+Shift+R)
-- 3. Try creating a loan again
-- 4. The RPC function should now be visible to PostgREST!
-- ═══════════════════════════════════════════════════════════════════
