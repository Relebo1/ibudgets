import pool from '@/lib/db'

export async function migrateAddLessonFields() {
  const conn = await pool.getConnection()
  try {
    const migrations = [
      `ALTER TABLE lessons ADD COLUMN lesson_type ENUM('Video','Written','Mixed') DEFAULT 'Mixed'`,
      `ALTER TABLE lessons ADD COLUMN content LONGTEXT`,
      `ALTER TABLE lessons ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      `ALTER TABLE lessons ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
      `ALTER TABLE lessons DROP COLUMN IF EXISTS description`,
      `ALTER TABLE lessons DROP COLUMN IF EXISTS video_duration`,
    ]

    for (const sql of migrations) {
      try {
        await conn.execute(sql)
        console.log(`✅ Migration executed: ${sql.substring(0, 50)}...`)
      } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⏭️  Column already exists, skipping...`)
        } else {
          console.error(`❌ Migration failed: ${error.message}`)
        }
      }
    }
  } finally {
    conn.release()
  }
}
