import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request, { params }: { params: { lessonId: string } }) {
  const lessonId = params.lessonId

  try {
    const [lessons] = await pool.execute<RowDataPacket[]>(
      `SELECT l.*, m.title as module_title FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE l.id = ?`,
      [lessonId]
    )

    if (!lessons.length) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

    return NextResponse.json(lessons[0])
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { lessonId: string } }) {
  const { title, lesson_type, content, youtube_url, duration_minutes, order_index } = await req.json()
  const lessonId = params.lessonId

  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  if (!lesson_type) return NextResponse.json({ error: 'Lesson type required' }, { status: 400 })

  // Validate based on lesson type
  if (lesson_type === 'Video' && !youtube_url?.trim()) {
    return NextResponse.json({ error: 'Video URL required for Video lessons' }, { status: 400 })
  }
  if (lesson_type === 'Written' && !content?.trim()) {
    return NextResponse.json({ error: 'Content required for Written lessons' }, { status: 400 })
  }
  if (lesson_type === 'Mixed') {
    if (!content?.trim()) return NextResponse.json({ error: 'Content required for Mixed lessons' }, { status: 400 })
    if (!youtube_url?.trim()) return NextResponse.json({ error: 'Video URL required for Mixed lessons' }, { status: 400 })
  }

  try {
    await pool.execute(
      `UPDATE lessons SET title = ?, lesson_type = ?, content = ?, youtube_url = ?, duration_minutes = ?, order_index = ?
       WHERE id = ?`,
      [title, lesson_type, content || '', youtube_url || '', duration_minutes || 0, order_index || 0, lessonId]
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { lessonId: string } }) {
  const lessonId = params.lessonId

  try {
    await pool.execute(`DELETE FROM lessons WHERE id = ?`, [lessonId])
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 })
  }
}
