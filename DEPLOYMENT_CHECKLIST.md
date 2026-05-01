# iBudget Lesson & Quiz System - Deployment Checklist

## ✅ Build Status
- **Build:** SUCCESSFUL ✓
- **TypeScript:** No errors ✓
- **Routes:** All configured ✓
- **API Endpoints:** All registered ✓

## 🚀 Pre-Deployment

### Database
- [ ] Run migrations on TiDB Cloud
  ```sql
  ALTER TABLE lessons ADD COLUMN content LONGTEXT DEFAULT '';
  ALTER TABLE quizzes ADD COLUMN lesson_id INT NULL;
  ALTER TABLE quiz_questions ADD COLUMN order_index INT DEFAULT 0;
  ```
- [ ] Verify tables exist: `lessons`, `user_lessons`, `quizzes`, `quiz_questions`
- [ ] Test connection to TiDB Cloud

### Environment Variables
- [ ] Verify `.env.local` has correct DB credentials
- [ ] Check `NEXTAUTH_URL` is set correctly
- [ ] Verify `NEXTAUTH_SECRET` is set

### Admin Account
- [ ] Admin demo account created: `admin@ibudget.demo` / `demo1234`
- [ ] Verify `is_admin = 1` in database

## 📋 Post-Deployment Testing

### Admin Features
- [ ] Navigate to `/admin/lessons`
- [ ] Select a module
- [ ] Create a new lesson with:
  - Title: "Test Lesson"
  - Content: "This is test content"
  - YouTube URL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  - Video Duration: "5 min"
- [ ] Verify lesson appears in list
- [ ] Edit lesson and verify changes save
- [ ] Delete lesson and verify removal

### Quiz Features
- [ ] Navigate to `/admin/quizzes`
- [ ] Create a new quiz with:
  - Module: Select any module
  - Title: "Test Quiz"
  - Questions: Add 3 questions with:
    - Question text
    - 4 answer options
    - Select correct answer
    - Add explanation
- [ ] Verify quiz saves successfully
- [ ] Edit quiz and verify changes
- [ ] Delete quiz and verify removal

### Student Features
- [ ] Login as student (non-admin account)
- [ ] Navigate to `/dashboard/modules`
- [ ] Click on a module
- [ ] Click on a lesson
- [ ] Verify lesson content displays
- [ ] Verify YouTube video embeds
- [ ] Click "Mark Lesson as Complete"
- [ ] Verify quiz becomes available
- [ ] Start quiz and answer questions
- [ ] Verify immediate feedback:
  - Correct answer shows green with explanation
  - Incorrect answer shows red with correct answer and explanation
- [ ] Complete quiz and verify results screen
- [ ] Verify per-question breakdown shows all answers
- [ ] Verify XP awarded
- [ ] Retry quiz and verify score updates

## 🔧 Troubleshooting

### Issue: Quiz not showing for student
**Solution:**
1. Verify lesson is marked as completed
2. Check quiz has `lesson_id` set to the lesson ID
3. Ensure quiz has at least one question
4. Verify quiz `module_id` matches lesson `module_id`

### Issue: YouTube video not embedding
**Solution:**
1. Verify URL format: `https://www.youtube.com/watch?v=VIDEO_ID`
2. Check video is not private/restricted
3. Test URL in browser first
4. Try alternative format: `https://youtu.be/VIDEO_ID`

### Issue: Progress not updating
**Solution:**
1. Check browser console for errors
2. Verify user is logged in
3. Check `user_modules` table has correct entries
4. Verify module progress calculation: `progress = (completed_lessons / total_lessons) * 100`

### Issue: Build fails with TypeScript errors
**Solution:**
1. Run `npm run build` locally to see full error
2. Check all files are properly typed
3. Verify no null/undefined issues
4. Run `npm run lint` to check for issues

## 📊 Monitoring

### Key Metrics to Track
- Quiz completion rate
- Average quiz scores
- Lesson completion rate
- Time spent per lesson
- XP distribution

### Database Queries for Monitoring

**Active students:**
```sql
SELECT COUNT(DISTINCT user_id) FROM user_modules WHERE completed = 1;
```

**Quiz performance:**
```sql
SELECT quiz_id, AVG(score) as avg_score, COUNT(*) as attempts 
FROM user_quizzes 
WHERE completed = 1 
GROUP BY quiz_id;
```

**Lesson completion:**
```sql
SELECT lesson_id, COUNT(*) as completions 
FROM user_lessons 
WHERE completed = 1 
GROUP BY lesson_id;
```

## 🔐 Security Checklist

- [ ] Admin routes protected with `is_admin` check
- [ ] Student routes require authentication
- [ ] Database credentials not exposed in frontend
- [ ] API endpoints validate user ownership
- [ ] XP calculations verified server-side
- [ ] Quiz answers validated server-side (not client-side)

## 📱 Browser Compatibility

Tested on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

## 🎯 Success Criteria

✅ All admin features working
✅ All student features working
✅ Database migrations applied
✅ No TypeScript errors
✅ Build successful
✅ All routes accessible
✅ Quiz feedback working correctly
✅ XP awarded on completion
✅ Progress tracking accurate

## 📞 Support

For issues or questions:
1. Check the `LESSON_QUIZ_SYSTEM.md` documentation
2. Review database schema in `src/lib/db.ts`
3. Check API endpoints in `src/app/api/`
4. Review component code in `src/app/admin/` and `src/app/dashboard/`

---

## Quick Start for New Admin

1. **Login:** Go to `/login` with admin credentials
2. **Create Module:** Go to `/admin/modules` → "New Module"
3. **Create Lessons:** Go to `/admin/lessons` → Select module → "New Lesson"
4. **Create Quiz:** Go to `/admin/quizzes` → "New Quiz" → Add questions
5. **Link Quiz to Lesson:** When creating quiz, select the lesson

## Quick Start for Students

1. **Login:** Go to `/login` with student credentials
2. **View Modules:** Go to `/dashboard/modules`
3. **Start Lesson:** Click on module → Click on lesson
4. **Complete Lesson:** Read content, watch video, click "Mark as Complete"
5. **Take Quiz:** Click "Start Quiz" → Answer questions → View results

---

**Deployment Date:** [INSERT DATE]
**Deployed By:** [INSERT NAME]
**Version:** 1.0.0
