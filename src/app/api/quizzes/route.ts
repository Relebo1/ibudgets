import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId   = searchParams.get('userId')
  const moduleId = searchParams.get('moduleId')

  let sql = `
    SELECT q.*,
      COALESCE(uq.score, NULL)     AS score,
      COALESCE(uq.completed, 0)    AS completed
    FROM quizzes q
    LEFT JOIN user_quizzes uq ON uq.quiz_id = q.id AND uq.user_id = ?
  `
  const params: (string | number)[] = [userId ?? 0]

  if (moduleId) { sql += ' WHERE q.module_id = ?'; params.push(Number(moduleId)) }

  const [quizRows] = await pool.execute<RowDataPacket[]>(sql, params)

  // Attach questions to each quiz
  const quizzes = await Promise.all(
    quizRows.map(async (quiz) => {
      const [qRows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC, id ASC',
        [quiz.id]
      )
      return {
        ...quiz,
        questions: qRows.map(q => {
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
    })
  )

  return NextResponse.json(quizzes)
}

export async function PUT(req: Request) {
  const { userId, quizId, score, completed } = await req.json()
  await pool.execute(
    `INSERT INTO user_quizzes (user_id, quiz_id, score, completed)
     VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE score = VALUES(score), completed = VALUES(completed)`,
    [userId, quizId, score, completed ? 1 : 0]
  )
  // Award XP from quiz xp_reward when completed
  if (completed) {
    const [qRows] = await pool.execute<RowDataPacket[]>('SELECT xp_reward FROM quizzes WHERE id = ?', [quizId])
    const xp = (qRows[0] as RowDataPacket)?.xp_reward ?? 100
    await pool.execute('UPDATE users SET xp = xp + ?, level = FLOOR((xp + ?) / 500) + 1 WHERE id = ?', [xp, xp, userId])
  }
  return NextResponse.json({ ok: true })
}
