import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request, { params }: { params: { lessonId: string } }) {
  try {
    const [lessons] = await pool.execute<RowDataPacket[]>(
      `SELECT l.*, m.title as module_title FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE l.id = ?`,
      [params.lessonId]
    )

    if (!lessons.length) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    return NextResponse.json(lessons[0])
  } catch (error) {
    console.error('GET /api/admin/lessons/[lessonId] error:', error)
    return NextResponse.json({ error: 'Failed to fetch lesson', details: String(error) }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { lessonId: string } }) {
  try {
    const { title, description, content, youtube_url, duration_minutes, order_index } = await req.json()

    if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    await pool.execute(
      `UPDATE lessons SET title = ?, description = ?, content = ?, youtube_url = ?, duration_minutes = ?, order_index = ?
       WHERE id = ?`,
      [title, description || '', content || '', youtube_url || '', duration_minutes || 0, order_index || 0, params.lessonId]
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('PUT /api/admin/lessons/[lessonId] error:', error)
    return NextResponse.json({ error: 'Failed to update lesson', details: String(error) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { lessonId: string } }) {
  try {
    await pool.execute(`DELETE FROM lessons WHERE id = ?`, [params.lessonId])
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/admin/lessons/[lessonId] error:', error)
    return NextResponse.json({ error: 'Failed to delete lesson', details: String(error) }, { status: 500 })
  }
}
