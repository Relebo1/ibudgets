import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const quizId = searchParams.get('quizId')

  if (!quizId) {
    return NextResponse.json({ error: 'quizId is required' }, { status: 400 })
  }

  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC, id ASC',
    [quizId]
  )

  const questions = rows.map(q => {
    let options = q.options
    // Handle both string and already-parsed JSON
    if (typeof options === 'string') {
      try {
        options = JSON.parse(options)
      } catch {
        options = []
      }
    }
    return {
      ...q,
      options: Array.isArray(options) ? options : [],
    }
  })

  return NextResponse.json(questions)
}

export async function POST(req: Request) {
  const { quizId, question, options, correctIndex, explanation, orderIndex } = await req.json()

  // Ensure options is an array and stringify for storage
  const optionsArray = Array.isArray(options) ? options : []
  const optionsJson = JSON.stringify(optionsArray)

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO quiz_questions (quiz_id, question, options, correct_index, explanation, order_index) VALUES (?,?,?,?,?,?)',
    [quizId, question, optionsJson, correctIndex, explanation ?? '', orderIndex ?? 0]
  )

  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM quiz_questions WHERE id = ?',
    [result.insertId]
  )

  const row = rows[0] as RowDataPacket
  let parsedOptions = row.options
  if (typeof parsedOptions === 'string') {
    try {
      parsedOptions = JSON.parse(parsedOptions)
    } catch {
      parsedOptions = []
    }
  }

  return NextResponse.json(
    { ...row, options: Array.isArray(parsedOptions) ? parsedOptions : [] },
    { status: 201 }
  )
}

export async function PUT(req: Request) {
  const { id, question, options, correctIndex, explanation, orderIndex } = await req.json()

  // Ensure options is an array and stringify for storage
  const optionsArray = Array.isArray(options) ? options : []
  const optionsJson = JSON.stringify(optionsArray)

  await pool.execute(
    'UPDATE quiz_questions SET question=?, options=?, correct_index=?, explanation=?, order_index=? WHERE id=?',
    [question, optionsJson, correctIndex, explanation, orderIndex ?? 0, id]
  )

  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM quiz_questions WHERE id = ?',
    [id]
  )

  const row = rows[0] as RowDataPacket
  let parsedOptions = row.options
  if (typeof parsedOptions === 'string') {
    try {
      parsedOptions = JSON.parse(parsedOptions)
    } catch {
      parsedOptions = []
    }
  }

  return NextResponse.json({ ...row, options: Array.isArray(parsedOptions) ? parsedOptions : [] })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await pool.execute('DELETE FROM quiz_questions WHERE id = ?', [id])
  return NextResponse.json({ deleted: id })
}
