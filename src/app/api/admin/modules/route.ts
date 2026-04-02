import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export async function GET() {
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM modules ORDER BY id')
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const { title, description, category, duration, difficulty, xpReward, lessons, color } = await req.json()
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO modules (title, description, category, duration, difficulty, xp_reward, lessons, color) VALUES (?,?,?,?,?,?,?,?)',
    [title, description, category, duration, difficulty, xpReward, lessons, color ?? '#22c55e']
  )
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM modules WHERE id = ?', [result.insertId])
  return NextResponse.json(rows[0], { status: 201 })
}

export async function PUT(req: Request) {
  const { id, title, description, category, duration, difficulty, xpReward, lessons, color } = await req.json()
  await pool.execute(
    'UPDATE modules SET title=?, description=?, category=?, duration=?, difficulty=?, xp_reward=?, lessons=?, color=? WHERE id=?',
    [title, description, category, duration, difficulty, xpReward, lessons, color, id]
  )
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM modules WHERE id = ?', [id])
  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await pool.execute('DELETE FROM modules WHERE id = ?', [id])
  return NextResponse.json({ deleted: id })
}
