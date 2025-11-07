# Legacy Backlog

**Generated:** 2025-11-07
**Last Updated:** 2025-11-07
**Code Review Scope:** Full codebase (backend, frontend, tests, configuration)
**Total Issues Identified:** 46 (3 remaining critical)

## Executive Summary

This backlog contains 46 issues identified through comprehensive code review, organized by priority. The codebase has solid architectural foundations (Repository pattern, DI, three-layer architecture) and good backend test coverage (94.36%), but has several critical issues preventing production deployment:

- **3 CRITICAL issues remaining** (1 resolved: shared package removed)
- **6 HIGH priority issues** affecting maintainability and user experience
- **36 additional issues** spanning security, performance, documentation, and code quality

**Immediate Action Required:** Fix Phase 1 issues (#1, #2, #4) before any deployment.

**Recent Changes:**
- ✅ **CRITICAL-3 RESOLVED**: Removed defunct `/shared` package directory. Controlled duplication strategy documented in CLAUDE.md.
- ✅ **Development Standards Updated**: Added branch naming conventions (feat/, fix/, chore/) and consistency standards to CLAUDE.md.

---

## Phase 1: CRITICAL (Must Fix Before Deployment)

### CRITICAL-1: API Endpoint Mismatch - Quiz Submission
**Priority:** CRITICAL
**Impact:** Quiz submission completely broken (404 errors)
**Effort:** 5 minutes

**Description:**
Frontend and backend have mismatched endpoints for quiz submission:
- Frontend: `POST /api/quizzes/{quizId}/submit` (api.ts:34)
- Backend: `POST /api/quizzes/:id/responses` (routes.ts:83)

**Files Affected:**
- `/frontend/src/services/api.ts:34`
- `/backend/src/routes.ts:83`

**Fix:**
```typescript
// In /frontend/src/services/api.ts, change:
return await apiClient.post(`${API_BASE_URL}/quizzes/${quizId}/submit`, quizResponse);

// To:
return await apiClient.post(`${API_BASE_URL}/quizzes/${quizId}/responses`, quizResponse);
```

**Test Plan:**
1. Submit quiz from frontend
2. Verify 201 response received
3. Verify results displayed correctly

---

### CRITICAL-2: Frontend Test Suite Failures (9/12 Tests)
**Priority:** CRITICAL
**Impact:** No test coverage for critical user flows
**Effort:** 30 minutes

**Description:**
Frontend tests failing due to API mocking issues:
- Home.test.tsx: 4/4 tests failing
- TakeQuiz.test.tsx: 5/5 tests failing
- Root cause: Tests reference `api.getQuizzes` but actual method is `api.getAllQuizzes`

**Files Affected:**
- `/frontend/src/pages/__tests__/Home.test.tsx`
- `/frontend/src/pages/__tests__/TakeQuiz.test.tsx`

**Fix:**
```typescript
// In Home.test.tsx and TakeQuiz.test.tsx, change:
vi.mocked(api.getQuizzes).mockResolvedValue(mockQuizzes);

// To:
vi.mocked(api.getAllQuizzes).mockResolvedValue(mockQuizzes);
```

**Test Plan:**
1. Run `npm run test:frontend`
2. Verify all 12 tests pass
3. Check coverage report

**Notes:**
- Tests were partially updated but not fully synchronized with API method names
- Consider adding pre-commit hook to prevent test failures from being committed

---

### CRITICAL-3: Unused Shared Package Creates Triple Duplication ✅ RESOLVED
**Priority:** CRITICAL → RESOLVED
**Impact:** DRY violation, maintenance burden, sync issues
**Effort:** 2 hours → **Actual: 30 minutes**
**Status:** ✅ **RESOLVED** on 2025-11-07

**Original Description:**
Three copies of shared schemas/types exist:
1. `/shared/src/schemas.ts` (unused)
2. `/backend/src/shared/schemas.ts` (active)
3. `/frontend/src/shared/schemas.ts` (active)

**Resolution Implemented:**
Removed defunct `/shared/` package directory entirely. Confirmed that controlled duplication between `backend/src/shared/` and `frontend/src/shared/` is **required** due to Railway deployment constraints.

**Changes Made:**
1. ✅ Deleted `/shared/` directory completely
2. ✅ Verified `npm run build` succeeds
3. ✅ Updated CLAUDE.md with comprehensive "Controlled Duplication Strategy" section
4. ✅ Documented sync workflow for maintaining consistency between backend/frontend shared code
5. ✅ Added diff command to check for drift between shared files

**Why Controlled Duplication is Required:**
- Railway deploys each service independently from its own root directory
- Backend builds from `/backend` only (no access to root or frontend)
- Frontend builds from `/frontend` only (no access to root or backend)
- Using npm workspace references would fail in Railway's isolated build environment
- This is a **deployment constraint**, not a development preference

**Duplication Management Strategy (Now Documented):**
```bash
# When updating shared code:
1. Edit backend/src/shared/schemas.ts
2. Copy changes to frontend/src/shared/schemas.ts
3. Run: npm run build
4. Run: npm test
5. Verify no drift: diff backend/src/shared/schemas.ts frontend/src/shared/schemas.ts
```

**Files Kept in Sync:**
- `backend/src/shared/schemas.ts` ↔ `frontend/src/shared/schemas.ts`
- `backend/src/shared/validators.ts` ↔ `frontend/src/shared/validators.ts`
- `backend/src/shared/types.ts` ↔ `frontend/src/shared/types.ts`

**Test Results:**
- ✅ Build succeeds: Both backend and frontend compile without errors
- ✅ No workspace dependency issues
- ✅ Railway deployment strategy validated

**Conclusion:**
This is no longer a "bug" but an **intentional architectural decision** driven by deployment constraints. The duplication is now **controlled** and **documented** with clear management procedures.

---

### CRITICAL-4: Error Handling Inconsistency in Repository
**Priority:** CRITICAL
**Impact:** Error responses don't follow API contract
**Effort:** 15 minutes

**Description:**
InMemoryQuizRepository throws plain `Error` instead of `AppError`, causing error middleware to fail.

**Files Affected:**
- `/backend/src/repositories/InMemoryQuizRepository.ts:22`

**Current Code:**
```typescript
throw new Error(`Quiz with id ${quiz.id} already exists`);
```

**Fix:**
```typescript
import { AppError } from '../utils/errorHandler';

throw new AppError('Quiz already exists', 409);
```

**Test Plan:**
1. Try to create duplicate quiz
2. Verify response is `{ success: false, error: 'Conflict', message: 'Quiz already exists' }`
3. Add integration test for duplicate quiz scenario

---

## Phase 2: HIGH (Fix in Next Sprint)

### HIGH-1: Type Safety Violations - Using `any` Type
**Priority:** HIGH
**Impact:** Loss of type safety, potential runtime errors
**Effort:** 1 hour

**Description:**
Multiple locations use `any` type without justification, violating CLAUDE.md policy.

**Files Affected:**
- `/frontend/src/pages/AdminQuizCreate.tsx:100`
- `/frontend/src/middleware/sanitization.ts:23`
- Multiple catch blocks in frontend

**Fix:**
```typescript
// AdminQuizCreate.tsx - create proper error type
interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
}

try {
  // ...
} catch (error) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    setError(error.response?.data?.message || 'Failed to create quiz');
  } else {
    setError('An unexpected error occurred');
  }
}

// sanitization.ts - use proper recursive typing
type Sanitizable = string | number | boolean | null | SanitizableObject | SanitizableArray;
interface SanitizableObject { [key: string]: Sanitizable; }
interface SanitizableArray extends Array<Sanitizable> {}

export const sanitizeObject = (obj: SanitizableObject): SanitizableObject => { /* ... */ }
```

**Test Plan:**
1. Run TypeScript strict mode: `"strict": true` in tsconfig.json
2. Verify no `any` types remain without explicit justification
3. Test error handling still works correctly

---

### HIGH-2: Ionic Deprecation Warnings - Form Components
**Priority:** HIGH
**Impact:** Ionic 8 will break forms
**Effort:** 3 hours

**Description:**
Test output shows multiple deprecation warnings:
```
[Deprecation Warning]: ion-input now requires providing a label with the "label" property
```

**Files Affected:**
- `/frontend/src/pages/AdminQuizCreate.tsx`
- `/frontend/src/pages/AdminQuizEdit.tsx`
- `/frontend/src/components/FormField.tsx`

**Current Pattern:**
```typescript
<IonLabel position="stacked">Title</IonLabel>
<IonInput value={title} onIonChange={e => setTitle(e.detail.value!)} />
```

**New Pattern:**
```typescript
<IonInput
  label="Title"
  labelPlacement="stacked"
  value={title}
  onIonChange={e => setTitle(e.detail.value!)}
/>
```

**Test Plan:**
1. Update all IonInput and IonTextarea components
2. Verify no deprecation warnings in test output
3. Manually test all forms in browser
4. Verify screen reader accessibility

---

### HIGH-3: Environment Configuration Not Used in Frontend
**Priority:** HIGH
**Impact:** Cannot configure API endpoint without code changes
**Effort:** 20 minutes

**Description:**
`.env.example` defines `VITE_API_URL` but it's not used. API URL is hardcoded.

**Files Affected:**
- `/frontend/src/services/api.ts:5`
- `/frontend/.env.example`

**Fix:**
```typescript
// api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create .env file
VITE_API_URL=http://localhost:3000
```

**Test Plan:**
1. Set VITE_API_URL to different port
2. Verify frontend connects to correct backend
3. Verify Railway deployment uses correct URL
4. Document in DEPLOYMENT.md

---

### HIGH-4: Missing Integration Test for Quiz Submission
**Priority:** HIGH
**Impact:** Critical endpoint untested at HTTP layer
**Effort:** 30 minutes

**Description:**
POST `/quizzes/:id/responses` endpoint exists but has no integration test.

**Files Affected:**
- `/backend/src/__tests__/routes.test.ts`

**Test to Add:**
```typescript
describe('POST /quizzes/:id/responses', () => {
  it('should submit quiz response and return results', async () => {
    const quiz = await quizService.createQuiz(sampleQuiz);
    const response = await request(app)
      .post(`/api/quizzes/${quiz.id}/responses`)
      .send(validQuizResponse)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('scores');
    expect(response.body.data).toHaveProperty('totalScore');
  });

  it('should return 400 for invalid response', async () => {
    const response = await request(app)
      .post(`/api/quizzes/invalid-id/responses`)
      .send({ invalid: 'data' })
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});
```

**Test Plan:**
1. Add tests to routes.test.ts
2. Verify tests pass
3. Check coverage report increases

---

### HIGH-5: Bundle Size Optimization Needed
**Priority:** HIGH
**Impact:** Slow page load on mobile, poor UX
**Effort:** 4 hours

**Description:**
Main bundle is 832.97 kB gzipped (198.95 kB), triggering Vite warning about chunks > 500 kB.

**Files Affected:**
- `/frontend/src/App.tsx`
- Route components

**Fix:**
```typescript
// Implement lazy loading for admin pages
import { lazy, Suspense } from 'react';

const AdminQuizCreate = lazy(() => import('./pages/AdminQuizCreate'));
const AdminQuizEdit = lazy(() => import('./pages/AdminQuizEdit'));
const AdminQuizList = lazy(() => import('./pages/AdminQuizList'));

// In routes:
<Route path="/admin/create" element={
  <Suspense fallback={<IonSpinner />}>
    <AdminQuizCreate />
  </Suspense>
} />
```

**Additional Optimizations:**
- Split vendor chunks in vite.config.ts
- Implement virtualization for long quiz lists
- Lazy load Ionic icons

**Test Plan:**
1. Run `npm run build`
2. Verify no chunk warnings
3. Measure Time to Interactive (TTI) with Lighthouse
4. Target: Main bundle < 200 kB gzipped

---

### HIGH-6: Frontend Test Coverage Gaps
**Priority:** HIGH
**Impact:** 60%+ of frontend components untested
**Effort:** 8 hours

**Description:**
Missing tests for critical components:
- AdminQuizEdit: No tests
- AdminQuizList: No tests
- QuizResults: No tests
- FormField: No tests

**Files to Create:**
- `/frontend/src/pages/__tests__/AdminQuizEdit.test.tsx`
- `/frontend/src/pages/__tests__/AdminQuizList.test.tsx`
- `/frontend/src/pages/__tests__/QuizResults.test.tsx`
- `/frontend/src/components/__tests__/FormField.test.tsx`

**Coverage Goals:**
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

**Test Plan:**
1. Write tests for each component
2. Run `npm run test:frontend -- --coverage`
3. Verify coverage meets goals
4. Add coverage thresholds to vitest.config.ts

---

## Phase 3: MEDIUM (Regular Maintenance)

### MEDIUM-1: Incomplete Interface Contracts
**Priority:** MEDIUM
**Impact:** Confusing API surface, poor documentation
**Effort:** 1 hour

**Description:**
`IQuizService` only defines 2 methods but `QuizService` implements 7+ public methods.

**Files Affected:**
- `/backend/src/interfaces/IQuizService.ts`
- `/backend/src/services/QuizService.ts`

**Fix:**
```typescript
export interface IQuizService {
  // CRUD operations
  getQuiz(id: string): Promise<Quiz>;
  getAllQuizzes(): Promise<Quiz[]>;
  createQuiz(quiz: Quiz): Promise<Quiz>;
  updateQuiz(id: string, quiz: Quiz): Promise<Quiz>;
  deleteQuiz(id: string): Promise<boolean>;

  // Quiz operations
  submitQuizResponse(quizId: string, response: QuizResponse): Promise<QuizResult>;
  calculateResults(quiz: Quiz, response: QuizResponse): QuizResult;
  validateQuizResponse(quiz: Quiz, response: QuizResponse): ValidationResult;
}
```

**Test Plan:**
1. Update interface
2. Verify QuizService implements interface: `class QuizService implements IQuizService`
3. Verify TypeScript compilation succeeds

---

### MEDIUM-2: Unused IQuizStore Interface
**Priority:** MEDIUM
**Impact:** Dead code, architectural confusion
**Effort:** 30 minutes

**Description:**
`IQuizStore` interface exists but is never implemented or used. Duplicates `IQuizRepository` functionality.

**Files Affected:**
- `/backend/src/interfaces/IQuizStore.ts`
- `/backend/src/store.ts` (InMemoryQuizStore - also unused)

**Decision Required:**
- Option A: Delete both files (recommended)
- Option B: Deprecate and document why they exist

**Fix:**
```bash
# Option A - Delete
rm backend/src/interfaces/IQuizStore.ts
rm backend/src/store.ts
rm backend/src/__tests__/store.test.ts
```

**Test Plan:**
1. Delete files
2. Run `npm run build`
3. Verify no imports exist: `grep -r "IQuizStore" backend/src/`
4. Verify tests pass

---

### MEDIUM-3: Network Error Handling in Frontend
**Priority:** MEDIUM
**Impact:** Poor UX, confusing error messages
**Effort:** 2 hours

**Description:**
Frontend shows generic "Failed to..." messages for all errors. Should distinguish:
- Network failures (show retry button)
- Validation errors (show specific fields)
- Server errors (500s vs 400s)

**Files Affected:**
- `/frontend/src/pages/TakeQuiz.tsx`
- `/frontend/src/pages/AdminQuizCreate.tsx`
- All pages using API

**Fix:**
```typescript
// Create error handling utility
export const handleApiError = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return 'An unexpected error occurred';
  }

  if (!error.response) {
    return 'Network error. Please check your connection and try again.';
  }

  const { status, data } = error.response;

  if (status >= 500) {
    return 'Server error. Please try again later.';
  }

  if (status === 404) {
    return 'Resource not found';
  }

  if (status === 400 && data?.message) {
    return data.message; // Validation error from backend
  }

  return data?.message || 'Something went wrong';
};

// Use in components
catch (error) {
  setError(handleApiError(error));
  setShowRetry(!axios.isAxiosError(error) || !error.response); // Show retry on network errors
}
```

**Test Plan:**
1. Test with network disconnected
2. Test with invalid data
3. Test with server error (mock 500 response)
4. Verify appropriate messages shown

---

### MEDIUM-4: Missing Logging in Frontend API Layer
**Priority:** MEDIUM
**Impact:** Difficult to debug production issues
**Effort:** 1 hour

**Description:**
No logging of API calls, errors, or responses in frontend. Backend logs everything, but frontend is silent.

**Files Affected:**
- `/frontend/src/services/api.ts`

**Fix:**
```typescript
// Add request/response interceptors
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// For production, use conditional logging
const isDev = import.meta.env.MODE === 'development';
if (isDev) {
  // Add interceptors
}
```

**Test Plan:**
1. Make API calls in dev mode
2. Verify logs appear in console
3. Verify no logs in production build
4. Consider adding integration with error tracking service (Sentry, etc.)

---

### MEDIUM-5: Unused Validator Methods
**Priority:** MEDIUM
**Impact:** Code maintenance burden
**Effort:** 30 minutes

**Description:**
Methods in validators.ts are defined but never used:
- `validateMetric()`
- `validateQuestion()`
- `validateAnswer()`

**Files Affected:**
- `/backend/src/shared/validators.ts:47-68`

**Decision:**
- Option A: Delete unused methods
- Option B: Document when to use them
- Option C: Use them in routes for additional validation

**Fix (Option C - Recommended):**
```typescript
// In routes.ts, add additional validation
router.post('/quizzes',
  validateBody(QuizSchema),
  (req, res, next) => {
    // Additional business logic validation
    const validation = validateQuizConsistency(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: validation.errors.join(', ')
      });
    }
    next();
  },
  asyncHandler(async (req, res) => {
    // ...
  })
);
```

**Test Plan:**
1. Test creating quiz with inconsistent data
2. Verify proper error messages
3. Add integration test

---

### MEDIUM-6: Hardcoded Magic Numbers in Frontend
**Priority:** MEDIUM
**Impact:** Inconsistent with backend patterns
**Effort:** 30 minutes

**Description:**
`QuizResults.tsx` has hardcoded percentage thresholds (80%, 60%, 40%). Should be in constants file like backend.

**Files Affected:**
- `/frontend/src/pages/QuizResults.tsx:48-59`

**Fix:**
```typescript
// Create /frontend/src/config/constants.ts
export const SCORING_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  NEEDS_IMPROVEMENT: 40
} as const;

export const SCORE_COLORS = {
  EXCELLENT: 'success',
  GOOD: 'primary',
  NEEDS_IMPROVEMENT: 'warning',
  POOR: 'danger'
} as const;

// In QuizResults.tsx
import { SCORING_THRESHOLDS, SCORE_COLORS } from '../config/constants';

const getScoreColor = (percentage: number): string => {
  if (percentage >= SCORING_THRESHOLDS.EXCELLENT) return SCORE_COLORS.EXCELLENT;
  if (percentage >= SCORING_THRESHOLDS.GOOD) return SCORE_COLORS.GOOD;
  if (percentage >= SCORING_THRESHOLDS.NEEDS_IMPROVEMENT) return SCORE_COLORS.NEEDS_IMPROVEMENT;
  return SCORE_COLORS.POOR;
};
```

**Test Plan:**
1. Verify results page still works
2. Verify colors match previous behavior
3. Update tests if needed

---

### MEDIUM-7: Rate Limiting Not Validated in Tests
**Priority:** MEDIUM
**Impact:** Security feature untested
**Effort:** 1 hour

**Description:**
Rate limiting configured in server.ts but no tests verify it works.

**Files Affected:**
- `/backend/src/server.ts:79-89`
- `/backend/src/__tests__/` (new file needed)

**Test to Add:**
```typescript
// /backend/src/__tests__/rateLimit.test.ts
describe('Rate Limiting', () => {
  it('should enforce general rate limit (100 req/15min)', async () => {
    const requests = Array(101).fill(null).map(() =>
      request(app).get('/api/quizzes')
    );

    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);

    expect(rateLimited.length).toBeGreaterThan(0);
  });

  it('should enforce stricter limit on POST requests (30 req/15min)', async () => {
    const requests = Array(31).fill(null).map(() =>
      request(app)
        .post('/api/quizzes')
        .send(validQuiz)
    );

    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);

    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

**Test Plan:**
1. Add tests
2. Verify rate limits trigger correctly
3. Test different endpoints
4. Document rate limits in API_DOCUMENTATION.md

---

## Phase 4: LOW (Code Quality & Polish)

### LOW-1: Missing JSDoc Documentation
**Priority:** LOW
**Impact:** Difficult to understand complex logic
**Effort:** 2 hours

**Description:**
Complex functions lack JSDoc comments, particularly:
- `calculateResults()` - 141 lines of scoring logic
- `validateQuizConsistency()` - business rule validation
- `validateQuizResponseConsistency()` - response validation

**Files Affected:**
- `/backend/src/services/QuizService.ts:68-141`
- `/backend/src/shared/validators.ts:73-168`

**Fix:**
```typescript
/**
 * Calculates quiz results based on user responses
 *
 * @param quiz - The quiz being taken
 * @param response - The user's answers to all questions
 * @returns QuizResult containing scores per metric and total score
 *
 * @throws {AppError} If quiz or response is invalid
 *
 * @example
 * const result = quizService.calculateResults(wellbeingQuiz, userResponse);
 * console.log(result.totalScore); // 75.5
 * console.log(result.scores); // { physical: 80, mental: 71 }
 */
public calculateResults(quiz: Quiz, response: QuizResponse): QuizResult {
  // Implementation
}
```

**Test Plan:**
1. Add JSDoc to all public methods
2. Verify IDE shows documentation on hover
3. Consider generating API docs with TypeDoc

---

### LOW-2: No Explicit Return Types on Some Functions
**Priority:** LOW
**Impact:** Slightly reduced type safety
**Effort:** 1 hour

**Description:**
Some functions have implicit return types. Best practice is explicit return types for all exported functions.

**Files Affected:**
- Various files throughout codebase

**Fix:**
```typescript
// Before
export const sanitizeString = (str: string) => {
  return xss(str, { whiteList: {} });
};

// After
export const sanitizeString = (str: string): string => {
  return xss(str, { whiteList: {} });
};
```

**Test Plan:**
1. Add explicit return types
2. Enable `noImplicitReturns` in tsconfig.json
3. Verify TypeScript compilation succeeds

---

### LOW-3: Missing Linting Configuration for Frontend
**Priority:** LOW
**Impact:** Inconsistent code quality
**Effort:** 1 hour

**Description:**
Backend has strict ESLint rules, frontend has minimal configuration.

**Files Affected:**
- `/frontend/.eslintrc.json`

**Fix:**
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react-hooks/exhaustive-deps": "error",
    "no-console": "warn"
  }
}
```

**Test Plan:**
1. Run `npm run lint --workspace=frontend`
2. Fix all errors
3. Add lint check to CI/CD

---

### LOW-4: No Input Validation for URL Parameters
**Priority:** LOW
**Impact:** Missing validation layer
**Effort:** 1 hour

**Description:**
Route parameters (`:id`) not validated with Zod schemas.

**Files Affected:**
- `/backend/src/routes.ts`

**Fix:**
```typescript
// Create validation middleware
const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'Invalid parameters',
          details: error.errors
        });
      }
    }
  };
};

// Use in routes
const IdParamSchema = z.object({ id: z.string().min(1) });

router.get('/quizzes/:id',
  validateParams(IdParamSchema),
  asyncHandler(async (req, res) => {
    // req.params.id is now validated
  })
);
```

**Test Plan:**
1. Test with empty ID
2. Test with invalid characters
3. Verify proper error responses

---

### LOW-5: Configuration Spread Across Multiple Files
**Priority:** LOW
**Impact:** Difficult to see all configuration
**Effort:** 2 hours

**Description:**
Configuration scattered across:
- `/backend/src/config/constants.ts`
- `/backend/src/config/env.ts`
- Environment variables
- Hardcoded values in server.ts

**Fix:**
Consolidate into single config object:
```typescript
// /backend/src/config/index.ts
export const config = {
  env: env, // from env.ts
  server: {
    port: env.PORT,
    corsOrigin: env.CORS_ORIGIN
  },
  constants: constants, // from constants.ts
  features: {
    rateLimiting: true,
    sanitization: true
  }
} as const;

// Use throughout app
import { config } from './config';
```

**Test Plan:**
1. Refactor imports
2. Verify no hardcoded values remain
3. Document all config options

---

### LOW-6: Missing Health Check in API Documentation
**Priority:** LOW
**Impact:** Deployment orchestration can't verify readiness
**Effort:** 15 minutes

**Description:**
Health endpoint exists (`GET /health`) but not documented in API_DOCUMENTATION.md.

**Files Affected:**
- `/API_DOCUMENTATION.md`
- `/backend/src/server.ts:97`

**Fix:**
Add to API documentation:
```markdown
## GET /health

Health check endpoint for monitoring and deployment.

**Response:**
- **200 OK**
  ```json
  {
    "status": "ok",
    "timestamp": "2025-11-07T10:30:00.000Z"
  }
  ```
```

**Test Plan:**
1. Add documentation
2. Test health endpoint
3. Configure Railway to use health check

---

### LOW-7: Missing Request ID Tracking
**Priority:** LOW
**Impact:** Cannot trace requests through logs
**Effort:** 1 hour

**Description:**
No correlation ID for tracing requests through distributed logs.

**Files Affected:**
- `/backend/src/server.ts`
- `/backend/src/middleware/logger.ts` (if exists)

**Fix:**
```typescript
import { v4 as uuidv4 } from 'uuid';

app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Update logger to include request ID
logger.info(`[${req.id}] ${req.method} ${req.path}`);
```

**Test Plan:**
1. Make requests
2. Verify X-Request-ID header in responses
3. Verify logs include request ID
4. Test correlation across multiple log entries

---

### LOW-8: Empty Test Setup File
**Priority:** LOW
**Impact:** Test code duplication
**Effort:** 30 minutes

**Description:**
`/backend/src/__tests__/setup.ts` is empty. Should contain shared test utilities and setup.

**Files Affected:**
- `/backend/src/__tests__/setup.ts`

**Fix:**
```typescript
// Global test setup
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Shared test fixtures
export const createMockQuiz = (overrides = {}) => ({
  id: 'test-quiz-1',
  title: 'Test Quiz',
  // ... default values
  ...overrides
});

// Shared assertions
export const expectApiSuccess = (response: any) => {
  expect(response.body.success).toBe(true);
  expect(response.body.data).toBeDefined();
};

// Setup/teardown helpers
export const setupTestDb = async () => {
  // Initialize test database
};
```

**Test Plan:**
1. Add shared utilities
2. Refactor tests to use utilities
3. Verify all tests still pass

---

## Phase 5: SECURITY

### SECURITY-1: No CSRF Protection
**Priority:** SECURITY - MEDIUM
**Impact:** Potential CSRF attacks if frontend becomes same-origin
**Effort:** 2 hours

**Description:**
No CSRF token handling. Currently mitigated by CORS (different ports), but should be implemented for production.

**Files Affected:**
- `/backend/src/server.ts`

**Fix:**
```typescript
import csurf from 'csurf';

// Add CSRF protection
const csrfProtection = csurf({ cookie: true });

app.use(csrfProtection);

// Add endpoint to get CSRF token
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Frontend must include token in requests
axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
```

**Test Plan:**
1. Test request without token (should fail)
2. Test request with valid token (should succeed)
3. Test token expiration
4. Document in API_DOCUMENTATION.md

**Note:** Only implement if deploying to production with same-origin configuration.

---

### SECURITY-2: Content Security Policy Missing
**Priority:** SECURITY - MEDIUM
**Impact:** XSS protection not as strong as it could be
**Effort:** 1 hour

**Description:**
No CSP headers configured. XSS sanitization exists but defense-in-depth requires CSP.

**Files Affected:**
- `/backend/src/server.ts`

**Fix:**
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust based on needs
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));
```

**Test Plan:**
1. Add CSP headers
2. Test app functionality
3. Check browser console for CSP violations
4. Adjust directives as needed

---

### SECURITY-3: Error Messages May Leak Information
**Priority:** SECURITY - LOW
**Impact:** Potential information disclosure
**Effort:** 1 hour

**Description:**
Some error messages include validation details that could expose internal structure.

**Files Affected:**
- `/backend/src/services/QuizService.ts`
- `/backend/src/middleware/errorHandler.ts`

**Current State:**
Actually implemented correctly with `sanitizeDetails()` in production mode.

**Action:**
Review all error messages to ensure no leakage:
```typescript
// Audit checklist:
// ✓ Stack traces hidden in production
// ✓ Validation errors sanitized
// ? Check for database error messages
// ? Check for file path leakage
```

**Test Plan:**
1. Set NODE_ENV=production
2. Trigger various errors
3. Verify no sensitive info in responses
4. Document error response format

---

### SECURITY-4: No Authentication/Authorization
**Priority:** SECURITY - FUTURE
**Impact:** All endpoints are public
**Effort:** 40+ hours

**Description:**
No authentication system implemented. All API endpoints are public.

**Files Affected:**
- All backend routes
- Frontend pages
- Need auth middleware, JWT handling, user management

**Future Implementation:**
```typescript
// Middleware needed:
// - authenticateToken
// - requireAdmin
// - requireUser

// Endpoints to protect:
// - POST/PUT/DELETE /quizzes (admin only)
// - POST /quizzes/:id/responses (authenticated users)
// - GET /quizzes (public)
```

**Decision:**
Document in CLAUDE.md as "Not yet implemented (documented for future)". This is a major feature requiring:
- User registration/login
- JWT tokens
- Password hashing
- Role-based access control
- Session management

---

## Phase 6: PERFORMANCE

### PERFORMANCE-1: No Pagination for Quiz Lists
**Priority:** PERFORMANCE - MEDIUM
**Impact:** Doesn't scale with 1000s of quizzes
**Effort:** 3 hours

**Description:**
`GET /quizzes` returns all quizzes at once. Need pagination for scalability.

**Files Affected:**
- `/backend/src/routes.ts`
- `/backend/src/repositories/IQuizRepository.ts`
- `/frontend/src/services/api.ts`

**Fix:**
```typescript
// Backend
interface PaginationOptions {
  page: number;
  limit: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Repository
findAll(options?: PaginationOptions): Promise<PaginatedResponse<Quiz>>;

// Route
router.get('/quizzes',
  query: { page: '1', limit: '10' }
);

// Frontend - infinite scroll or pagination
const { data, pagination } = await api.getAllQuizzes({ page: 1, limit: 10 });
```

**Test Plan:**
1. Create 100 test quizzes
2. Test pagination with different page sizes
3. Verify total count is correct
4. Test edge cases (page out of bounds)

---

### PERFORMANCE-2: No Caching Headers
**Priority:** PERFORMANCE - LOW
**Impact:** Every request goes to server
**Effort:** 1 hour

**Description:**
No cache headers configured. Quiz list could be cached for short duration.

**Files Affected:**
- `/backend/src/routes.ts`

**Fix:**
```typescript
// Add cache middleware
const cacheMiddleware = (seconds: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', `public, max-age=${seconds}`);
    next();
  };
};

// Use for GET requests
router.get('/quizzes', cacheMiddleware(300), asyncHandler(async (req, res) => {
  // Cached for 5 minutes
}));

// Don't cache POST/PUT/DELETE
router.post('/quizzes', asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store');
}));
```

**Test Plan:**
1. Check response headers
2. Verify browser caches responses
3. Verify POST requests not cached
4. Test cache invalidation

---

### PERFORMANCE-3: Quiz Service calculateResults Could Be Optimized
**Priority:** PERFORMANCE - LOW
**Impact:** Complex algorithm, scales with quiz size
**Effort:** 3 hours

**Description:**
`calculateResults()` is 141 lines with nested loops. Could be optimized and extracted to separate class.

**Files Affected:**
- `/backend/src/services/QuizService.ts:68-141`

**Fix:**
```typescript
// Extract to /backend/src/services/ScoringCalculator.ts
export class ScoringCalculator {
  /**
   * Calculates metric scores using efficient map/reduce
   */
  public calculate(quiz: Quiz, response: QuizResponse): QuizResult {
    // Use Map for O(1) lookups instead of array.find()
    const answerMap = new Map(
      quiz.questions.flatMap(q =>
        q.answers.map(a => [a.id, a])
      )
    );

    // Single pass through responses
    const metricScores = response.answers.reduce((scores, answer) => {
      const answerObj = answerMap.get(answer.answerId);
      if (!answerObj) return scores;

      answerObj.scores.forEach(score => {
        scores.set(
          score.metricId,
          (scores.get(score.metricId) || 0) + score.value
        );
      });

      return scores;
    }, new Map<string, number>());

    // Convert to final format
    return this.formatResult(metricScores, quiz.metrics);
  }
}
```

**Test Plan:**
1. Benchmark current implementation
2. Implement optimization
3. Benchmark new implementation
4. Verify results are identical
5. Add performance tests

---

## Phase 7: DOCUMENTATION

### DOCUMENTATION-1: API Documentation Missing Quiz Response Endpoint
**Priority:** DOCUMENTATION - HIGH
**Impact:** Developers can't find correct endpoint
**Effort:** 30 minutes

**Description:**
POST `/quizzes/:id/responses` is not documented in API_DOCUMENTATION.md.

**Files Affected:**
- `/API_DOCUMENTATION.md`

**Fix:**
Add comprehensive documentation:
```markdown
## POST /quizzes/:id/responses

Submit a user's quiz response and receive calculated results.

**Parameters:**
- `id` (path) - Quiz ID

**Request Body:**
\`\`\`json
{
  "quizId": "string",
  "participantId": "string",
  "answers": [
    {
      "questionId": "string",
      "answerId": "string"
    }
  ],
  "submittedAt": "ISO8601 string"
}
\`\`\`

**Response:**
- **201 Created**
  \`\`\`json
  {
    "success": true,
    "data": {
      "id": "string",
      "quizId": "string",
      "scores": {
        "physical": 75.5,
        "mental": 68.2
      },
      "totalScore": 71.85,
      "completedAt": "2025-11-07T10:30:00.000Z"
    }
  }
  \`\`\`

- **400 Bad Request** - Invalid response data
- **404 Not Found** - Quiz not found
```

**Test Plan:**
1. Add documentation
2. Test endpoint with examples
3. Verify all response formats documented

---

### DOCUMENTATION-2: No CONTRIBUTING.md
**Priority:** DOCUMENTATION - MEDIUM
**Impact:** New developers don't know patterns
**Effort:** 1 hour

**Description:**
No contributing guide for developers joining the project.

**Files to Create:**
- `/CONTRIBUTING.md`

**Content:**
```markdown
# Contributing Guide

## Development Workflow

1. **Branch naming:** `feature/description` or `fix/description`
2. **Commit messages:** Use conventional commits format
3. **Pre-commit checklist:** See CLAUDE.md

## Syncing Shared Code

**CRITICAL:** When updating shared schemas/types:
1. Update `/backend/src/shared/schemas.ts`
2. Update `/frontend/src/shared/schemas.ts`
3. Keep both files identical
4. Run `npm run build` to verify

## Adding New Endpoints

Follow the pattern in CLAUDE.md:
1. Define schema in shared/schemas.ts
2. Add service method
3. Add route with validation
4. Add API client method
5. Write integration test

## Testing Requirements

- All new features must have tests
- Backend: > 90% coverage
- Frontend: > 80% coverage
- Run `npm test` before committing
```

**Test Plan:**
1. Create document
2. Ask new developer to follow it
3. Gather feedback and refine

---

### DOCUMENTATION-3: Railway Deployment Instructions Incomplete
**Priority:** DOCUMENTATION - MEDIUM
**Impact:** Deployment may fail
**Effort:** 1 hour

**Description:**
DEPLOYMENT.md mentions Railway but configuration details unclear.

**Files Affected:**
- `/DEPLOYMENT.md`
- `/backend/railway.toml`
- `/frontend/railway.toml`

**Fix:**
Add detailed Railway deployment section:
```markdown
## Railway Deployment

### Prerequisites
- Railway account
- Railway CLI installed
- GitHub repo connected

### Backend Deployment

1. **Create service:**
   \`\`\`bash
   railway init
   railway up
   \`\`\`

2. **Configure environment:**
   \`\`\`bash
   railway variables set NODE_ENV=production
   railway variables set PORT=3000
   railway variables set CORS_ORIGIN=https://your-frontend.railway.app
   \`\`\`

3. **Deploy:**
   \`\`\`bash
   railway up
   \`\`\`

### Frontend Deployment

1. **Configure API URL:**
   \`\`\`bash
   railway variables set VITE_API_URL=https://your-backend.railway.app
   \`\`\`

2. **Deploy:**
   \`\`\`bash
   railway up
   \`\`\`

### Troubleshooting

- **Build fails:** Check `railway logs`
- **CORS errors:** Verify CORS_ORIGIN in backend
```

**Test Plan:**
1. Follow instructions on fresh Railway account
2. Verify successful deployment
3. Test deployed application

---

## Summary Statistics

### Issues by Priority
- **CRITICAL:** 3 remaining (1 resolved: shared package) - must fix before deployment
- **HIGH:** 6 issues (fix in next sprint)
- **MEDIUM:** 7 issues (regular maintenance)
- **LOW:** 8 issues (code quality & polish)
- **SECURITY:** 4 issues (2 medium, 2 future/low)
- **PERFORMANCE:** 3 issues (optimization opportunities)
- **DOCUMENTATION:** 3 issues (improve developer experience)

### Issues by Category
- **Functionality Bugs:** 3 remaining (1 resolved: shared package duplication)
- **Architecture:** 7 remaining (1 resolved: duplication strategy documented)
- **Code Quality:** 12 (type safety, unused code, magic numbers)
- **Testing:** 5 (coverage gaps, missing tests)
- **Security:** 4 (CSRF, CSP, auth)
- **Performance:** 3 (bundle size, pagination, caching)
- **Documentation:** 3 (API docs, contributing guide, deployment)
- **Configuration:** 4 (env vars, constants, setup)
- **Dependencies:** 2 remaining (1 resolved: shared package)

### Estimated Total Effort
- **Phase 1 (Critical):** ~1.25 hours remaining (was ~3 hours, saved 1.75 hours by resolving CRITICAL-3)
- **Phase 2 (High):** ~18 hours
- **Phase 3 (Medium):** ~9 hours
- **Phase 4 (Low):** ~10 hours
- **Phase 5 (Security):** ~5 hours (excluding auth: 40+ hours)
- **Phase 6 (Performance):** ~7 hours
- **Phase 7 (Documentation):** ~3 hours

**Total Remaining:** ~53.25 hours (was ~55 hours, excluding full auth system)
**Time Saved:** 1.75 hours by resolving CRITICAL-3 early

### Quick Wins (< 30 minutes each)
1. ✅ ~~Resolve shared package duplication (CRITICAL-3)~~ - **COMPLETED**
2. Fix API endpoint mismatch (CRITICAL-1)
3. Fix test mocking (CRITICAL-2)
4. Fix error type in repository (CRITICAL-4)
5. Use environment variable for API URL (HIGH-3)
6. Extract magic numbers to constants (MEDIUM-6)
7. Add health check to docs (LOW-6)
8. Add missing test setup (LOW-8)

### Recommended Sprint Plan

**Sprint 1 (Critical + Quick Wins):**
- ✅ ~~CRITICAL-3 (shared package)~~ - **COMPLETED**
- CRITICAL-1 (API endpoint mismatch)
- CRITICAL-2 (test failures)
- CRITICAL-4 (error handling)
- HIGH-3 (environment config)
- MEDIUM-6 (magic numbers)
- DOCUMENTATION-1 (API docs)

**Sprint 2 (High Priority):**
- HIGH-2 (Ionic deprecations)
- HIGH-4 (integration tests)
- HIGH-6 (frontend test coverage)
- MEDIUM-2 (remove unused code)

**Sprint 3 (Cleanup + Security):**
- HIGH-5 (bundle optimization)
- SECURITY-1 (CSRF)
- SECURITY-2 (CSP)
- MEDIUM-3 (network error handling)

**Sprint 4 (Performance + Documentation):**
- PERFORMANCE-1 (pagination)
- DOCUMENTATION-2 (CONTRIBUTING.md)
- DOCUMENTATION-3 (deployment docs)
- Various LOW priority items

---

## Appendix: Code Review Methodology

This backlog was generated through comprehensive analysis:

1. **Static Analysis:** Code structure, patterns, type safety
2. **Test Execution:** Backend (96 passing), Frontend (3/12 passing)
3. **Build Verification:** Identified warnings and deprecations
4. **Dependency Review:** Checked for unused packages and duplications
5. **Security Audit:** XSS, CSRF, rate limiting, error handling
6. **Performance Analysis:** Bundle size, caching, query optimization
7. **Documentation Review:** API docs, README, architecture docs
8. **Pattern Consistency:** Repository, DI, three-layer architecture

### Test Coverage Baseline
- **Backend:** 94.36% statements, 82.85% branches
- **Frontend:** ~25% (estimated, many components untested)

### Technical Debt Indicators
- 3 copies of shared code (should be 1)
- 9 failing frontend tests (should be 0)
- 2 unused interfaces (should be removed)
- 1 critical API endpoint mismatch (blocks functionality)
- 832 kB bundle (should be < 500 kB)

---

## Next Steps

1. **Review this backlog** with the development team
2. **Prioritize issues** based on business needs
3. **Create tickets** in project management system
4. **Assign ownership** for each phase
5. **Set deadlines** for Phase 1 (critical issues)
6. **Schedule retrospective** after Phase 1 completion

---

*This document should be treated as a living backlog. Update as issues are resolved and new issues are discovered.*
