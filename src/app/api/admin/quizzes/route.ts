import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get('moduleId')

    let sql = `SELECT q.id, q.module_id, q.title, q.description, q.xp_reward, q.time_limit, q.color, q.created_at, m.title as module_title, COUNT(qq.id) as question_count
               FROM quizzes q
               LEFT JOIN modules m ON q.module_id = m.id
               LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id`
    const params: any[] = []

    if (moduleId) {
      sql += ` WHERE q.module_id = ?`
      params.push(moduleId)
    }

    sql += ` GROUP BY q.id ORDER BY q.id DESC`

    const [rows] = await pool.execute<RowDataPacket[]>(sql, params)
    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET /api/admin/quizzes error:', error)
    return NextResponse.json({ error: 'Failed to fetch quizzes', details: String(error) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { module_id, title, description, xp_reward, time_limit, color } = await req.json()

    if (!module_id) return NextResponse.json({ error: 'Module ID required' }, { status: 400 })
    if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const [result] = await pool.execute(
      `INSERT INTO quizzes (module_id, title, description, xp_reward, time_limit, color)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [module_id, title, description || '', xp_reward || 100, time_limit || 10, color || '#22c55e']
    )

    const id = (result as any).insertId
    return NextResponse.json({ id, module_id, title, description, xp_reward, time_limit, color }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/quizzes error:', error)
    return NextResponse.json({ error: 'Failed to create quiz', details: String(error) }, { status: 500 })
  }
}
