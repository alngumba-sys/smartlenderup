-- ═══════════════════════════════════════════════════════════════════
-- 🚀 NUCLEAR OPTION: FORCE POSTGREST CACHE RELOAD
-- ═══════════════════════════════════════════════════════════════════
-- Run this if the columns exist but PostgREST still can't see them
-- ═══════════════════════════════════════════════════════════════════

-- Force multiple cache reload signals
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
NOTIFY pgrst;

-- Wait a moment, then send again
SELECT pg_sleep(2);

NOTIFY pgrst, 'reload schema';

-- ═══════════════════════════════════════════════════════════════════
-- ⏱️ AFTER RUNNING THIS:
-- ═══════════════════════════════════════════════════════════════════
-- 1. Wait 2-3 MINUTES (yes, longer this time!)
-- 2. Go to Dashboard → Settings → API → Click "Reload schema cache"
-- 3. Wait another 2 minutes
-- 4. Refresh browser
-- 5. Try again
-- ═══════════════════════════════════════════════════════════════════
