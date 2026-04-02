import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

import bcrypt from 'bcryptjs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_code`)
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })
    const tokenData = await tokenRes.json()

    if (tokenData.error || !tokenData.access_token) {
      return NextResponse.redirect(`${baseUrl}/login?error=token_failed`)
    }

    // Fetch GitHub user profile
    const profileRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profile = await profileRes.json()

    // Fetch primary email if not public
    let email = profile.email
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
      const emails = await emailRes.json()
      const primary = emails.find((e: any) => e.primary && e.verified)
      email = primary?.email ?? null
    }

    if (!email) {
      return NextResponse.redirect(`${baseUrl}/login?error=no_email`)
    }

    const name = profile.name ?? profile.login ?? 'GitHub User'
    const avatar = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

    // Upsert user — find by email or create
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?', [email]
    )

    let userId: number

    if ((existing as RowDataPacket[]).length > 0) {
      userId = (existing[0] as RowDataPacket).id
    } else {
      // Register new user via GitHub
      const hashedPw = await bcrypt.hash(`github_oauth_${profile.id}`, 12)
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO users (name, email, password, school, major, year, avatar)
         VALUES (?, ?, ?, '', '', 'Freshman', ?)`,
        [name, email, hashedPw, avatar]
      )
      userId = result.insertId
    }

    // Streak + XP logic
    const [userRows] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [userId])
    const user = userRows[0] as RowDataPacket

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

    const newXP = (user.xp ?? 0) + 5
    const newLevel = Math.floor(newXP / 500) + 1

    await pool.execute(
      'UPDATE users SET streak = ?, xp = ?, level = ?, last_login = NOW() WHERE id = ?',
      [newStreak, newXP, newLevel, userId]
    )

    const [updated] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, school, major, year, avatar, xp, level, streak, monthly_budget, total_saved, total_spent FROM users WHERE id = ?',
      [userId]
    )

    const userData = updated[0] as RowDataPacket

    // Pass user to client via redirect with encoded data in query param
    const encoded = encodeURIComponent(JSON.stringify(userData))
    return NextResponse.redirect(`${baseUrl}/auth/callback?user=${encoded}`)
  } catch (err) {
    console.error('[github-oauth]', err)
    return NextResponse.redirect(`${baseUrl}/login?error=server_error`)
  }
}
