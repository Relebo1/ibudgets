# Auto-Database Initialization

## What Changed

The application now automatically creates all LMS tables on first database connection. This solves the 500 errors on production.

## How It Works

1. **On First Connection**: When the database pool gets its first connection, it triggers the initialization
2. **Creates Tables**: All 7 LMS tables are created if they don't exist:
   - modules
   - lessons
   - quizzes
   - quiz_questions
   - user_modules
   - user_lessons
   - user_quizzes

3. **Idempotent**: Uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times
4. **Logs Output**: Logs success/failure to console for debugging

## Files Modified

- `src/lib/db.ts` - Added initialization hook on pool connection
- `src/lib/initDB.ts` - New file with migration SQL

## Deployment

1. **Push to GitHub** (or Vercel will auto-deploy)
2. **Vercel redeploys** the application
3. **First request** triggers database initialization
4. **Tables are created** automatically
5. **Admin pages work** without manual setup

## Testing

After deployment:

1. Go to https://ibudgets-yeup.vercel.app/admin/lms/lessons
2. Try creating a new lesson
3. Should work without errors

## Verification

Check Vercel logs for:
```
[iBudget] Initializing TiDB Cloud database...
[iBudget] ✅ Database initialized successfully
```

## Benefits

✅ No manual SQL execution needed
✅ Works on both local and production
✅ Automatic on first connection
✅ Safe to redeploy multiple times
✅ Logs for debugging

## Fallback

If auto-initialization fails, you can still manually run:
`migrations/003_tidb_lms_schema.sql` in TiDB Cloud console
