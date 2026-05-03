-- ============================================================
-- iBudget Database Migration for TiDB Cloud
-- ============================================================
-- This migration creates all necessary tables for the iBudget app
-- Run this in TiDB Cloud console or via mysql client

-- ============================================================
-- 1. MODULES TABLE (Learning modules)
-- ============================================================
CREATE TABLE IF NOT EXISTS modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  difficulty ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
  color VARCHAR(20) DEFAULT '#22c55e',
  xp_reward INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category)
);

-- ============================================================
-- 2. LESSONS TABLE (Content units within modules)
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  content LONGTEXT,
  youtube_url VARCHAR(500) DEFAULT '',
  duration_minutes INT DEFAULT 0,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  INDEX idx_module_id (module_id),
  INDEX idx_order (order_index)
);

-- ============================================================
-- 3. QUIZZES TABLE (Quizzes per module)
-- ============================================================
CREATE TABLE IF NOT EXISTS quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  xp_reward INT DEFAULT 100,
  time_limit INT DEFAULT 10,
  color VARCHAR(20) DEFAULT '#22c55e',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  INDEX idx_module_id (module_id)
);

-- ============================================================
-- 4. QUIZ_QUESTIONS TABLE (Questions within quizzes)
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question TEXT NOT NULL,
  options JSON NOT NULL,
  correct_index INT NOT NULL,
  explanation TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  INDEX idx_quiz_id (quiz_id),
  INDEX idx_order (order_index)
);

-- ============================================================
-- 5. USER_MODULES TABLE (User progress tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  module_id INT NOT NULL,
  progress INT DEFAULT 0,
  completed TINYINT(1) DEFAULT 0,
  completed_lessons INT DEFAULT 0,
  UNIQUE KEY uq_user_module (user_id, module_id),
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- ============================================================
-- 6. USER_LESSONS TABLE (Lesson completion tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  completed TINYINT(1) DEFAULT 0,
  UNIQUE KEY uq_user_lesson (user_id, lesson_id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- ============================================================
-- 7. USER_QUIZZES TABLE (Quiz results tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  quiz_id INT NOT NULL,
  score INT DEFAULT NULL,
  completed TINYINT(1) DEFAULT 0,
  taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_quiz (user_id, quiz_id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these to verify the schema:
-- SHOW TABLES;
-- DESCRIBE modules;
-- DESCRIBE lessons;
-- DESCRIBE quizzes;
-- DESCRIBE quiz_questions;
-- DESCRIBE user_modules;
-- DESCRIBE user_lessons;
-- DESCRIBE user_quizzes;
