import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { name, email, password, school, major, year } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }

    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?', [email]
    )
    if ((existing as RowDataPacket[]).length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const avatar = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password, school, major, year, avatar) VALUES (?,?,?,?,?,?,?)',
      [name, email, hashed, school ?? '', major ?? '', year ?? 'Freshman', avatar]
    )

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, school, major, year, avatar, xp, level, streak, monthly_budget, total_saved, total_spent, is_admin FROM users WHERE id = ?',
      [result.insertId]
    )

    return NextResponse.json({ user: rows[0] }, { status: 201 })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
