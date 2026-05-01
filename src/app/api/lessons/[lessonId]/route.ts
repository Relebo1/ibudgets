import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lessonId = searchParams.get('lessonId')
  const userId = searchParams.get('userId')

  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId required' }, { status: 400 })
  }

  // Get lesson with completion status
  const [lessonRows] = await pool.execute<RowDataPacket[]>(
    `SELECT l.*,
       COALESCE(ul.completed, 0) AS completed
     FROM lessons l
     LEFT JOIN user_lessons ul ON ul.lesson_id = l.id AND ul.user_id = ?
     WHERE l.id = ?`,
    [userId ?? 0, lessonId]
  )

  if (lessonRows.length === 0) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  const lesson = lessonRows[0]

  // Get associated quiz if exists
  const [quizRows] = await pool.execute<RowDataPacket[]>(
    `SELECT q.*,
       COALESCE(uq.score, NULL) AS score,
       COALESCE(uq.completed, 0) AS completed
     FROM quizzes q
     LEFT JOIN user_quizzes uq ON uq.quiz_id = q.id AND uq.user_id = ?
     WHERE q.lesson_id = ?`,
    [userId ?? 0, lessonId]
  )

  let quiz = null
  if (quizRows.length > 0) {
    const quizRow = quizRows[0]
    const [questionRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC, id ASC',
      [quizRow.id]
    )

    quiz = {
      ...quizRow,
      questions: questionRows.map(q => {
        let options = q.options
        if (typeof options === 'string') {
          try {
            options = JSON.parse(options)
          } catch {
            options = []
          }
        }
        return { ...q, options: Array.isArray(options) ? options : [] }
      }),
    }
  }

  return NextResponse.json({ lesson, quiz })
}
