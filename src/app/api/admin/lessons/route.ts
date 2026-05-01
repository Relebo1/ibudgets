import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const moduleId = searchParams.get('moduleId')
  const params: any[] = []
  let sql = `SELECT l.*, COUNT(q.id) AS quiz_count FROM lessons l 
             LEFT JOIN quizzes q ON q.lesson_id = l.id`
  if (moduleId) { sql += ' WHERE l.module_id = ?'; params.push(moduleId) }
  sql += ' GROUP BY l.id ORDER BY l.order_index, l.id'
  const [rows] = await pool.execute<RowDataPacket[]>(sql, params)
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const { moduleId, title, description, content, youtube_url, video_duration, order_index } = await req.json()
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO lessons (module_id, title, description, content, youtube_url, video_duration, order_index) VALUES (?,?,?,?,?,?,?)',
      [moduleId, title, description ?? '', content ?? '', youtube_url ?? '', video_duration ?? '', order_index ?? 0]
    )
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM lessons WHERE id = ?', [result.insertId])
    return NextResponse.json({ ...rows[0], quiz_count: 0 }, { status: 201 })
  } catch (err: any) {
    if (err.code === 'ER_BAD_FIELD_ERROR' && err.sqlMessage?.includes('content')) {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO lessons (module_id, title, description, youtube_url, video_duration, order_index) VALUES (?,?,?,?,?,?)',
        [moduleId, title, description ?? '', youtube_url ?? '', video_duration ?? '', order_index ?? 0]
      )
      const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM lessons WHERE id = ?', [result.insertId])
      return NextResponse.json({ ...rows[0], quiz_count: 0 }, { status: 201 })
    }
    throw err
  }
}

export async function PUT(req: Request) {
  const { id, title, description, content, youtube_url, video_duration, order_index } = await req.json()
  try {
    await pool.execute(
      'UPDATE lessons SET title=?, description=?, content=?, youtube_url=?, video_duration=?, order_index=? WHERE id=?',
      [title, description ?? '', content ?? '', youtube_url ?? '', video_duration ?? '', order_index ?? 0, id]
    )
  } catch (err: any) {
    if (err.code === 'ER_BAD_FIELD_ERROR' && err.sqlMessage?.includes('content')) {
      await pool.execute(
        'UPDATE lessons SET title=?, description=?, youtube_url=?, video_duration=?, order_index=? WHERE id=?',
        [title, description ?? '', youtube_url ?? '', video_duration ?? '', order_index ?? 0, id]
      )
    } else {
      throw err
    }
  }
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT l.*, COUNT(q.id) AS quiz_count FROM lessons l LEFT JOIN quizzes q ON q.lesson_id = l.id WHERE l.id = ? GROUP BY l.id',
    [id]
  )
  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await pool.execute('DELETE FROM lessons WHERE id = ?', [id])
  return NextResponse.json({ deleted: id })
}
