import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = rows[0] as RowDataPacket

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Streak logic
    const now = new Date()
    const lastLogin = user.last_login ? new Date(user.last_login) : null
    let newStreak = user.streak ?? 0

    if (lastLogin) {
      const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) newStreak += 1
      else if (diffDays > 1) newStreak = 1
    } else {
      newStreak = 1
    }

    const newXP = user.xp + 5
    const newLevel = Math.floor(newXP / 500) + 1

    await pool.execute(
      'UPDATE users SET streak = ?, xp = ?, level = ?, last_login = NOW() WHERE id = ?',
      [newStreak, newXP, newLevel, user.id]
    )

    const [updated] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, school, major, year, avatar, xp, level, streak, monthly_budget, total_saved, total_spent, is_admin FROM users WHERE id = ?',
      [user.id]
    )

    return NextResponse.json({ user: updated[0] })
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
