import mysql from 'mysql2/promise'

const tidbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password1',
  database: process.env.DB_DATABASE || 'ibudget',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined,
}

async function initializeTiDB() {
  let conn
  try {
    console.log('[iBudget] Initializing TiDB Cloud database...')
    conn = await mysql.createConnection(tidbConfig)

    // Create all LMS tables
    const migrations = [
      // Modules table
      `CREATE TABLE IF NOT EXISTS modules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        difficulty ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
        color VARCHAR(20) DEFAULT '#22c55e',
        xp_reward INT DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_category (category)
      )`,

      // Lessons table
      `CREATE TABLE IF NOT EXISTS lessons (
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
      )`,

      // Quizzes table
      `CREATE TABLE IF NOT EXISTS quizzes (
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
      )`,

      // Quiz questions table
      `CREATE TABLE IF NOT EXISTS quiz_questions (
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
      )`,

      // User modules table
      `CREATE TABLE IF NOT EXISTS user_modules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        module_id INT NOT NULL,
        progress INT DEFAULT 0,
        completed TINYINT(1) DEFAULT 0,
        completed_lessons INT DEFAULT 0,
        UNIQUE KEY uq_user_module (user_id, module_id),
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )`,

      // User lessons table
      `CREATE TABLE IF NOT EXISTS user_lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        lesson_id INT NOT NULL,
        completed TINYINT(1) DEFAULT 0,
        UNIQUE KEY uq_user_lesson (user_id, lesson_id),
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )`,

      // User quizzes table
      `CREATE TABLE IF NOT EXISTS user_quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        quiz_id INT NOT NULL,
        score INT DEFAULT NULL,
        completed TINYINT(1) DEFAULT 0,
        taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_quiz (user_id, quiz_id),
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )`,
    ]

    // Add missing columns to existing tables
    const alterations = [
      `ALTER TABLE lessons ADD COLUMN IF NOT EXISTS description TEXT`,
      `ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content LONGTEXT`,
      `ALTER TABLE lessons ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500) DEFAULT ''`,
      `ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 0`,
      `ALTER TABLE lessons ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 0`,
      `ALTER TABLE lessons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
      `ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS description TEXT`,
      `ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#22c55e'`,
      `ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS explanation TEXT`,
      `ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 0`,
    ]

    // Create tables
    for (const sql of migrations) {
      try {
        await conn.execute(sql)
      } catch (err: any) {
        // Ignore "table already exists" errors
        if (!err.message.includes('already exists')) {
          console.warn('[iBudget] Migration warning:', err.message)
        }
      }
    }

    // Add missing columns
    for (const sql of alterations) {
      try {
        await conn.execute(sql)
      } catch (err: any) {
        // Ignore "column already exists" errors
        if (!err.message.includes('Duplicate column')) {
          console.warn('[iBudget] Alteration warning:', err.message)
        }
      }
    }

    console.log('[iBudget] ✅ Database initialized successfully')
  } catch (error) {
    console.error('[iBudget] ❌ Database initialization failed:', error)
    throw error
  } finally {
    if (conn) await conn.end()
  }
}

export default initializeTiDB
