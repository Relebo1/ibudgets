import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: Request, { params }: { params: { quizId: string } }) {
  try {
    const { question, options, correct_index, explanation, order_index } = await req.json()

    if (!question?.trim()) return NextResponse.json({ error: 'Question required' }, { status: 400 })
    if (!Array.isArray(options) || options.length !== 4) return NextResponse.json({ error: 'Exactly 4 options required' }, { status: 400 })
    if (options.some((o: string) => !o?.trim())) return NextResponse.json({ error: 'All options must be filled' }, { status: 400 })
    if (correct_index === undefined || correct_index < 0 || correct_index >= 4) {
      return NextResponse.json({ error: 'Valid correct_index (0-3) required' }, { status: 400 })
    }

    const [result] = await pool.execute(
      `INSERT INTO quiz_questions (quiz_id, question, options, correct_index, explanation, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [params.quizId, question, JSON.stringify(options), correct_index, explanation || '', order_index || 0]
    )

    const id = (result as any).insertId
    return NextResponse.json({ id, quiz_id: params.quizId, question, options, correct_index, explanation, order_index }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { quizId: string } }) {
  try {
    const { questionId, question, options, correct_index, explanation, order_index } = await req.json()

    if (!question?.trim()) return NextResponse.json({ error: 'Question required' }, { status: 400 })
    if (!Array.isArray(options) || options.length !== 4) return NextResponse.json({ error: 'Exactly 4 options required' }, { status: 400 })
    if (options.some((o: string) => !o?.trim())) return NextResponse.json({ error: 'All options must be filled' }, { status: 400 })
    if (correct_index === undefined || correct_index < 0 || correct_index >= 4) {
      return NextResponse.json({ error: 'Valid correct_index (0-3) required' }, { status: 400 })
    }

    await pool.execute(
      `UPDATE quiz_questions SET question = ?, options = ?, correct_index = ?, explanation = ?, order_index = ?
       WHERE id = ? AND quiz_id = ?`,
      [question, JSON.stringify(options), correct_index, explanation || '', order_index || 0, questionId, params.quizId]
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { quizId: string } }) {
  try {
    const { questionId } = await req.json()

    await pool.execute(
      `DELETE FROM quiz_questions WHERE id = ? AND quiz_id = ?`,
      [questionId, params.quizId]
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
