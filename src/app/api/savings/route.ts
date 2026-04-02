import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM savings_goals WHERE user_id = ?',
    [userId]
  )
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const { userId, name, targetAmount, currentAmount = 0, deadline, color = '#22c55e', category = 'General' } = await req.json()
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO savings_goals (user_id, name, target_amount, current_amount, deadline, color, category) VALUES (?,?,?,?,?,?,?)',
    [userId, name, targetAmount, currentAmount, deadline, color, category]
  )
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM savings_goals WHERE id = ?', [result.insertId])
  return NextResponse.json(rows[0], { status: 201 })
}

export async function PUT(req: Request) {
  const { id, currentAmount } = await req.json()
  // Get userId for XP award
  const [goalRows] = await pool.execute<RowDataPacket[]>('SELECT user_id FROM savings_goals WHERE id = ?', [id])
  await pool.execute('UPDATE savings_goals SET current_amount = ? WHERE id = ?', [currentAmount, id])
  if (goalRows.length > 0) {
    await pool.execute('UPDATE users SET xp = xp + 20, level = FLOOR((xp + 20) / 500) + 1 WHERE id = ?', [(goalRows[0] as RowDataPacket).user_id])
  }
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM savings_goals WHERE id = ?', [id])
  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await pool.execute('DELETE FROM savings_goals WHERE id = ?', [id])
  return NextResponse.json({ deleted: id })
}
