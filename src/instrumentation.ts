export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { initDB } = await import('./lib/db')
      await initDB()
    } catch (err) {
      console.error('[iBudget] ❌ Startup error:', err)
    }
  }
}
