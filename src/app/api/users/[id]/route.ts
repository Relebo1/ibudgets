import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { name, email, school, major, year } = await req.json()
  await pool.execute(
    'UPDATE users SET name=?, email=?, school=?, major=?, year=? WHERE id=?',
    [name, email, school, major, year, params.id]
  )
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, name, email, school, major, year, avatar, xp, level, streak, monthly_budget, total_saved, total_spent FROM users WHERE id=?',
    [params.id]
  )
  return NextResponse.json(rows[0])
}
