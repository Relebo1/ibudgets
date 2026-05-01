import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export async function POST(req: Request) {
  const { quizId, question, options, correctIndex, explanation, orderIndex } = await req.json()
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO quiz_questions (quiz_id, question, options, correct_index, explanation, order_index) VALUES (?,?,?,?,?,?)',
    [quizId, question, JSON.stringify(options), correctIndex, explanation, orderIndex ?? 0]
  )
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM quiz_questions WHERE id = ?', [result.insertId])
  const row = rows[0]
  return NextResponse.json({
    ...row,
    options: JSON.parse(row.options as string),
  }, { status: 201 })
}

export async function PUT(req: Request) {
  const { id, quizId, question, options, correctIndex, explanation, orderIndex } = await req.json()
  await pool.execute(
    'UPDATE quiz_questions SET quiz_id=?, question=?, options=?, correct_index=?, explanation=?, order_index=? WHERE id=?',
    [quizId, question, JSON.stringify(options), correctIndex, explanation, orderIndex ?? 0, id]
  )
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM quiz_questions WHERE id = ?', [id])
  const row = rows[0]
  return NextResponse.json({
    ...row,
    options: JSON.parse(row.options as string),
  })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await pool.execute('DELETE FROM quiz_questions WHERE id = ?', [id])
  return NextResponse.json({ deleted: id })
}
