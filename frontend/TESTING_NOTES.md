# Frontend Testing Notes

## CRITICAL-2: Test Failures - Investigation Summary

### Problem
9 frontend tests failing due to mocking conflicts between API service and React component imports.

### Error
```
Error: Element type is invalid: expected a string (for built-in components)
or a class/function (for composite components) but got: undefined.
```

### Root Cause
Mocking `../../services/api` at the module level interferes with React component resolution. When Vitest mocks the API module, it somehow breaks the default export chain for components that import it.

### Attempted Solutions

#### 1. Inline Mock Factory (Failed)
```typescript
vi.mock('../../services/api', () => ({
  api: { getAllQuizzes: vi.fn(), ... }
}));
```
**Result:** Component imports break, React receives `undefined` instead of component.

#### 2. Manual Mocks via `__mocks__` Directory (Failed)
- Created `/frontend/src/services/__mocks__/api.ts`
- Simplified mock declaration: `vi.mock('../../services/api')`
- **Result:** Same error - mocking still breaks component imports.

### Analysis

The issue appears to be:
1. **Module Resolution Timing:** Vitest applies mocks during module resolution
2. **Circular/Complex Dependencies:** Components import API → Mock intercepts → Something in the chain breaks
3. **Default Export Issue:** React components use default exports which may be affected by mock hoisting

### Recommended Solutions

#### Option A: Mock Service Worker (MSW) - Recommended
Instead of mocking the module, mock at the network level:
```typescript
import { setupServer } from 'msw/node'
import { rest } from 'msw'

const server = setupServer(
  rest.get('/api/quizzes', (req, res, ctx) => {
    return res(ctx.json({ success: true, data: mockQuizzes }))
  })
)
```

**Pros:**
- No module mocking - tests actual API integration
- More realistic tests
- No component import issues

**Cons:**
- Requires additional setup
- Different testing paradigm

#### Option B: Dependency Injection
Refactor components to accept API service as prop or context:
```typescript
interface TakeQuizProps {
  apiService?: typeof api;
}

const TakeQuiz: React.FC<TakeQuizProps> = ({ apiService = api }) => {
  // Use apiService instead of importing api directly
}
```

**Pros:**
- Clean testing with mock injection
- Better architecture (testability, swappability)

**Cons:**
- Requires refactoring all components
- More boilerplate

#### Option C: Integration Tests Only
Accept that unit tests with mocks are problematic, write integration tests instead:
- Use real API calls to test backend
- Or use MSW for network mocking
- Focus on E2E testing with Playwright

**Pros:**
- More confidence in actual behavior
- Avoids mocking issues entirely

**Cons:**
- Slower tests
- Requires running backend or mocking network

### Current Status

**Branch:** `claude/fix/frontend-test-failures-011CUu8kbtdxqtBik6phwXmc`

**Completed:**
- ✅ Fixed API method name mismatches
- ✅ Created manual mock infrastructure
- ✅ Identified root cause of test failures

**Remaining:**
- ⏳ Implement one of the recommended solutions above
- ⏳ Get all 9 tests passing

**Estimated Additional Effort:** 2-4 hours depending on approach chosen

### Decision Needed

Which approach should we take?
1. **MSW** (2-3 hours) - Modern, realistic
2. **Dependency Injection** (3-4 hours) - Clean architecture
3. **Integration/E2E Focus** (1-2 hours) - Pragmatic

Recommendation: Start with **MSW** as it provides the best balance of realistic testing without requiring component refactoring.
