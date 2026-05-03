import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request, { params }: { params: { quizId: string } }) {
  try {
    const [quizzes] = await pool.execute<RowDataPacket[]>(
      `SELECT q.*, COUNT(qq.id) as question_count FROM quizzes q
       LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
       WHERE q.id = ?
       GROUP BY q.id`,
      [params.quizId]
    )

    if (!quizzes.length) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })

    const [questions] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC`,
      [params.quizId]
    )

    const questionsWithParsedOptions = questions.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }))

    return NextResponse.json({ ...quizzes[0], questions: questionsWithParsedOptions })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { quizId: string } }) {
  try {
    const { title, description, xp_reward, time_limit } = await req.json()

    if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    await pool.execute(
      `UPDATE quizzes SET title = ?, description = ?, xp_reward = ?, time_limit = ?
       WHERE id = ?`,
      [title, description || '', xp_reward || 100, time_limit || 10, params.quizId]
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update quiz' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { quizId: string } }) {
  try {
    await pool.execute(`DELETE FROM quizzes WHERE id = ?`, [params.quizId])
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 })
  }
}
