-- ============================================================
-- iBudget TiDB Cloud Database Fix
-- ============================================================
-- Run this script in TiDB Cloud SQL Editor to fix missing columns
-- and ensure all tables have the correct schema

-- ============================================================
-- STEP 1: VERIFY CURRENT SCHEMA
-- ============================================================
-- Run these DESCRIBE commands to see current table structure:

DESCRIBE modules;
DESCRIBE lessons;
DESCRIBE quizzes;
DESCRIBE quiz_questions;
DESCRIBE user_modules;
DESCRIBE user_lessons;
DESCRIBE user_quizzes;

-- ============================================================
-- STEP 2: ADD MISSING COLUMNS TO LESSONS TABLE
-- ============================================================
-- The lessons table is missing: description, content, youtube_url, duration_minutes, order_index, updated_at

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS description TEXT AFTER title;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content LONGTEXT AFTER description;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500) DEFAULT '' AFTER content;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 0 AFTER youtube_url;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 0 AFTER duration_minutes;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- ============================================================
-- STEP 3: ADD MISSING COLUMNS TO QUIZZES TABLE
-- ============================================================
-- The quizzes table might be missing: description, color

ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS description TEXT AFTER title;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#22c55e' AFTER time_limit;

-- ============================================================
-- STEP 4: ADD MISSING COLUMNS TO QUIZ_QUESTIONS TABLE
-- ============================================================
-- The quiz_questions table might be missing: explanation, order_index

ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS explanation TEXT AFTER correct_index;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 0 AFTER explanation;

-- ============================================================
-- STEP 5: VERIFY FINAL SCHEMA
-- ============================================================
-- Run these again to verify all columns are present:

DESCRIBE modules;
-- Expected columns: id, title, description, category, difficulty, color, xp_reward, created_at

DESCRIBE lessons;
-- Expected columns: id, module_id, title, description, content, youtube_url, duration_minutes, order_index, created_at, updated_at

DESCRIBE quizzes;
-- Expected columns: id, module_id, title, description, xp_reward, time_limit, color, created_at

DESCRIBE quiz_questions;
-- Expected columns: id, quiz_id, question, options, correct_index, explanation, order_index, created_at

DESCRIBE user_modules;
-- Expected columns: id, user_id, module_id, progress, completed, completed_lessons

DESCRIBE user_lessons;
-- Expected columns: id, user_id, lesson_id, completed

DESCRIBE user_quizzes;
-- Expected columns: id, user_id, quiz_id, score, completed, taken_at

-- ============================================================
-- STEP 6: VERIFY DATA INTEGRITY
-- ============================================================
-- Check record counts:

SELECT 'modules' as table_name, COUNT(*) as count FROM modules
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'quizzes', COUNT(*) FROM quizzes
UNION ALL
SELECT 'quiz_questions', COUNT(*) FROM quiz_questions
UNION ALL
SELECT 'user_modules', COUNT(*) FROM user_modules
UNION ALL
SELECT 'user_lessons', COUNT(*) FROM user_lessons
UNION ALL
SELECT 'user_quizzes', COUNT(*) FROM user_quizzes;

-- ============================================================
-- EXPECTED SCHEMA AFTER UPDATES
-- ============================================================

-- modules table:
-- - id (INT, PK, AUTO_INCREMENT)
-- - title (VARCHAR 150, NOT NULL)
-- - description (TEXT)
-- - category (VARCHAR 100, NOT NULL)
-- - difficulty (ENUM: Beginner, Intermediate, Advanced)
-- - color (VARCHAR 20, DEFAULT '#22c55e')
-- - xp_reward (INT, DEFAULT 100)
-- - created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

-- lessons table:
-- - id (INT, PK, AUTO_INCREMENT)
-- - module_id (INT, FK → modules, NOT NULL)
-- - title (VARCHAR 150, NOT NULL)
-- - description (TEXT) ← MISSING, NEEDS TO BE ADDED
-- - content (LONGTEXT) ← MISSING, NEEDS TO BE ADDED
-- - youtube_url (VARCHAR 500, DEFAULT '') ← MISSING, NEEDS TO BE ADDED
-- - duration_minutes (INT, DEFAULT 0) ← MISSING, NEEDS TO BE ADDED
-- - order_index (INT, DEFAULT 0) ← MISSING, NEEDS TO BE ADDED
-- - created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
-- - updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE) ← MISSING, NEEDS TO BE ADDED

-- quizzes table:
-- - id (INT, PK, AUTO_INCREMENT)
-- - module_id (INT, FK → modules, NOT NULL)
-- - title (VARCHAR 255, NOT NULL)
-- - description (TEXT) ← MIGHT BE MISSING
-- - xp_reward (INT, DEFAULT 100)
-- - time_limit (INT, DEFAULT 10)
-- - color (VARCHAR 20, DEFAULT '#22c55e') ← MIGHT BE MISSING
-- - created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

-- quiz_questions table:
-- - id (INT, PK, AUTO_INCREMENT)
-- - quiz_id (INT, FK → quizzes, NOT NULL)
-- - question (TEXT, NOT NULL)
-- - options (JSON, NOT NULL)
-- - correct_index (INT, NOT NULL)
-- - explanation (TEXT) ← MIGHT BE MISSING
-- - order_index (INT, DEFAULT 0) ← MIGHT BE MISSING
-- - created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

-- user_modules table:
-- - id (INT, PK, AUTO_INCREMENT)
-- - user_id (INT, FK → users, NOT NULL)
-- - module_id (INT, FK → modules, NOT NULL)
-- - progress (INT, DEFAULT 0)
-- - completed (TINYINT, DEFAULT 0)
-- - completed_lessons (INT, DEFAULT 0)
-- - UNIQUE(user_id, module_id)

-- user_lessons table:
-- - id (INT, PK, AUTO_INCREMENT)
-- - user_id (INT, FK → users, NOT NULL)
-- - lesson_id (INT, FK → lessons, NOT NULL)
-- - completed (TINYINT, DEFAULT 0)
-- - UNIQUE(user_id, lesson_id)

-- user_quizzes table:
-- - id (INT, PK, AUTO_INCREMENT)
-- - user_id (INT, FK → users, NOT NULL)
-- - quiz_id (INT, FK → quizzes, NOT NULL)
-- - score (INT, DEFAULT NULL)
-- - completed (TINYINT, DEFAULT 0)
-- - taken_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
-- - UNIQUE(user_id, quiz_id)
