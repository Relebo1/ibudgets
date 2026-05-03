import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const moduleId = searchParams.get('moduleId')
  const lessonId = searchParams.get('lessonId')

  // If lessonId is provided, return single lesson with quiz
  if (lessonId) {
    const [lessonRows] = await pool.execute<RowDataPacket[]>(
      `SELECT l.*,
         COALESCE(ul.completed, 0) AS completed
       FROM lessons l
       LEFT JOIN user_lessons ul ON ul.lesson_id = l.id AND ul.user_id = ?
       WHERE l.id = ?`,
      [userId ?? 0, lessonId]
    )

    if (lessonRows.length === 0) {
      return NextResponse.json({ lesson: null, quiz: null })
    }

    const lesson = lessonRows[0]

    // Get associated quiz if exists
    const [quizRows] = await pool.execute<RowDataPacket[]>(
      `SELECT q.*,
         COALESCE(uq.score, NULL) AS score,
         COALESCE(uq.completed, 0) AS completed
       FROM quizzes q
       LEFT JOIN user_quizzes uq ON uq.quiz_id = q.id AND uq.user_id = ?
       WHERE q.module_id = (SELECT module_id FROM lessons WHERE id = ?)`,
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

  // Otherwise return list of lessons
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
