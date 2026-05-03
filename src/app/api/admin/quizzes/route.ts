import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get('lessonId')

    let sql = `SELECT q.*, l.title as lesson_title, COUNT(qq.id) as question_count
               FROM quizzes q
               LEFT JOIN lessons l ON q.lesson_id = l.id
               LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id`
    const params: any[] = []

    if (lessonId) {
      sql += ` WHERE q.lesson_id = ?`
      params.push(lessonId)
    }

    sql += ` GROUP BY q.id ORDER BY q.id DESC`

    const [rows] = await pool.execute<RowDataPacket[]>(sql, params)
    return NextResponse.json(rows)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { lesson_id, title, description, xp_reward, time_limit } = await req.json()

    if (!lesson_id) return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 })
    if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const [result] = await pool.execute(
      `INSERT INTO quizzes (lesson_id, title, description, xp_reward, time_limit)
       VALUES (?, ?, ?, ?, ?)`,
      [lesson_id, title, description || '', xp_reward || 100, time_limit || 10]
    )

    const id = (result as any).insertId
    return NextResponse.json({ id, lesson_id, title, description, xp_reward, time_limit }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 })
  }
}
