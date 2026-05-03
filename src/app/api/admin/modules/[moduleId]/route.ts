import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request, { params }: { params: { moduleId: string } }) {
  const moduleId = params.moduleId

  const [modules] = await pool.execute<RowDataPacket[]>(
    `SELECT m.*, COUNT(l.id) as lesson_count
     FROM modules m
     LEFT JOIN lessons l ON l.module_id = m.id
     WHERE m.id = ?
     GROUP BY m.id`,
    [moduleId]
  )

  if (!modules.length) return NextResponse.json({ error: 'Module not found' }, { status: 404 })

  const [lessons] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM lessons WHERE module_id = ? ORDER BY order_index ASC`,
    [moduleId]
  )

  return NextResponse.json({ ...modules[0], lessons })
}

export async function PUT(req: Request, { params }: { params: { moduleId: string } }) {
  const { title, description, category, difficulty, color } = await req.json()
  const moduleId = params.moduleId

  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  await pool.execute(
    `UPDATE modules SET title = ?, description = ?, category = ?, difficulty = ?, color = ?
     WHERE id = ?`,
    [title, description || '', category, difficulty, color, moduleId]
  )

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request, { params }: { params: { moduleId: string } }) {
  const moduleId = params.moduleId

  await pool.execute(`DELETE FROM modules WHERE id = ?`, [moduleId])

  return NextResponse.json({ ok: true })
}
