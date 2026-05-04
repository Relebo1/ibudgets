import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const moduleId = searchParams.get('moduleId')

  let sql = `SELECT m.id, m.title, m.description, m.category, m.difficulty,
       COALESCE(m.color, '#22c55e') AS color,
       COALESCE(m.xp_reward, 100) AS xp_reward,
       m.created_at,
       COALESCE(MAX(um.progress), 0)           AS progress,
       COALESCE(MAX(um.completed), 0)          AS completed,
       COALESCE(MAX(um.completed_lessons), 0)  AS completed_lessons,
       COUNT(DISTINCT l.id)               AS lesson_count,
       COUNT(DISTINCT q.id)               AS quiz_count
     FROM modules m
     LEFT JOIN user_modules um ON um.module_id = m.id AND um.user_id = ?
     LEFT JOIN lessons l ON l.module_id = m.id
     LEFT JOIN quizzes q ON q.module_id = m.id`
  const params: any[] = [userId ?? 0]

  if (moduleId) {
    sql += ' WHERE m.id = ?'
    params.push(moduleId)
  }

  sql += ' GROUP BY m.id ORDER BY m.id'

  const [rows] = await pool.execute<RowDataPacket[]>(sql, params)
  return NextResponse.json(rows)
}

export async function PUT(req: Request) {
  const { userId, moduleId, progress, completed, completedLessons } = await req.json()
  await pool.execute(
    `INSERT INTO user_modules (user_id, module_id, progress, completed, completed_lessons)
     VALUES (?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       progress = VALUES(progress),
       completed = VALUES(completed),
       completed_lessons = VALUES(completed_lessons)`,
    [userId, moduleId, progress, completed ? 1 : 0, completedLessons]
  )
  return NextResponse.json({ ok: true })
}
