export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { initDB, migrateDB } = await import('./lib/db')
      const isLocal = !process.env.DB_HOST || process.env.DB_HOST === 'localhost'
      if (isLocal) {
        await initDB()
      } else {
        await migrateDB()
      }
    } catch (err) {
      console.error('[iBudget] ❌ Startup error:', err)
    }
  }
}
