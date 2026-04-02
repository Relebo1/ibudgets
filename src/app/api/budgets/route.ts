import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const month  = searchParams.get('month')

  let sql = 'SELECT * FROM budgets WHERE 1=1'
  const params: (string | number)[] = []

  if (userId) { sql += ' AND user_id = ?'; params.push(Number(userId)) }
  if (month)  { sql += ' AND month = ?';   params.push(month) }

  const [rows] = await pool.execute<RowDataPacket[]>(sql, params)
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const { userId, category, allocated, color = '#22c55e', month } = await req.json()
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO budgets (user_id, category, allocated, color, month) VALUES (?,?,?,?,?)',
    [userId, category, allocated, color, month]
  )
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM budgets WHERE id = ?', [result.insertId])
  return NextResponse.json(rows[0], { status: 201 })
}

export async function PUT(req: Request) {
  const { id, allocated, spent, color } = await req.json()
  await pool.execute(
    'UPDATE budgets SET allocated = COALESCE(?, allocated), spent = COALESCE(?, spent), color = COALESCE(?, color) WHERE id = ?',
    [allocated ?? null, spent ?? null, color ?? null, id]
  )
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM budgets WHERE id = ?', [id])
  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await pool.execute('DELETE FROM budgets WHERE id = ?', [id])
  return NextResponse.json({ deleted: id })
}
