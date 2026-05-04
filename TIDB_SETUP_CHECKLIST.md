# TiDB Cloud Setup Checklist

## 🚨 Current Issue
Production deployment is getting 500 errors on `/api/admin/lessons` POST request.

**Root Cause**: The LMS tables (lessons, quizzes, quiz_questions, etc.) likely don't exist on TiDB Cloud yet.

## ✅ Required Actions

### Step 1: Run Migration on TiDB Cloud
1. Go to https://tidbcloud.com
2. Navigate to your cluster
3. Open **SQL Editor**
4. Copy the entire contents of: `migrations/003_tidb_lms_schema.sql`
5. Paste into SQL Editor
6. Click **Execute**
7. Wait for completion

### Step 2: Verify Tables Created
Run these queries in TiDB Cloud SQL Editor:

```sql
-- Check all tables exist
SHOW TABLES;

-- Verify each table structure
DESCRIBE modules;
DESCRIBE lessons;
DESCRIBE quizzes;
DESCRIBE quiz_questions;
DESCRIBE user_modules;
DESCRIBE user_lessons;
DESCRIBE user_quizzes;
```

Expected output should show all 7 tables with proper columns.

### Step 3: Check Existing Data
```sql
-- Count records in each table
SELECT 'modules' as table_name, COUNT(*) as count FROM modules
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'quizzes', COUNT(*) FROM quizzes
UNION ALL
SELECT 'quiz_questions', COUNT(*) FROM quiz_questions;
```

### Step 4: Redeploy to Vercel
1. Go to https://vercel.com
2. Navigate to your iBudget project
3. Click **Deployments**
4. Find the latest deployment
5. Click **Redeploy** (or push a new commit to trigger auto-deploy)

### Step 5: Test Production
1. Go to https://ibudgets-yeup.vercel.app/admin/lms/lessons
2. Try creating a new lesson
3. Check Vercel logs for any errors

## 🔍 Troubleshooting

### If still getting 500 errors:

1. **Check Vercel Logs**
   - Go to Vercel dashboard
   - Click on your project
   - Go to **Deployments** → Latest → **Logs**
   - Look for error messages from `/api/admin/lessons`

2. **Check TiDB Cloud Connection**
   - Verify `.env.production` has correct credentials
   - Test connection: `npm run build` locally with production env

3. **Check Table Structure**
   - Run `DESCRIBE lessons;` in TiDB Cloud
   - Verify columns: id, module_id, title, description, content, youtube_url, duration_minutes, order_index, created_at, updated_at

4. **Check Foreign Keys**
   - Verify `modules` table exists
   - Verify `lessons.module_id` references `modules.id`

## 📋 Database Schema Summary

### modules
- id (PK)
- title, description, category, difficulty
- color, xp_reward
- created_at

### lessons
- id (PK)
- module_id (FK → modules)
- title, description, content
- youtube_url, duration_minutes, order_index
- created_at, updated_at

### quizzes
- id (PK)
- module_id (FK → modules)
- title, description
- xp_reward, time_limit, color
- created_at

### quiz_questions
- id (PK)
- quiz_id (FK → quizzes)
- question, options (JSON), correct_index
- explanation, order_index
- created_at

### user_modules, user_lessons, user_quizzes
- Tracking tables for user progress

## 🔗 Useful Links
- TiDB Cloud Console: https://tidbcloud.com
- Vercel Dashboard: https://vercel.com
- Migration File: `migrations/003_tidb_lms_schema.sql`
- Deployment Guide: `TIDB_DEPLOYMENT.md`

## ✨ After Setup Complete
- [ ] All 7 tables created in TiDB Cloud
- [ ] Tables verified with DESCRIBE commands
- [ ] Vercel redeployed
- [ ] Admin lessons page working
- [ ] Can create new lessons
- [ ] Can create quizzes
- [ ] Student can view modules and lessons
