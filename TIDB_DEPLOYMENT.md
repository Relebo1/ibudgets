# iBudget TiDB Cloud Deployment Guide

## Overview
This guide walks through setting up the iBudget database on TiDB Cloud for production deployment.

## Current Schema

### Learning Management System (LMS) Tables

#### 1. **modules** - Learning modules
```
- id (PK)
- title (VARCHAR 150)
- description (TEXT)
- category (VARCHAR 100)
- difficulty (ENUM: Beginner, Intermediate, Advanced)
- color (VARCHAR 20) - Hex color for UI
- xp_reward (INT) - XP earned when module completed
- created_at (TIMESTAMP)
```

#### 2. **lessons** - Content units within modules
```
- id (PK)
- module_id (FK → modules)
- title (VARCHAR 150)
- description (TEXT)
- content (LONGTEXT) - Markdown content
- youtube_url (VARCHAR 500)
- duration_minutes (INT)
- order_index (INT) - Display order
- created_at, updated_at (TIMESTAMP)
```

#### 3. **quizzes** - Quizzes per module
```
- id (PK)
- module_id (FK → modules)
- title (VARCHAR 255)
- description (TEXT)
- xp_reward (INT) - XP earned on completion
- time_limit (INT) - Minutes allowed
- color (VARCHAR 20)
- created_at (TIMESTAMP)
```

#### 4. **quiz_questions** - Questions within quizzes
```
- id (PK)
- quiz_id (FK → quizzes)
- question (TEXT)
- options (JSON) - Array of 4 options [A, B, C, D]
- correct_index (INT) - 0-3 indicating correct option
- explanation (TEXT)
- order_index (INT)
- created_at (TIMESTAMP)
```

#### 5. **user_modules** - User progress tracking
```
- id (PK)
- user_id (FK → users)
- module_id (FK → modules)
- progress (INT) - 0-100%
- completed (TINYINT) - Boolean
- completed_lessons (INT) - Count
- UNIQUE(user_id, module_id)
```

#### 6. **user_lessons** - Lesson completion tracking
```
- id (PK)
- user_id (FK → users)
- lesson_id (FK → lessons)
- completed (TINYINT) - Boolean
- UNIQUE(user_id, lesson_id)
```

#### 7. **user_quizzes** - Quiz results tracking
```
- id (PK)
- user_id (FK → users)
- quiz_id (FK → quizzes)
- score (INT) - Percentage or points
- completed (TINYINT)
- taken_at (TIMESTAMP)
- UNIQUE(user_id, quiz_id)
```

## Setup Instructions

### Step 1: Access TiDB Cloud Console
1. Go to https://tidbcloud.com
2. Log in to your account
3. Navigate to your cluster

### Step 2: Run Migration
1. Open the SQL Editor in TiDB Cloud console
2. Copy the entire contents of `migrations/003_tidb_lms_schema.sql`
3. Paste into the SQL editor
4. Execute the script

### Step 3: Verify Tables
Run these verification queries:
```sql
SHOW TABLES;
DESCRIBE modules;
DESCRIBE lessons;
DESCRIBE quizzes;
DESCRIBE quiz_questions;
```

### Step 4: Update Environment Variables
Ensure `.env.production` has correct TiDB credentials:
```
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USERNAME=<your-username>
DB_PASSWORD=<your-password>
DB_DATABASE=ibudget
DB_ENV=production
```

## API Endpoints

### Student-Facing Endpoints
- `GET /api/modules` - List all modules with progress
- `GET /api/lessons?moduleId=X` - Get lessons for a module
- `GET /api/lessons?lessonId=X` - Get single lesson with quiz
- `GET /api/quizzes?moduleId=X` - Get quizzes for a module
- `GET /api/quizzes/[quizId]` - Get quiz with questions

### Admin Endpoints
- `GET /api/admin/modules` - List all modules
- `GET /api/admin/lessons` - List all lessons
- `POST /api/admin/quizzes` - Create quiz
- `POST /api/admin/quizzes/[quizId]/questions` - Add questions

## Key Features

✅ **Quiz Builder**
- Step-based UI (Quiz Info → Add Questions)
- Enforces exactly 4 options per question
- Radio button selection for correct answer
- Optional explanations

✅ **Student Learning Path**
- Browse modules by difficulty
- View lessons with video support
- Take quizzes and track scores
- Earn XP on completion

✅ **Progress Tracking**
- User module completion status
- Lesson completion tracking
- Quiz scores and results
- XP rewards system

## Troubleshooting

### Connection Issues
- Verify IP is whitelisted in TiDB Cloud
- Check credentials in `.env.production`
- Ensure SSL is enabled for production

### Schema Issues
- Run `SHOW TABLES;` to verify all tables exist
- Check `DESCRIBE table_name;` for column structure
- Verify foreign key relationships

### Data Issues
- Ensure quiz_questions.options is valid JSON
- Verify correct_index is 0-3
- Check module_id references exist in modules table

## Deployment Checklist

- [ ] All tables created in TiDB Cloud
- [ ] Environment variables updated
- [ ] Build passes: `npm run build`
- [ ] Local testing complete
- [ ] Deploy to Vercel
- [ ] Test production endpoints
- [ ] Monitor error logs
