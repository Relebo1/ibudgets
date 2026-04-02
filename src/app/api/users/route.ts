import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export async function GET() {
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM users')
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, password, school = '', major = '', year = 'Freshman' } = body
  const avatar = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO users (name, email, password, school, major, year, avatar) VALUES (?,?,?,?,?,?,?)',
    [name, email, password, school, major, year, avatar]
  )
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [result.insertId])
  return NextResponse.json(rows[0], { status: 201 })
}
