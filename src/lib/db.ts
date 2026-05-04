import mysql from 'mysql2/promise'
import initLMSTables from './initDB'

const isProduction = process.env.DB_ENV === 'production' || (process.env.NODE_ENV === 'production' && process.env.DB_HOST !== 'localhost')
const isLocal = process.env.DB_ENV === 'development' || process.env.DB_HOST === 'localhost'

const dbConfig = {
  host: process.env.DB_HOST ?? 'localhost',
  user: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? 'password1',
  database: process.env.DB_DATABASE ?? 'ibudget',
  port: Number(process.env.DB_PORT ?? (isProduction ? 4000 : 3306)),
  waitForConnections: true,
  connectionLimit: isProduction ? 10 : 5,
  queueLimit: 0,
  ssl: isProduction ? { rejectUnauthorized: true } : undefined,
} as const

const pool = mysql.createPool(dbConfig)

// Initialize LMS tables on first connection
let initialized = false
pool.on('connection', async () => {
  if (!initialized) {
    initialized = true
    try {
      await initLMSTables()
    } catch (error) {
      console.error('[iBudget] Failed to initialize LMS tables:', error)
    }
  }
})

export default pool

export async function initDB() {
  const conn = await pool.getConnection()
  try {
    // Users
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(120) NOT NULL,
        email       VARCHAR(180) NOT NULL UNIQUE,
        password    VARCHAR(255) NOT NULL,
        school      VARCHAR(150) DEFAULT '',
        major       VARCHAR(150) DEFAULT '',
        year        VARCHAR(50)  DEFAULT 'Freshman',
        avatar      VARCHAR(10)  DEFAULT '',
        monthly_budget DECIMAL(12,2) DEFAULT 1500.00,
        xp          INT          DEFAULT 0,
        level       INT          DEFAULT 1,
        streak      INT          DEFAULT 0,
        total_saved DECIMAL(12,2) DEFAULT 0.00,
        total_spent DECIMAL(12,2) DEFAULT 0.00,
        last_login  TIMESTAMP    NULL DEFAULT NULL,
        is_admin    TINYINT(1)   DEFAULT 0,
        created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Budgets
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS budgets (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT          NOT NULL,
        category    VARCHAR(100) NOT NULL,
        allocated   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        spent       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        color       VARCHAR(20)  DEFAULT '#22c55e',
        month       VARCHAR(7)   NOT NULL,
        created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Expenses
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        user_id        INT           NOT NULL,
        category       VARCHAR(100)  NOT NULL,
        description    VARCHAR(255)  NOT NULL,
        amount         DECIMAL(12,2) NOT NULL,
        date           DATE          NOT NULL,
        payment_method VARCHAR(50)   DEFAULT 'Card',
        created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Savings goals
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS savings_goals (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        user_id        INT           NOT NULL,
        name           VARCHAR(150)  NOT NULL,
        target_amount  DECIMAL(12,2) NOT NULL,
        current_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        deadline       DATE          NOT NULL,
        color          VARCHAR(20)   DEFAULT '#22c55e',
        category       VARCHAR(100)  DEFAULT 'General',
        created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Modules (simplified - only title, description, category, difficulty)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS modules (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        title      VARCHAR(150) NOT NULL,
        description TEXT,
        category   VARCHAR(100) NOT NULL,
        difficulty ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // User module progress
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS user_modules (
        id                  INT AUTO_INCREMENT PRIMARY KEY,
        user_id             INT NOT NULL,
        module_id           INT NOT NULL,
        progress            INT DEFAULT 0,
        completed           TINYINT(1) DEFAULT 0,
        completed_lessons   INT DEFAULT 0,
        UNIQUE KEY uq_user_module (user_id, module_id),
        FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
      )
    `)

    // Lessons (structured content units per module)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS lessons (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        module_id     INT          NOT NULL,
        title         VARCHAR(150) NOT NULL,
        description   TEXT,
        content       LONGTEXT,
        youtube_url   VARCHAR(500) DEFAULT '',
        duration_minutes INT DEFAULT 0,
        order_index   INT          DEFAULT 0,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
      )
    `)

    // User lesson completion
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS user_lessons (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT NOT NULL,
        lesson_id  INT NOT NULL,
        completed  TINYINT(1) DEFAULT 0,
        UNIQUE KEY uq_user_lesson (user_id, lesson_id),
        FOREIGN KEY (user_id)  REFERENCES users(id)   ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
      )
    `)

    // Quizzes (global)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        module_id   INT          NOT NULL,
        lesson_id   INT          NULL,
        title       VARCHAR(150) NOT NULL,
        description TEXT,
        xp_reward   INT          DEFAULT 100,
        time_limit  INT          DEFAULT 10,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL
      )
    `)

    // Quiz questions
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id       INT  NOT NULL,
        question      TEXT NOT NULL,
        options       JSON NOT NULL,
        correct_index INT  NOT NULL,
        explanation   TEXT,
        order_index   INT  DEFAULT 0,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      )
    `)

    // User quiz results
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS user_quizzes (
        id        INT AUTO_INCREMENT PRIMARY KEY,
        user_id   INT NOT NULL,
        quiz_id   INT NOT NULL,
        score     INT DEFAULT NULL,
        completed TINYINT(1) DEFAULT 0,
        taken_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_quiz (user_id, quiz_id),
        FOREIGN KEY (user_id) REFERENCES users(id)   ON DELETE CASCADE,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      )
    `)

    // Debts
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS debts (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT           NOT NULL,
        name            VARCHAR(150)  NOT NULL,
        lender          VARCHAR(150)  DEFAULT '',
        total_amount    DECIMAL(12,2) NOT NULL,
        remaining       DECIMAL(12,2) NOT NULL,
        interest_rate   DECIMAL(5,2)  DEFAULT 0.00,
        monthly_payment DECIMAL(12,2) DEFAULT 0.00,
        due_date        DATE          NOT NULL,
        category        VARCHAR(100)  DEFAULT 'Loan',
        color           VARCHAR(20)   DEFAULT '#ef4444',
        created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Budget alerts log
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS budget_alerts (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT          NOT NULL,
        budget_id  INT          NOT NULL,
        threshold  INT          NOT NULL,
        seen       TINYINT(1)   DEFAULT 0,
        created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id)  REFERENCES users(id)    ON DELETE CASCADE,
        FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
      )
    `)

    console.log('[iBudget] ✅ Database tables verified / created')

    // Income sources
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS income (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT           NOT NULL,
        source      VARCHAR(150)  NOT NULL,
        category    VARCHAR(100)  DEFAULT 'Other',
        amount      DECIMAL(12,2) NOT NULL,
        frequency   ENUM('monthly','weekly','once') DEFAULT 'monthly',
        date        DATE          NOT NULL,
        color       VARCHAR(20)   DEFAULT '#22c55e',
        created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    await migrateDB(conn)
  } finally {
    conn.release()
  }
}

// Safe additive migrations — run on both local and TiDB Cloud
export async function migrateDB(existingConn?: any) {
  const conn = existingConn ?? await pool.getConnection()
  const release = !existingConn
  try {
    // Remove old columns from modules if they exist
    const alterations = [
      `ALTER TABLE modules DROP COLUMN IF EXISTS color`,
      `ALTER TABLE modules DROP COLUMN IF EXISTS xp_reward`,
      `ALTER TABLE modules DROP COLUMN IF EXISTS duration`,
      `ALTER TABLE modules DROP COLUMN IF EXISTS lessons`,
      `ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL DEFAULT NULL`,
      `ALTER TABLE users ADD COLUMN is_admin TINYINT(1) DEFAULT 0`,
      `ALTER TABLE debts ADD COLUMN color VARCHAR(20) DEFAULT '#ef4444'`,
      `ALTER TABLE lessons ADD COLUMN content LONGTEXT`,
      `ALTER TABLE lessons ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      `ALTER TABLE lessons ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
      `ALTER TABLE quizzes ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      `ALTER TABLE quiz_questions ADD COLUMN order_index INT DEFAULT 0`,
    ]
    for (const sql of alterations) {
      await conn.execute(sql).catch(() => {})
    }
    console.log('[iBudget] ✅ Migrations applied')
  } finally {
    if (release) conn.release()
  }
}
