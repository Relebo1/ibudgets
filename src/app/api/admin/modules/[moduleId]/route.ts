import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request, { params }: { params: { moduleId: string } }) {
  try {
    const [modules] = await pool.execute<RowDataPacket[]>(
      `SELECT m.*, COUNT(l.id) as lesson_count
       FROM modules m
       LEFT JOIN lessons l ON l.module_id = m.id
       WHERE m.id = ?
       GROUP BY m.id`,
      [params.moduleId]
    )

    if (!modules.length) return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    return NextResponse.json(modules[0])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch module' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { moduleId: string } }) {
  try {
    const { title, description, category, difficulty, color } = await req.json()

    if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    await pool.execute(
      `UPDATE modules SET title = ?, description = ?, category = ?, difficulty = ?, color = ?
       WHERE id = ?`,
      [title, description || '', category, difficulty, color, params.moduleId]
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { moduleId: string } }) {
  try {
    await pool.execute(`DELETE FROM modules WHERE id = ?`, [params.moduleId])
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 })
  }
}
