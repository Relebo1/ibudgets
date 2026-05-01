import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export async function GET(req: Request) {
  const [quizRows] = await pool.execute<RowDataPacket[]>(`
    SELECT q.*, GROUP_CONCAT(qq.id) as question_ids FROM quizzes q
    LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
    GROUP BY q.id ORDER BY q.id
  `)

  const quizzes = await Promise.all(quizRows.map(async (quiz) => {
    const [qRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index', [quiz.id]
    )
    return { ...quiz, questions: qRows.map(q => ({ ...q, options: JSON.parse(q.options as string) })) }
  }))

  return NextResponse.json(quizzes)
}

export async function POST(req: Request) {
  const { lessonId, title, description, xpReward, timeLimit, color } = await req.json()
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO quizzes (lesson_id, title, description, xp_reward, time_limit, color) VALUES (?,?,?,?,?,?)',
    [lessonId, title, description, xpReward ?? 100, timeLimit ?? 10, color ?? '#22c55e']
  )
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM quizzes WHERE id = ?', [result.insertId])
  return NextResponse.json({ ...rows[0], questions: [] }, { status: 201 })
}

export async function PUT(req: Request) {
  const { id, lessonId, title, description, xpReward, timeLimit, color } = await req.json()
  await pool.execute(
    'UPDATE quizzes SET lesson_id=?, title=?, description=?, xp_reward=?, time_limit=?, color=? WHERE id=?',
    [lessonId, title, description, xpReward, timeLimit, color, id]
  )
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM quizzes WHERE id = ?', [id])
  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await pool.execute('DELETE FROM quizzes WHERE id = ?', [id])
  return NextResponse.json({ deleted: id })
}
