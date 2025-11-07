# Future Improvements

This document tracks features and enhancements that are **not yet implemented** but are planned or recommended for future development.

## High Priority (Security & Stability)

### 1. Authentication & Authorization
**Status**: Not implemented
**Priority**: High
**Description**: Currently all API endpoints are public with no authentication.

**Recommended Approach**:
- JWT-based authentication
- Role-based access control (Admin, User)
- Protected routes for admin endpoints
- Secure token storage (httpOnly cookies)

**Impact**: Required for production deployment

---

### 2. Database Persistence
**Status**: Currently using in-memory storage
**Priority**: High
**Description**: Data is lost on server restart. Need persistent storage.

**Recommended Approach**:
- PostgreSQL for relational data (preferred)
- MongoDB as alternative
- Implement database repositories (PostgresQuizRepository, etc.)
- Add database migrations
- Connection pooling

**Files to Update**:
- Create new repository implementations
- Update DI setup in `backend/src/server.ts`
- Add migration scripts

---

### 3. Rate Limiting per Endpoint
**Status**: Partially implemented
**Priority**: Medium
**Description**: General rate limiting exists, but high-computation endpoints need stricter limits.

**Recommended Changes**:
```typescript
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10  // Only 10 quiz submissions per 15 minutes
});

router.post('/quizzes/:id/responses', submitLimiter, ...);
```

**Impact**: Prevents DoS on calculation-heavy endpoints

---

## Medium Priority (Performance & UX)

### 4. Response Caching
**Status**: Not implemented
**Priority**: Medium
**Description**: Quiz data rarely changes but is fetched on every page load.

**Recommended Approach**:
- Backend: Add Cache-Control headers
- Backend: Implement Redis caching layer
- Frontend: Use React Query or SWR for client-side caching
- Add cache invalidation on quiz updates

**Performance Benefit**: 50-80% reduction in API calls

---

### 5. Score Calculation Optimization
**Status**: Works but could be optimized
**Priority**: Low
**Description**: Nested loops in `calculateResults()` have O(n*m) complexity.

**Current Performance**:
- 100 questions × 20 metrics = 2000 iterations
- Not a problem for current scale

**Optimization Strategy** (only if needed):
```typescript
interface Quiz {
  _metricMaxScores?: Map<string, number>; // Pre-calculated
}
```
- Calculate max scores once when quiz is created
- Cache in database
- Skip calculation in `calculateResults()`

**When to Implement**: If response time > 200ms

---

### 6. Frontend Form Type Safety
**Status**: Works but could be more elegant
**Priority**: Low
**Description**: Manual array manipulation in forms bypasses React Hook Form's type safety.

**Current**:
```typescript
setValue(`questions.${questionIndex}.answers`, [...answers, newAnswer]);
```

**Recommended**:
```typescript
const { fields: answers, append, remove } = useFieldArray({
  control,
  name: `questions.${questionIndex}.answers`
});
```

**Impact**: Better TypeScript safety, cleaner code

---

## Low Priority (Testing & Documentation)

### 7. Test Coverage Improvements
**Status**: 39 tests passing, 75% coverage
**Priority**: Medium

**Missing Tests**:
- **Edge cases**:
  - Empty metrics
  - Single question quizzes
  - Maximum limits (100 questions, 20 metrics)
- **Concurrent operations**:
  - Two admins editing same quiz
  - Race conditions
- **Frontend tests**:
  - React component testing (React Testing Library)
  - Form validation testing
- **E2E tests**:
  - Cypress or Playwright
  - Full user workflows

**Test Files to Create**:
- `backend/src/__tests__/edge-cases.test.ts`
- `backend/src/__tests__/concurrency.test.ts`
- `frontend/src/__tests__/AdminQuizCreate.test.tsx`
- `e2e/quiz-submission.spec.ts`

---

### 8. Contract Testing
**Status**: Not implemented
**Priority**: Low
**Description**: Frontend and backend share types but no contract tests verify the actual HTTP API.

**Recommended Tool**: Pact

**Example**:
```typescript
// Verify actual API matches TypeScript contracts
it('should match the quiz API contract', async () => {
  // Pact consumer/provider tests
});
```

---

### 9. API Documentation Enhancements
**Status**: Basic documentation exists
**Priority**: Low

**Missing**:
- Authentication strategy details
- Will it be JWT or OAuth?
- Where will auth tokens be sent (header, cookie)?
- What endpoints will require auth?
- Production deployment specifics
- Database migration strategy
- Environment variable setup
- Monitoring and alerting
- Backup and recovery procedures

**Files to Update**:
- `API_DOCUMENTATION.md`
- `DEPLOYMENT.md`

---

## Future Features (Nice-to-Have)

### 10. Quiz Analytics
- Track completion rates
- Average scores per metric
- Time spent on quizzes
- Popular quizzes

### 11. Quiz Versioning
- Track quiz changes over time
- Allow reverting to previous versions
- Show version history

### 12. Export/Import
- Export quizzes as JSON
- Import from external formats
- Bulk operations

### 13. Multi-language Support
- Internationalization (i18n)
- Translate quizzes
- RTL support

### 14. Advanced Scoring
- Weighted metrics
- Custom score calculations
- Conditional logic ("if answered X, skip Y")

---

## Implementation Priority Order

1. **Phase 1** (Production-Ready):
   - Authentication & Authorization
   - Database Persistence
   - Response Caching

2. **Phase 2** (Scale & Polish):
   - Rate Limiting per Endpoint
   - Test Coverage
   - Contract Testing

3. **Phase 3** (Optimize):
   - Score Calculation Optimization (if needed)
   - Frontend Form Type Safety

4. **Phase 4** (Enhance):
   - Future Features as needed

---

## Decision Log

### Why Not Implemented Yet?

These items are intentionally deferred because:
1. **Current scope**: MVP focuses on core quiz functionality
2. **No users yet**: Authentication not needed until user base exists
3. **Scale**: Current performance is adequate for expected load
4. **Resources**: Time/budget constraints prioritize core features
5. **Validation**: Waiting for user feedback before building advanced features

### When to Revisit?

- **Auth**: Before public launch or when first external user onboards
- **Database**: Before production deployment
- **Caching**: When API response times exceed 500ms
- **Testing**: When refactoring large sections of code
- **Features**: When requested by users or stakeholders
