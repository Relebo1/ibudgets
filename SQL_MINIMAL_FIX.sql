-- ============================================================
-- iBudget TiDB Cloud - Minimal Fix
-- ============================================================
-- Only one column is missing: description in lessons table

-- Add missing description column to lessons table
ALTER TABLE lessons ADD COLUMN description TEXT AFTER title;

-- Verify the fix
DESCRIBE lessons;

-- Expected output should now show:
-- id, module_id, title, description, youtube_url, order_index, duration_minutes, content, lesson_type, created_at, updated_at
