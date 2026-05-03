import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lessonId = searchParams.get('lessonId')

  let sql = `SELECT q.*, l.title as lesson_title, m.title as module_title, COUNT(qq.id) as question_count
             FROM quizzes q
             LEFT JOIN lessons l ON q.lesson_id = l.id
             LEFT JOIN modules m ON q.module_id = m.id
             LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id`
  const params: any[] = []

  if (lessonId) {
    sql += ` WHERE q.lesson_id = ?`
    params.push(lessonId)
  }

  sql += ` GROUP BY q.id ORDER BY q.id DESC`

  const [rows] = await pool.execute<RowDataPacket[]>(sql, params)
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const { lesson_id, module_id, title, description, xp_reward, time_limit, color } = await req.json()

  if (!lesson_id) return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 })
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const [result] = await pool.execute(
    `INSERT INTO quizzes (lesson_id, module_id, title, description, xp_reward, time_limit, color)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [lesson_id, module_id, title, description || '', xp_reward || 100, time_limit || 10, color || '#22c55e']
  )

  const id = (result as any).insertId
  return NextResponse.json({ id, lesson_id, module_id, title, description, xp_reward, time_limit, color }, { status: 201 })
}
