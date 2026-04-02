import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM debts WHERE user_id = ? ORDER BY due_date ASC',
    [userId]
  )
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const { userId, name, lender, totalAmount, remaining, interestRate, monthlyPayment, dueDate, category, color } = await req.json()
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO debts (user_id, name, lender, total_amount, remaining, interest_rate, monthly_payment, due_date, category, color) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [userId, name, lender ?? '', totalAmount, remaining ?? totalAmount, interestRate ?? 0, monthlyPayment ?? 0, dueDate, category ?? 'Loan', color ?? '#ef4444']
  )
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM debts WHERE id = ?', [result.insertId])
  return NextResponse.json(rows[0], { status: 201 })
}

export async function PUT(req: Request) {
  const { id, remaining } = await req.json()
  await pool.execute('UPDATE debts SET remaining = ? WHERE id = ?', [remaining, id])
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM debts WHERE id = ?', [id])
  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await pool.execute('DELETE FROM debts WHERE id = ?', [id])
  return NextResponse.json({ deleted: id })
}
