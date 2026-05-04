-- ============================================================
-- iBudget TiDB Cloud - Add Missing Columns to modules
-- ============================================================

-- Add missing columns to modules table
ALTER TABLE modules ADD COLUMN color VARCHAR(20) DEFAULT '#22c55e' AFTER difficulty;
ALTER TABLE modules ADD COLUMN xp_reward INT DEFAULT 100 AFTER color;

-- Verify the fix
DESCRIBE modules;

-- Expected output should now show:
-- id, title, description, category, difficulty, color, xp_reward, created_at
