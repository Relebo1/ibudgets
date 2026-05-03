import mysql from 'mysql2/promise'

const tidbConfig = {
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '3jrEfY6r2Jti193.root',
  password: 'ysz4dcWUedfvjLnl',
  database: 'ibudget',
  ssl: { rejectUnauthorized: true }
}

async function checkTables() {
  const conn = await mysql.createConnection(tidbConfig)
  
  try {
    console.log('📊 Checking TiDB Cloud tables...\n')
    
    // Get all tables
    const [tables] = await conn.execute('SHOW TABLES')
    console.log('Tables in ibudget database:')
    tables.forEach((t, i) => {
      const tableName = Object.values(t)[0]
      console.log(`  ${i + 1}. ${tableName}`)
    })
    
    console.log('\n' + '='.repeat(60))
    
    // Check key tables structure
    const tablesToCheck = ['modules', 'lessons', 'quizzes', 'quiz_questions', 'user_modules']
    
    for (const table of tablesToCheck) {
      console.log(`\n📋 Table: ${table}`)
      try {
        const [columns] = await conn.execute(`DESCRIBE ${table}`)
        columns.forEach(col => {
          console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`)
        })
      } catch (err) {
        console.log(`  ⚠️  Table does not exist`)
      }
    }
    
  } finally {
    await conn.end()
  }
}

checkTables().catch(console.error)
