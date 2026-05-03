import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request, { params }: { params: { quizId: string } }) {
  const quizId = params.quizId

  const [quizzes] = await pool.execute<RowDataPacket[]>(
    `SELECT q.*, COUNT(qq.id) as question_count FROM quizzes q
     LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
     WHERE q.id = ?
     GROUP BY q.id`,
    [quizId]
  )

  if (!quizzes.length) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })

  const [questions] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC`,
    [quizId]
  )

  const questionsWithParsedOptions = questions.map(q => ({
    ...q,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
  }))

  return NextResponse.json({ ...quizzes[0], questions: questionsWithParsedOptions })
}

export async function PUT(req: Request, { params }: { params: { quizId: string } }) {
  const { title, description, xp_reward, time_limit, color } = await req.json()
  const quizId = params.quizId

  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  await pool.execute(
    `UPDATE quizzes SET title = ?, description = ?, xp_reward = ?, time_limit = ?, color = ?
     WHERE id = ?`,
    [title, description || '', xp_reward || 100, time_limit || 10, color || '#22c55e', quizId]
  )

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request, { params }: { params: { quizId: string } }) {
  const quizId = params.quizId

  await pool.execute(`DELETE FROM quizzes WHERE id = ?`, [quizId])

  return NextResponse.json({ ok: true })
}
