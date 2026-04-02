import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId   = searchParams.get('userId')
  const category = searchParams.get('category')

  let sql = 'SELECT * FROM expenses WHERE 1=1'
  const params: (string | number)[] = []

  if (userId)   { sql += ' AND user_id = ?';  params.push(Number(userId)) }
  if (category) { sql += ' AND category = ?'; params.push(category) }

  sql += ' ORDER BY date DESC'
  const [rows] = await pool.execute<RowDataPacket[]>(sql, params)
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const { userId, category, description, amount, date, paymentMethod = 'Card' } = await req.json()
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO expenses (user_id, category, description, amount, date, payment_method) VALUES (?,?,?,?,?,?)',
    [userId, category, description, amount, date, paymentMethod]
  )
  // Award +10 XP for logging an expense
  await pool.execute('UPDATE users SET xp = xp + 10, level = FLOOR((xp + 10) / 500) + 1 WHERE id = ?', [userId])
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM expenses WHERE id = ?', [result.insertId])
  return NextResponse.json(rows[0], { status: 201 })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await pool.execute('DELETE FROM expenses WHERE id = ?', [id])
  return NextResponse.json({ deleted: id })
}
