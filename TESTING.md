# Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the Quiz Metrics application. We employ multiple testing levels to ensure code quality, reliability, and maintainability.

## Testing Pyramid

```
        /\
       /E2E\
      /------\
     /Contract\
    /----------\
   /Integration\
  /--------------\
 /  Unit Tests    \
/------------------\
```

## 1. Unit Tests

### Purpose
Test individual components in isolation with mocked dependencies.

### Coverage Target
- **Minimum**: 75% code coverage
- **Goal**: 80%+ code coverage

### What to Test

#### Shared Package
- ✅ Schema validation (see `shared/src/__tests__/validators.test.ts`)
- ✅ Business logic validators
- ✅ Edge cases and boundary conditions

#### Backend Repositories
- ✅ CRUD operations
- ✅ Query methods
- ✅ Error handling
- ✅ Edge cases (empty results, duplicates)

Example:
```typescript
describe('InMemoryQuizRepository', () => {
  let repository: InMemoryQuizRepository;

  beforeEach(() => {
    repository = new InMemoryQuizRepository();
  });

  it('should create a quiz', async () => {
    const quiz = createMockQuiz();
    const created = await repository.create(quiz);
    expect(created).toEqual(quiz);
  });

  it('should throw error for duplicate ID', async () => {
    const quiz = createMockQuiz();
    await repository.create(quiz);
    await expect(repository.create(quiz)).rejects.toThrow();
  });
});
```

#### Backend Services
- Business logic methods
- Score calculation accuracy
- Validation logic
- Error conditions

Example:
```typescript
describe('QuizService', () => {
  let service: QuizService;
  let mockQuizRepo: jest.Mocked<IQuizRepository>;
  let mockResponseRepo: jest.Mocked<IQuizResponseRepository>;

  beforeEach(() => {
    mockQuizRepo = createMockQuizRepository();
    mockResponseRepo = createMockResponseRepository();
    service = new QuizService(mockQuizRepo, mockResponseRepo);
  });

  it('should calculate correct metric scores', () => {
    const quiz = createMockQuiz();
    const response = createMockResponse();
    const result = service.calculateResults(quiz, response);

    expect(result.metricScores[0].totalScore).toBe(8);
    expect(result.metricScores[0].percentage).toBe(80);
  });
});
```

### Running Unit Tests

```bash
# Backend
cd backend
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm run test:watch

# Shared package
cd shared
npm test
```

## 2. Integration Tests

### Purpose
Test multiple components working together, including real database interactions (or in-memory equivalents).

### What to Test

#### API Endpoints
- HTTP methods (GET, POST, PUT, DELETE)
- Request validation
- Response formats
- Error responses
- Status codes

Example:
```typescript
describe('Quiz API Integration Tests', () => {
  let app: Express;
  let repository: InMemoryQuizRepository;

  beforeAll(() => {
    repository = new InMemoryQuizRepository();
    const service = new QuizService(repository, new InMemoryQuizResponseRepository());
    app = createTestApp(service);
  });

  afterEach(() => {
    repository.clear();
  });

  describe('POST /api/quizzes', () => {
    it('should create a quiz', async () => {
      const quiz = createValidQuiz();

      const response = await request(app)
        .post('/api/quizzes')
        .send(quiz)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(quiz.id);
    });

    it('should return 400 for invalid quiz', async () => {
      const invalidQuiz = { title: '' }; // Missing required fields

      const response = await request(app)
        .post('/api/quizzes')
        .send(invalidQuiz)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('POST /api/quizzes/:id/submit', () => {
    it('should calculate and return results', async () => {
      const quiz = await repository.create(createValidQuiz());
      const response = createValidResponse(quiz);

      const result = await request(app)
        .post(`/api/quizzes/${quiz.id}/submit`)
        .send(response)
        .expect(200);

      expect(result.body.success).toBe(true);
      expect(result.body.data.metricScores).toHaveLength(quiz.metrics.length);
    });
  });
});
```

### Running Integration Tests

```bash
cd backend
npm run test:integration
```

## 3. Contract Tests

### Purpose
Ensure frontend and backend agree on API contracts (request/response formats).

### Approach: Schema-Based Contract Testing

Since we use shared Zod schemas, we get contract testing "for free":

1. **Shared Schemas**: Both frontend and backend use same schemas
2. **Validation**: Backend validates all requests
3. **Type Safety**: Frontend has compile-time checks

### Additional Contract Testing

For more formal contract testing, we can use Pact:

```typescript
// Consumer (Frontend) Contract Test
describe('Quiz API Contract', () => {
  const provider = pact({
    consumer: 'QuizFrontend',
    provider: 'QuizBackend'
  });

  it('should get quiz by ID', async () => {
    await provider.addInteraction({
      state: 'quiz exists',
      uponReceiving: 'a request for quiz by ID',
      withRequest: {
        method: 'GET',
        path: '/api/quizzes/quiz-1'
      },
      willRespondWith: {
        status: 200,
        body: {
          success: true,
          data: like({
            id: 'quiz-1',
            title: string(),
            description: string(),
            metrics: eachLike({
              id: string(),
              name: string(),
              description: string()
            }),
            questions: eachLike({
              id: string(),
              text: string(),
              answers: minLike(2, {
                id: string(),
                text: string(),
                metricScores: eachLike({
                  metricId: string(),
                  score: integer()
                })
              })
            })
          })
        }
      }
    });

    // Make actual request
    const response = await api.getQuiz('quiz-1');
    expect(response).toBeDefined();
  });
});
```

## 4. End-to-End (E2E) Tests

### Purpose
Test complete user workflows from browser to database and back.

### Tool: Playwright

```bash
npm install -D @playwright/test
```

### Test Scenarios

#### User Journey: Taking a Quiz

```typescript
import { test, expect } from '@playwright/test';

test.describe('Quiz Taking Flow', () => {
  test('user can complete a quiz and see results', async ({ page }) => {
    // Navigate to quiz list
    await page.goto('http://localhost:8100');

    // Should see quizzes
    await expect(page.locator('.quiz-list')).toBeVisible();

    // Click "Start" on first quiz
    await page.click('text=Start');

    // Should see first question
    await expect(page.locator('.question-text')).toBeVisible();

    // Answer all questions
    const questionCount = 10;
    for (let i = 0; i < questionCount; i++) {
      // Select first answer
      await page.click('[role="radio"] >> nth=0');

      // Click next (or submit on last question)
      if (i < questionCount - 1) {
        await page.click('text=Next');
      } else {
        await page.click('text=Submit');
      }
    }

    // Should see results page
    await expect(page).toHaveURL(/\/results\//);
    await expect(page.locator('.results-title')).toContainText('Results');

    // Should show metric scores
    const metrics = page.locator('.metric-card');
    await expect(metrics).toHaveCount(5); // 5 wellbeing metrics

    // Each metric should show percentage
    for (let i = 0; i < 5; i++) {
      await expect(metrics.nth(i)).toContainText('%');
    }
  });
});
```

#### Admin Journey: Creating a Quiz

```typescript
test.describe('Quiz Creation Flow', () => {
  test('admin can create a new quiz', async ({ page }) => {
    await page.goto('http://localhost:8100/admin');

    // Click create quiz
    await page.click('text=Create Quiz');

    // Fill quiz details
    await page.fill('[placeholder="Enter quiz title"]', 'Test Quiz');
    await page.fill('[placeholder="Enter quiz description"]', 'A test quiz');

    // Add metric
    await page.click('text=Add Metric');
    await page.fill('[placeholder*="Metric Name"] >> nth=0', 'Health');
    await page.fill('[placeholder*="description"] >> nth=0', 'Physical health');

    // Add question
    await page.click('text=Add Question');
    await page.fill('[placeholder="Enter your question"]', 'How are you?');

    // Add answers
    await page.click('text=Add Answer >> nth=0');
    await page.fill('[placeholder="Enter answer"] >> nth=0', 'Good');

    await page.click('text=Add Answer >> nth=1');
    await page.fill('[placeholder="Enter answer"] >> nth=1', 'Bad');

    // Set metric scores
    await page.click('[aria-label*="Health"] >> nth=0');
    // Drag slider or click value

    // Save quiz
    await page.click('text=Save');

    // Should navigate back to admin list
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('.quiz-list')).toContainText('Test Quiz');
  });
});
```

### Running E2E Tests

```bash
# Install browsers
npx playwright install

# Run tests
npm run test:e2e

# Run in UI mode
npx playwright test --ui

# Run specific test
npx playwright test quiz-taking.spec.ts
```

## 5. Test Data Management

### Test Fixtures

Create reusable test data:

```typescript
// backend/src/__tests__/fixtures/quiz.fixtures.ts
export function createMockQuiz(overrides?: Partial<Quiz>): Quiz {
  return {
    id: 'test-quiz-1',
    title: 'Test Quiz',
    description: 'A test quiz',
    metrics: [
      { id: 'm1', name: 'Metric 1', description: 'Test metric' }
    ],
    questions: [
      {
        id: 'q1',
        text: 'Question 1?',
        answers: [
          {
            id: 'a1',
            text: 'Answer 1',
            metricScores: [{ metricId: 'm1', score: 5 }]
          },
          {
            id: 'a2',
            text: 'Answer 2',
            metricScores: [{ metricId: 'm1', score: 3 }]
          }
        ]
      }
    ],
    ...overrides
  };
}

export function createMockResponse(quizId: string): QuizResponse {
  return {
    quizId,
    answers: [
      { questionId: 'q1', answerId: 'a1' }
    ]
  };
}
```

### Test Database

For integration tests:

```typescript
// Option 1: In-memory database
const testRepo = new InMemoryQuizRepository();

// Option 2: Real database with test data
beforeEach(async () => {
  await db.migrate.latest();
  await db.seed.run();
});

afterEach(async () => {
  await db.migrate.rollback();
});
```

## 6. Mock Implementations

### Repository Mocks

```typescript
export function createMockQuizRepository(): jest.Mocked<IQuizRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn()
  };
}
```

### Service Mocks

```typescript
export function createMockQuizService(): jest.Mocked<QuizService> {
  return {
    getQuiz: jest.fn(),
    getAllQuizzes: jest.fn(),
    createQuiz: jest.fn(),
    updateQuiz: jest.fn(),
    deleteQuiz: jest.fn(),
    submitQuizResponse: jest.fn(),
    calculateResults: jest.fn(),
    validateQuizResponse: jest.fn()
  } as any;
}
```

## 7. CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run shared tests
        run: npm run test:shared

      - name: Run backend unit tests
        run: npm run test --workspace=backend

      - name: Run integration tests
        run: npm run test:integration --workspace=backend

      - name: Run frontend tests
        run: npm run test --workspace=frontend

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 8. Test Commands Summary

```bash
# Workspace root
npm test                    # Run all tests
npm run test:shared         # Test shared package
npm run test:backend        # Test backend
npm run test:frontend       # Test frontend

# Backend specific
cd backend
npm test                    # Unit tests
npm run test:watch          # Watch mode
npm run test:integration    # Integration tests
npm test -- --coverage      # With coverage

# Shared package
cd shared
npm test                    # Schema validation tests

# E2E tests
npm run test:e2e            # Run all E2E tests
npx playwright test --ui    # Interactive mode
```

## 9. Best Practices

### Test Structure (AAA Pattern)

```typescript
it('should do something', () => {
  // Arrange: Set up test data
  const quiz = createMockQuiz();
  const mockRepo = createMockQuizRepository();
  mockRepo.findById.mockResolvedValue(quiz);

  // Act: Execute the code under test
  const result = await service.getQuiz('quiz-1');

  // Assert: Verify the outcome
  expect(result).toEqual(quiz);
  expect(mockRepo.findById).toHaveBeenCalledWith('quiz-1');
});
```

### Test Naming

- Use descriptive names: `should return quiz when ID exists`
- Include context: `when user is not authenticated, should return 401`
- Be specific: `should calculate percentage as (score/maxScore)*100`

### Test Independence

- Each test should be able to run independently
- Use `beforeEach` to reset state
- Don't rely on test execution order

### Test Coverage Goals

- **Critical Paths**: 100% coverage
- **Business Logic**: 90%+ coverage
- **Simple CRUD**: 75%+ coverage
- **UI Components**: 70%+ coverage

## 10. Adding New Tests

When adding new features, always add tests:

1. **Write test first** (TDD approach recommended)
2. **Test happy path** (success cases)
3. **Test error cases** (validation, not found, conflicts)
4. **Test edge cases** (empty, null, boundary values)
5. **Test integration** (how it works with other components)
6. **Update E2E tests** (if user-facing changes)

## Conclusion

This comprehensive testing strategy ensures:
- ✅ Code quality and reliability
- ✅ Confidence in refactoring
- ✅ Early bug detection
- ✅ Living documentation
- ✅ Professional development practices
