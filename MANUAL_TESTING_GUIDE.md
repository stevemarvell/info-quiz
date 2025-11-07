# Manual Testing Guide

This guide provides step-by-step procedures for manually testing the Quiz Metrics Scoring Application.

## Prerequisites

Before testing, ensure:
- Backend is running on `http://localhost:3000`
- Frontend is running on `http://localhost:8100`
- Both services are freshly started (in-memory data is clean)

## Test Environment Setup

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm start

# Verify services are running
curl http://localhost:3000/health  # Should return {"status":"ok"}
curl http://localhost:8100         # Should load frontend
```

## Test Scenarios

### 1. View Homepage

**Objective**: Verify the homepage loads and displays correctly

**Steps**:
1. Navigate to `http://localhost:8100`
2. Verify the page title displays "Quiz Metrics App"
3. Verify you see a "Start Quiz" button
4. Verify you see an "Admin" link/button

**Expected Results**:
- ✅ Homepage loads without errors
- ✅ All navigation elements are visible
- ✅ Page is responsive (test on different screen sizes if possible)

---

### 2. View Available Quizzes

**Objective**: Verify users can see the list of available quizzes

**Steps**:
1. On the homepage, click "Start Quiz" or "View Quizzes"
2. Verify a list of quizzes is displayed
3. Check that the "Wellbeing Assessment" quiz appears (pre-loaded sample data)

**Expected Results**:
- ✅ Quiz list loads successfully
- ✅ Each quiz shows: title, description
- ✅ "Take Quiz" button is available for each quiz

---

### 3. Take a Quiz (Full Flow)

**Objective**: Complete a full quiz and receive results

**Steps**:
1. From the quiz list, click "Take Quiz" on "Wellbeing Assessment"
2. Verify the quiz title and description display
3. For Question 1 ("How would you rate your overall mood today?"):
   - Select "Great! Feeling very positive" (highest score)
   - Click "Next" or submit
4. Continue through all 10 questions, selecting varying answers
5. On the final question, click "Submit Quiz"
6. Wait for results to load

**Expected Results**:
- ✅ All 10 questions display correctly
- ✅ Each question shows all answer options
- ✅ Radio buttons work correctly (only one selection per question)
- ✅ Navigation between questions works
- ✅ Cannot skip questions (validation prevents empty answers)
- ✅ Results page displays after submission
- ✅ Results show scores for all metrics:
  - Emotional Well-being
  - Physical Health
  - Social Connection
  - Life Satisfaction
- ✅ Each metric shows: score/max and percentage
- ✅ "Take Another Quiz" button is available

**Test Data Example**:
```
Q1: Great! Feeling very positive (5 points)
Q2: 8-9 hours (5 points)
Q3: 4-5 times (5 points)
Q4: Very strong - great support system (5 points)
... continue for all questions
```

---

### 4. Access Admin Panel

**Objective**: Verify admin functionality is accessible

**Steps**:
1. Navigate to `http://localhost:8100/admin`
2. Verify the Admin Dashboard loads
3. Check that you see:
   - "Create New Quiz" button
   - List of existing quizzes

**Expected Results**:
- ✅ Admin panel loads without authentication (expected - no auth implemented)
- ✅ Admin dashboard displays quiz management options
- ✅ Can see the pre-loaded "Wellbeing Assessment" quiz

---

### 5. Create a New Quiz (Admin)

**Objective**: Create a custom quiz with metrics and questions

**Steps**:
1. In Admin panel, click "Create New Quiz"
2. Fill in Quiz Details:
   - **Title**: "Customer Satisfaction Survey"
   - **Description**: "Evaluate your experience with our service"
   - Click "Add Metric"
3. Add First Metric:
   - **Name**: "Service Quality"
   - **Description**: "Quality of service received"
4. Add Second Metric:
   - **Name**: "Value for Money"
   - **Description**: "Perceived value"
5. Click "Add Question"
6. Add First Question:
   - **Text**: "How satisfied are you with our service?"
   - Click "Add Answer" (repeat 3 times)
   - **Answer 1**: "Very Satisfied"
     - Service Quality: 5, Value for Money: 5
   - **Answer 2**: "Satisfied"
     - Service Quality: 3, Value for Money: 3
   - **Answer 3**: "Unsatisfied"
     - Service Quality: 1, Value for Money: 1
7. Add Second Question (following same pattern)
8. Click "Create Quiz"
9. Verify redirect to quiz list

**Expected Results**:
- ✅ Form accepts all inputs correctly
- ✅ Can add/remove metrics dynamically
- ✅ Can add/remove questions dynamically
- ✅ Can add/remove answers for each question
- ✅ Metric scores can be assigned to each answer
- ✅ Form validates required fields (shows errors if empty)
- ✅ Quiz creates successfully
- ✅ New quiz appears in admin list
- ✅ New quiz is available to take

**Validation Tests**:
- Try submitting with empty title → Should show error
- Try submitting without metrics → Should show error
- Try submitting without questions → Should show error
- Try creating answer without assigning scores for all metrics → Should show error

---

### 6. Edit an Existing Quiz (Admin)

**Objective**: Modify an existing quiz

**Steps**:
1. In Admin panel, find "Customer Satisfaction Survey" (just created)
2. Click "Edit"
3. Change the title to "Customer Feedback Survey"
4. Add a third metric: "Communication"
5. Update first question's first answer to include score for new metric
6. Click "Update Quiz"

**Expected Results**:
- ✅ Edit form loads with existing quiz data pre-filled
- ✅ All existing metrics, questions, and answers display
- ✅ Can modify any field
- ✅ Can add new metrics/questions/answers
- ✅ Can remove existing metrics/questions/answers
- ✅ Update saves successfully
- ✅ Changes reflect immediately in quiz list

---

### 7. Delete a Quiz (Admin)

**Objective**: Remove a quiz from the system

**Steps**:
1. In Admin panel, find "Customer Feedback Survey"
2. Click "Delete" button
3. If confirmation dialog appears, confirm deletion
4. Verify quiz is removed from list

**Expected Results**:
- ✅ Delete button is available
- ✅ Quiz removes from admin list
- ✅ Quiz no longer appears in user quiz list
- ✅ Cannot take deleted quiz

---

### 8. Test XSS Protection

**Objective**: Verify the application sanitizes malicious input

**Steps**:
1. In Admin panel, click "Create New Quiz"
2. Enter malicious input in title: `<script>alert('XSS')</script>`
3. Submit the quiz
4. Navigate to quiz list and view the quiz

**Expected Results**:
- ✅ Script tags are removed or sanitized
- ✅ No JavaScript alert popup appears
- ✅ Title displays as text: `alert('XSS')` or similar (without `<script>` tags)

**Additional XSS Tests**:
```
Title: <img src=x onerror="alert('XSS')">
Description: <a href="javascript:alert('XSS')">Click</a>
Question Text: <div onclick="alert('XSS')">Question</div>
```

All should be sanitized and not execute JavaScript.

---

### 9. Test Score Calculation

**Objective**: Verify quiz scoring works correctly

**Steps**:
1. Create a simple quiz with:
   - 1 Metric: "Test Metric"
   - 1 Question: "Test Question"
   - 2 Answers:
     - Answer A: Test Metric = 10 points
     - Answer B: Test Metric = 5 points
2. Take the quiz and select Answer A
3. Check results

**Expected Results**:
- ✅ Result shows: Score: 10/10 (100%)
- ✅ Max score is the highest possible (10, not the sum of all answers)

**Test Again**:
1. Retake the same quiz
2. Select Answer B
3. Check results

**Expected Results**:
- ✅ Result shows: Score: 5/10 (50%)

---

### 10. Test Multiple Metrics Scoring

**Objective**: Verify scoring works with multiple metrics

**Steps**:
1. Create a quiz with:
   - 2 Metrics: "Metric A", "Metric B"
   - 2 Questions
   - Q1, Answer 1: Metric A = 5, Metric B = 3
   - Q1, Answer 2: Metric A = 2, Metric B = 5
   - Q2, Answer 1: Metric A = 4, Metric B = 4
   - Q2, Answer 2: Metric A = 3, Metric B = 2
2. Take quiz selecting: Q1 Answer 1, Q2 Answer 1
3. Check results

**Expected Results**:
- ✅ Metric A: Score 9/9 (5+4) = 100%
- ✅ Metric B: Score 7/9 (3+4) = 77.8%
- ✅ Each metric calculated independently
- ✅ Max scores are per-metric maximums, not totals

---

### 11. Test API Endpoints Directly

**Objective**: Verify API works independently of frontend

**Using curl or Postman**:

#### Get All Quizzes
```bash
curl http://localhost:3000/api/quizzes
```
**Expected**: JSON array of quizzes

#### Get Single Quiz
```bash
curl http://localhost:3000/api/quizzes/wellbeing-quiz
```
**Expected**: Single quiz object

#### Create Quiz
```bash
curl -X POST http://localhost:3000/api/quizzes \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-quiz",
    "title": "API Test Quiz",
    "description": "Created via API",
    "metrics": [
      {"id": "m1", "name": "Metric 1", "description": "Test"}
    ],
    "questions": [
      {
        "id": "q1",
        "text": "Question 1?",
        "answers": [
          {
            "id": "a1",
            "text": "Answer 1",
            "metricScores": [{"metricId": "m1", "score": 5}]
          }
        ]
      }
    ]
  }'
```
**Expected**: 201 Created, returns quiz object

#### Submit Quiz Response
```bash
curl -X POST http://localhost:3000/api/quizzes/test-quiz/responses \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": "test-quiz",
    "answers": [
      {"questionId": "q1", "answerId": "a1"}
    ]
  }'
```
**Expected**: 200 OK, returns quiz results with metric scores

---

### 12. Test Error Handling

**Objective**: Verify graceful error handling

#### Test 404 - Quiz Not Found
**Steps**:
1. Navigate to `http://localhost:8100/quiz/nonexistent-id`

**Expected**:
- ✅ Shows "Quiz not found" error message
- ✅ Provides link back to quiz list
- ✅ No stack traces visible

#### Test 400 - Invalid Quiz Data
**Steps**:
1. Try to create quiz with empty title via API

**Expected**:
- ✅ Returns 400 Bad Request
- ✅ Error message indicates validation failure
- ✅ Details show which fields are invalid

#### Test 500 - Server Error (if applicable)
**Steps**:
1. Stop the backend server
2. Try to load quiz list on frontend

**Expected**:
- ✅ Shows "Server unavailable" or connection error
- ✅ Graceful error message (no crash)

---

### 13. Test Rate Limiting

**Objective**: Verify rate limiting protects API

**Steps**:
1. Make 100+ requests to `/api/quizzes` within 15 minutes
2. Observe response after exceeding limit

**Expected**:
- ✅ After 100 requests, receive 429 Too Many Requests
- ✅ Error message indicates rate limit exceeded
- ✅ After 15 minutes, requests work again

**For POST Requests** (stricter limit):
1. Make 30+ POST requests within 15 minutes
2. Observe response

**Expected**:
- ✅ After 30 POST requests, receive 429 error

---

### 14. Test Responsive Design

**Objective**: Verify app works on different screen sizes

**Steps**:
1. Open frontend in browser
2. Open Developer Tools (F12)
3. Toggle device toolbar (mobile view)
4. Test on various screen sizes:
   - Mobile (375x667)
   - Tablet (768x1024)
   - Desktop (1920x1080)

**Expected Results**:
- ✅ Layout adapts to screen size
- ✅ All buttons are clickable (not hidden/overlapped)
- ✅ Text is readable at all sizes
- ✅ Forms are usable on mobile
- ✅ Ionic components render correctly

---

### 15. Test Data Persistence (In-Memory Limitation)

**Objective**: Verify understanding of in-memory storage limitation

**Steps**:
1. Create a new quiz
2. Restart the backend server
3. Try to access the quiz

**Expected Results**:
- ✅ Quiz no longer exists (data lost)
- ✅ Only pre-loaded "Wellbeing Assessment" quiz remains
- ✅ This is expected behavior (in-memory storage)

**Note**: Document this limitation for production deployment planning.

---

## Regression Testing Checklist

After any code changes, run through this abbreviated checklist:

- [ ] Homepage loads
- [ ] Can view quiz list
- [ ] Can take a quiz end-to-end
- [ ] Results display correctly
- [ ] Admin panel accessible
- [ ] Can create a quiz
- [ ] Can edit a quiz
- [ ] Can delete a quiz
- [ ] API endpoints respond correctly
- [ ] No console errors in browser
- [ ] No unhandled errors in backend logs

---

## Performance Testing (Basic)

### Load Time Test
1. Open browser DevTools → Network tab
2. Navigate to `http://localhost:8100`
3. Check load time

**Expected**: Page loads in < 2 seconds

### Quiz Submission Test
1. Complete a quiz
2. Click "Submit"
3. Time how long until results appear

**Expected**: Results load in < 1 second

---

## Security Testing Checklist

- [ ] XSS protection working (script tags sanitized)
- [ ] SQL injection N/A (in-memory storage)
- [ ] Rate limiting functional
- [ ] CORS configured correctly
- [ ] Error messages don't expose sensitive info
- [ ] No hardcoded credentials in code

---

## Browser Compatibility Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Known Limitations (Expected Behavior)

1. **No Authentication**: Admin panel is publicly accessible
2. **In-Memory Storage**: Data lost on server restart
3. **No Persistence**: Quiz responses not permanently stored
4. **Single Instance**: Cannot scale horizontally without shared data store

These are documented limitations, not bugs.

---

## Reporting Issues

When reporting bugs, include:
1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Screenshots** (if UI issue)
5. **Browser/environment** details
6. **Console errors** (F12 → Console)
7. **Network errors** (F12 → Network)

Example bug report:
```
Title: Quiz results show incorrect percentage for Metric B

Steps to reproduce:
1. Create quiz with 2 metrics
2. Take quiz selecting all max-score answers
3. View results

Expected: All metrics show 100%
Actual: Metric A shows 100%, Metric B shows 87%

Environment: Chrome 120, Windows 11
Console errors: None
```

---

## Automated Testing Reference

For automated test execution:
- Backend: `npm run test:backend`
- Frontend: `npm run test:frontend`
- E2E: `npm run test:e2e`

Manual testing complements automated tests by covering:
- User experience
- Visual design
- Edge cases not covered by automation
- Real-world usage scenarios
