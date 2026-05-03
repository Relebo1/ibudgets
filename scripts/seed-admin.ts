import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { RowDataPacket } from 'mysql2'

async function seedAdminAccount() {
  try {
    const email = 'admin@ibudget.com'
    const password = 'Admin@123'
    const name = 'Admin User'

    // Check if admin already exists
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if ((existing as RowDataPacket[]).length > 0) {
      console.log('✅ Admin account already exists')
      return
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12)
    const avatar = 'AU'

    // Insert admin user
    await pool.execute(
      `INSERT INTO users (name, email, password, school, major, year, avatar, xp, level, is_admin, monthly_budget)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashed, 'iBudget', 'Admin', 'Admin', avatar, 1000, 5, 1, 5000]
    )

    console.log('✅ Demo admin account created successfully!')
    console.log('')
    console.log('📧 Email: admin@ibudget.com')
    console.log('🔐 Password: Admin@123')
    console.log('')
    console.log('⚠️  Change this password after first login!')
  } catch (error) {
    console.error('❌ Error seeding admin account:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

seedAdminAccount()
