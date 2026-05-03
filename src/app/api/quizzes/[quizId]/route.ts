import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request, { params }: { params: { quizId: string } }) {
  try {
    const quizId = params.quizId

    const [quizRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM quizzes WHERE id = ?',
      [quizId]
    )

    if (quizRows.length === 0) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    const quiz = quizRows[0]

    const [questionRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC, id ASC',
      [quizId]
    )

    const questions = questionRows.map(q => {
      let options = q.options
      if (typeof options === 'string') {
        try {
          options = JSON.parse(options)
        } catch {
          options = []
        }
      }
      return { ...q, options: Array.isArray(options) ? options : [] }
    })

    return NextResponse.json({
      ...quiz,
      questions,
    })
  } catch (error) {
    console.error('GET /api/quizzes/[quizId] error:', error)
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
  }
}
