import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT m.*, COUNT(l.id) as lesson_count
     FROM modules m
     LEFT JOIN lessons l ON l.module_id = m.id
     GROUP BY m.id
     ORDER BY m.id DESC`
  )
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const { title, description, category, difficulty, color } = await req.json()

  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  if (!category?.trim()) return NextResponse.json({ error: 'Category required' }, { status: 400 })

  const [result] = await pool.execute(
    `INSERT INTO modules (title, description, category, difficulty, color)
     VALUES (?, ?, ?, ?, ?)`,
    [title, description || '', category, difficulty || 'Beginner', color || '#22c55e']
  )

  const id = (result as any).insertId
  return NextResponse.json({ id, title, description, category, difficulty, color }, { status: 201 })
}
