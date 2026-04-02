import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  // Join modules with user progress
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT m.*,
       COALESCE(um.progress, 0)           AS progress,
       COALESCE(um.completed, 0)          AS completed,
       COALESCE(um.completed_lessons, 0)  AS completed_lessons
     FROM modules m
     LEFT JOIN user_modules um ON um.module_id = m.id AND um.user_id = ?
     ORDER BY m.id`,
    [userId ?? 0]
  )
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
