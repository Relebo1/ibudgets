import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const moduleId = searchParams.get('moduleId')

  let sql = `SELECT l.*, m.title as module_title FROM lessons l
             JOIN modules m ON l.module_id = m.id`
  const params: any[] = []

  if (moduleId) {
    sql += ` WHERE l.module_id = ?`
    params.push(moduleId)
  }

  sql += ` ORDER BY l.module_id, l.order_index ASC`

  const [rows] = await pool.execute<RowDataPacket[]>(sql, params)
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const { module_id, title, lesson_type, content, youtube_url, duration_minutes, order_index } = await req.json()

  if (!module_id) return NextResponse.json({ error: 'Module ID required' }, { status: 400 })
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
    const [result] = await pool.execute(
      `INSERT INTO lessons (module_id, title, lesson_type, content, youtube_url, duration_minutes, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [module_id, title, lesson_type, content || '', youtube_url || '', duration_minutes || 0, order_index || 0]
    )

    const id = (result as any).insertId
    return NextResponse.json({ 
      id, 
      module_id, 
      title, 
      lesson_type, 
      content, 
      youtube_url, 
      duration_minutes, 
      order_index 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 })
  }
}
