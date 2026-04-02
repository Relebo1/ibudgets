import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM income WHERE user_id = ? ORDER BY date DESC',
    [userId]
  )
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const { userId, source, category, amount, frequency, date, color } = await req.json()
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO income (user_id, source, category, amount, frequency, date, color) VALUES (?,?,?,?,?,?,?)',
    [userId, source, category ?? 'Other', amount, frequency ?? 'monthly', date, color ?? '#22c55e']
  )
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM income WHERE id = ?', [result.insertId])
  return NextResponse.json(rows[0], { status: 201 })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await pool.execute('DELETE FROM income WHERE id = ?', [id])
  return NextResponse.json({ deleted: id })
}
