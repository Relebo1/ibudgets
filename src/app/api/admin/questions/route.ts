import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export async function POST(req: Request) {
  const { quizId, question, options, correctIndex, explanation } = await req.json()
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO quiz_questions (quiz_id, question, options, correct_index, explanation) VALUES (?,?,?,?,?)',
    [quizId, question, JSON.stringify(options), correctIndex, explanation ?? '']
  )
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM quiz_questions WHERE id = ?', [result.insertId])
  const row = rows[0] as RowDataPacket
  return NextResponse.json({ ...row, options: JSON.parse(row.options as string) }, { status: 201 })
}

export async function PUT(req: Request) {
  const { id, question, options, correctIndex, explanation } = await req.json()
  await pool.execute(
    'UPDATE quiz_questions SET question=?, options=?, correct_index=?, explanation=? WHERE id=?',
    [question, JSON.stringify(options), correctIndex, explanation, id]
  )
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM quiz_questions WHERE id = ?', [id])
  const row = rows[0] as RowDataPacket
  return NextResponse.json({ ...row, options: JSON.parse(row.options as string) })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await pool.execute('DELETE FROM quiz_questions WHERE id = ?', [id])
  return NextResponse.json({ deleted: id })
}
