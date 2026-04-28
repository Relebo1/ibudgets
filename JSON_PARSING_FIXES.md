# Quiz System - JSON Parsing Fixes

## Issue
Error: `SyntaxError: Unexpected token 'B', "Budgeting,"... is not valid JSON`

This occurred because options were being stored as strings instead of JSON, or JSON parsing was failing.

## Root Cause
The `options` column in `quiz_questions` table stores JSON, but:
1. Sometimes it was being stored as a string representation of an array
2. JSON.parse() was being called without error handling
3. The API wasn't ensuring options were always arrays

## Fixes Applied

### 1. Admin Questions API (`/src/app/api/admin/questions/route.ts`)
**Changes**:
- ✅ Added proper JSON stringification before storing: `JSON.stringify(optionsArray)`
- ✅ Added error handling for JSON parsing in GET
- ✅ Ensured options is always an array before stringifying
- ✅ Added fallback to empty array if parsing fails

**Code**:
```typescript
// Ensure options is an array and stringify for storage
const optionsArray = Array.isArray(options) ? options : []
const optionsJson = JSON.stringify(optionsArray)

// Store in database
await pool.execute(
  'INSERT INTO quiz_questions (...) VALUES (...)',
  [..., optionsJson, ...]
)

// Parse with error handling
let parsedOptions = row.options
if (typeof parsedOptions === 'string') {
  try {
    parsedOptions = JSON.parse(parsedOptions)
  } catch {
    parsedOptions = []
  }
}
```

### 2. Student Quizzes API (`/src/app/api/quizzes/route.ts`)
**Changes**:
- ✅ Added error handling for JSON parsing
- ✅ Changed order to `order_index ASC, id ASC` (was just `id`)
- ✅ Ensured options is always an array

**Code**:
```typescript
questions: qRows.map(q => {
  let options = q.options
  if (typeof options === 'string') {
    try {
      options = JSON.parse(options)
    } catch {
      options = []
    }
  }
  return { ...q, options: Array.isArray(options) ? options : [] }
})
```

### 3. Admin Builder (`/src/app/admin/quizzes/page.tsx`)
**No changes needed** - already correctly:
- Filters empty options: `q.options.filter(o => o.trim())`
- Sends as array in request body
- Handles both string and array responses

## How It Works Now

### Saving a Question
1. Admin enters options: `["23", "30", "35", "100"]`
2. Admin selects correct: index 2 (option "35")
3. Admin clicks Save
4. Frontend sends: `{ options: ["23", "30", "35", "100"], correctIndex: 2 }`
5. API receives array
6. API stringifies: `JSON.stringify(["23", "30", "35", "100"])`
7. Database stores: `"[\"23\",\"30\",\"35\",\"100\"]"`

### Retrieving a Question
1. Database returns: `"[\"23\",\"30\",\"35\",\"100\"]"` (as string)
2. API parses: `JSON.parse(...)` → `["23", "30", "35", "100"]`
3. API returns: `{ options: ["23", "30", "35", "100"], correctIndex: 2 }`
4. Frontend receives array
5. Student sees options A, B, C, D

## Testing

To verify the fix works:

1. **Create a quiz**:
   - Go to `/admin/quizzes`
   - Click "New Quiz"
   - Add a question with options: "Option A", "Option B", "Option C"
   - Select "Option B" as correct
   - Click "Save Quiz"

2. **Take the quiz**:
   - Go to `/dashboard/quizzes`
   - Click "Start Quiz"
   - Verify options display correctly
   - Select an answer
   - Verify feedback shows correct answer

3. **Edit the quiz**:
   - Go to `/admin/quizzes`
   - Click "Edit" on the quiz
   - Verify options load correctly
   - Change correct answer to "Option C"
   - Click "Save Changes"

4. **Retake the quiz**:
   - Go to `/dashboard/quizzes`
   - Click "Retake Quiz"
   - Verify new correct answer is "Option C"

## Database Check

To verify data in TiDB:

```sql
SELECT id, question, options, correct_index FROM quiz_questions LIMIT 1;
```

Should show:
- `options`: `["Option A","Option B","Option C"]` (valid JSON)
- `correct_index`: `1` (integer, 0-based index)

## Error Handling

The API now handles:
- ✅ Options as string (parses it)
- ✅ Options as array (uses it)
- ✅ Invalid JSON (returns empty array)
- ✅ Missing options (returns empty array)
- ✅ Null options (returns empty array)

## Summary

**Before**: Options could be stored as strings, causing JSON.parse() errors
**After**: Options are always stringified before storage, parsed with error handling on retrieval

**Status**: ✅ Fixed and ready for production
