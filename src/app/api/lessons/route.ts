import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const moduleId = searchParams.get('moduleId')

  const params: any[] = [userId ?? 0]
  let sql = `
    SELECT l.*,
      COALESCE(ul.completed, 0) AS completed
    FROM lessons l
    LEFT JOIN user_lessons ul ON ul.lesson_id = l.id AND ul.user_id = ?
  `
  if (moduleId) { sql += ' WHERE l.module_id = ?'; params.push(Number(moduleId)) }
  sql += ' ORDER BY l.order_index, l.id'

  const [rows] = await pool.execute<RowDataPacket[]>(sql, params)
  return NextResponse.json(rows)
}

export async function PUT(req: Request) {
  const { userId, lessonId, completed } = await req.json()
  await pool.execute(
    `INSERT INTO user_lessons (user_id, lesson_id, completed) VALUES (?,?,?)
     ON DUPLICATE KEY UPDATE completed = VALUES(completed)`,
    [userId, lessonId, completed ? 1 : 0]
  )
  return NextResponse.json({ ok: true })
}
