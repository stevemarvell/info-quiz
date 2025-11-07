# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A professional quiz application with metric-based scoring built as a **monorepo** using npm workspaces. Two packages:
- **backend**: Node/Express API with Repository pattern and Dependency Injection
- **frontend**: Ionic React app with React Hook Form

**Note**: Shared types and schemas are duplicated in `backend/src/shared/` and `frontend/src/shared/` to enable independent deployment on platforms like Railway where each service is isolated.

## Development Standards

### Git Workflow Standards

**Branch Naming Convention:**

**For user-created branches**, use standard prefixes:
- `feat/` - New features (e.g., `feat/quiz-pagination`, `feat/user-authentication`)
- `fix/` - Bug fixes (e.g., `fix/api-endpoint-mismatch`, `fix/test-failures`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`, `chore/refactor-types`)
- `docs/` - Documentation only (e.g., `docs/api-reference`, `docs/deployment-guide`)
- `test/` - Test additions/fixes (e.g., `test/frontend-coverage`, `test/integration-tests`)

**Exception: Claude Code Automated Branches**
- Branches created by Claude Code use the `claude/` prefix followed by a session ID
- Example: `claude/code-review-legacy-backlog-011CUu8kbtdxqtBik6phwXmc`
- This is a **system requirement** for Claude Code automation
- Git push will fail with 403 error if branches don't follow this format for automated workflows
- These branches are for code review, automated fixes, and backlog generation

**Commit Message Format:**
Use conventional commit format:
```
<type>: <description>

<body (optional)>
```

Examples:
- `feat: add pagination to quiz list endpoint`
- `fix: correct API endpoint for quiz submission`
- `chore: remove defunct shared package directory`

### Consistency Standards

**CRITICAL: Maintain consistency across the codebase.**

- **Patterns**: Follow established patterns (Repository, DI, three-layer architecture) consistently
- **Naming**: Use consistent naming conventions (camelCase for variables, PascalCase for classes/types)
- **Error Handling**: Use the same error handling pattern everywhere (AppError class, asyncHandler wrapper)
- **Validation**: Always use Zod schemas for validation, both frontend and backend
- **Styling**: Follow the same code formatting rules (enforced by linters)
- **Testing**: Use consistent test patterns (AAA: Arrange, Act, Assert)
- **Documentation**: Update ALL relevant documentation when making changes

**When adding new features, ALWAYS review existing implementations first to maintain consistency.**

### Zero-Issue Policy

**CRITICAL: I don't want a single issue when you push.**

Every commit must meet these standards:

1. **Build Verification**
   - Run `npm run build` - ALL packages must compile without errors
   - Fix TypeScript errors immediately, never commit with build failures

2. **Test Verification**
   - Run `npm test` or `npm run test:backend`
   - All tests must pass before commit
   - Add tests for new functionality

3. **Code Quality**
   - No TypeScript `any` types without explicit justification
   - No console.log statements (use logger utility)
   - No commented-out code blocks
   - No unused imports or variables

4. **Security**
   - All user input must be validated (Zod schemas)
   - All user input must be sanitized (xss library)
   - No hardcoded secrets or credentials
   - Follow OWASP top 10 guidelines

5. **Architecture Compliance**
   - Follow established patterns (Repository, DI, three-layer)
   - When updating shared schemas, update BOTH backend/src/shared/ and frontend/src/shared/
   - Use proper error handling (try-catch, asyncHandler)
   - Add proper TypeScript types to all functions

6. **Documentation**
   - Update API_DOCUMENTATION.md for API changes
   - Add JSDoc comments for complex functions
   - Update CLAUDE.md if adding new patterns

### Pre-Commit Checklist

Before every commit, verify:
- [ ] `npm run build` succeeds (all packages)
- [ ] `npm test` passes (or relevant workspace tests)
- [ ] `npm run lint` shows no errors
- [ ] No TypeScript errors in IDE
- [ ] All new code has proper types
- [ ] User inputs are validated and sanitized
- [ ] Tests added for new functionality
- [ ] No debug code or console.logs
- [ ] If updating schemas, both backend/src/shared/ and frontend/src/shared/ are updated

**If ANY check fails, DO NOT COMMIT. Fix the issues first.**

## Development Commands

### Running the App
```bash
# Install all dependencies (run from root)
npm install --legacy-peer-deps

# Start backend (Terminal 1)
npm run dev:backend         # Runs on http://localhost:3000

# Start frontend (Terminal 2)
npm run dev:frontend        # Runs on http://localhost:8100
```

### Building
```bash
# Build all packages
npm run build

# Build specific package
npm run build:backend
npm run build:frontend

# Build manually with workspace syntax
npm run build --workspace=backend
```

### Testing
```bash
# Run all tests across workspaces
npm test

# Test specific workspace
npm run test:backend
npm run test:frontend

# Watch mode for TDD
npm run test:watch --workspace=backend

# Run with coverage
npm run test:backend

# Run integration tests only (backend)
npm run test:integration --workspace=backend

# Run E2E tests (frontend)
npm run test:e2e
```

### Type Checking and Linting
```bash
# Type check all packages
npm run type-check

# Lint all packages
npm run lint

# Lint specific workspace
npm run lint --workspace=backend
```

## Critical Architecture Patterns

### 1. Shared Types and Schemas

**Zod schemas** are the single source of truth for types and runtime validation:

```typescript
// backend/src/shared/schemas.ts or frontend/src/shared/schemas.ts
export const QuizSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  // ...
});

// backend/src/shared/types.ts or frontend/src/shared/types.ts
export type Quiz = z.infer<typeof QuizSchema>;
```

**IMPORTANT - Controlled Duplication Strategy:**

Shared code is **intentionally duplicated** in both `backend/src/shared/` and `frontend/src/shared/` because Railway deploys each service independently from its own root directory. Each service must be completely self-contained with no cross-workspace dependencies.

**Why Duplication is Required:**
- Railway builds backend from `/backend` directory only (no access to root or frontend)
- Railway builds frontend from `/frontend` directory only (no access to root or backend)
- Using npm workspace references (`@quiz-app/shared`) would fail in Railway's isolated build environment
- This is a **deployment constraint**, not a development preference

**Duplication Management Workflow:**

When updating shared types/schemas, you **MUST** update both locations:

1. **Edit Backend First**: Update `/backend/src/shared/schemas.ts`
2. **Copy to Frontend**: Update `/frontend/src/shared/schemas.ts` with identical changes
3. **Verify Consistency**: Run `npm run build` to ensure both compile
4. **Run Tests**: Ensure tests pass in both packages

**Files That Must Be Kept in Sync:**
- `backend/src/shared/schemas.ts` ↔ `frontend/src/shared/schemas.ts`
- `backend/src/shared/validators.ts` ↔ `frontend/src/shared/validators.ts` (if frontend needs validators)
- `backend/src/shared/types.ts` ↔ `frontend/src/shared/types.ts`

**Checking for Drift:**
```bash
# Compare files to ensure they're in sync
diff backend/src/shared/schemas.ts frontend/src/shared/schemas.ts

# Should show no differences (or only expected environment-specific differences)
```

**Alternative Considered (Not Used):**
- ❌ Using npm workspace `@quiz-app/shared` package - Breaks Railway deployment
- ✅ Current approach: Controlled duplication with strict sync process

### 2. Repository Pattern (Backend)

Data access is abstracted through interfaces:

```typescript
// backend/src/repositories/IQuizRepository.ts
export interface IQuizRepository {
  findAll(): Promise<Quiz[]>;
  findById(id: string): Promise<Quiz | null>;
  create(quiz: Quiz): Promise<Quiz>;
  update(id: string, quiz: Quiz): Promise<Quiz | null>;
  delete(id: string): Promise<boolean>;
}
```

**Current implementation**: `InMemoryQuizRepository`
**Future implementations**: `PostgresQuizRepository`, `MongoDBQuizRepository`

**Why this matters**: You can swap storage implementations without changing any business logic in services or routes.

### 3. Dependency Injection (Backend)

Services receive dependencies via constructor:

```typescript
// backend/src/services/QuizService.ts
export class QuizService {
  constructor(
    private readonly quizRepository: IQuizRepository,
    private readonly responseRepository: IQuizResponseRepository
  ) {}
}

// backend/src/server.ts
const quizRepository = new InMemoryQuizRepository();
const responseRepository = new InMemoryQuizResponseRepository();
const quizService = new QuizService(quizRepository, responseRepository);
```

**Why this matters**:
- Easy to test with mocks: `new QuizService(mockRepo, mockResponseRepo)`
- Runtime configuration: swap implementations based on env
- Clear dependencies visible in constructor

### 4. Three-Layer Architecture (Backend)

```
Routes (HTTP) → Services (Business Logic) → Repositories (Data Access)
```

**Routes** (`routes.ts`):
- Handle HTTP requests/responses
- Validate input with Zod middleware
- Call service methods
- Return standardized responses: `{ success: true, data: T }` or `{ success: false, error, message }`

**Services** (`services/QuizService.ts`):
- Business logic and orchestration
- Score calculation
- Cross-repository operations
- Enforce business rules

**Repositories** (`repositories/`):
- CRUD operations only
- No business logic
- Interface-based for swappability

### 5. Form Handling (Frontend)

Uses **React Hook Form** with Zod resolver:

```typescript
const { register, control, handleSubmit, formState: { errors } } = useForm<Quiz>({
  resolver: zodResolver(QuizSchema),  // Automatic validation!
  defaultValues: { /* ... */ }
});

// Dynamic fields for metrics, questions, answers
const { fields, append, remove } = useFieldArray({ control, name: 'metrics' });
```

**Pattern**: All admin forms (create/edit) use this pattern. See `AdminQuizCreate.tsx` and `AdminQuizEdit.tsx`.

## Key Files and Their Roles

### Configuration and Constants

- **`backend/src/config/env.ts`**: Environment variable validation with Zod (validates on startup)
- **`backend/src/config/constants.ts`**: All magic numbers (SCORING, RATE_LIMITS, TIMEOUTS)
- **`backend/src/middleware/sanitization.ts`**: XSS prevention (removes scripts, event handlers)
- **`backend/src/middleware/errorHandler.ts`**: Centralized error handling with production/dev modes

### Shared Code (Duplicated)

- **`backend/src/shared/schemas.ts`**: Zod schemas for backend
- **`backend/src/shared/validators.ts`**: Business logic validators
- **`frontend/src/shared/schemas.ts`**: Zod schemas for frontend (same as backend)
- **`frontend/src/shared/types.ts`**: TypeScript types derived from schemas

### Core Business Logic

- **`backend/src/services/QuizService.ts`**: Score calculation, response validation
- **`backend/src/sampleData.ts`**: Pre-loaded wellbeing quiz with 10 questions

### Testing

- **`backend/src/__tests__/routes.test.ts`**: Integration tests (full HTTP request/response)
- **`backend/src/__tests__/sanitization.test.ts`**: Unit tests for XSS prevention
- **`frontend/src/pages/__tests__/smoke.test.tsx`**: Basic rendering tests

## Common Workflows

### Adding a New API Endpoint

1. Define types in `backend/src/shared/schemas.ts` if needed
2. If frontend needs the types, copy to `frontend/src/shared/schemas.ts`
3. Add service method in `QuizService` (business logic)
4. Add route in `backend/src/routes.ts`:
   ```typescript
   router.post('/endpoint',
     validateBody(YourSchema),  // Zod validation middleware
     asyncHandler(async (req, res) => {
       const result = await quizService.yourMethod(req.body);
       res.json({ success: true, data: result });
     })
   );
   ```
5. Add API client method in `frontend/src/services/api.ts`
6. Write integration test in `backend/src/__tests__/routes.test.ts`

### Changing Data Models

1. Edit `backend/src/shared/schemas.ts`:
   ```typescript
   export const QuizSchema = z.object({
     // ... existing fields
     newField: z.string().optional()  // Add new field
   });
   ```
2. Copy changes to `frontend/src/shared/schemas.ts` to keep in sync
3. Build both: `npm run build`
4. Update repositories if adding storage logic
5. Update services if adding business logic
6. Update frontend components if UI changes needed
7. Types automatically propagate everywhere

### Swapping Storage Implementation

1. Create new repository class implementing `IQuizRepository`:
   ```typescript
   export class PostgresQuizRepository implements IQuizRepository {
     constructor(private pool: Pool) {}
     // Implement all interface methods
   }
   ```
2. Update DI setup in `server.ts`:
   ```typescript
   const quizRepository = new PostgresQuizRepository(dbPool);
   const quizService = new QuizService(quizRepository, responseRepository);
   ```
3. Services and routes work unchanged!

### Adding Test Coverage

**Unit test** (service with mocks):
```typescript
const mockRepo = { findById: jest.fn() } as any;
const service = new QuizService(mockRepo, mockResponseRepo);
await service.getQuiz('test-id');
expect(mockRepo.findById).toHaveBeenCalledWith('test-id');
```

**Integration test** (full HTTP):
```typescript
const response = await request(app)
  .post('/api/quizzes')
  .send(validQuiz)
  .expect(201);
expect(response.body.success).toBe(true);
```

## Important Security Features

- **XSS Prevention**: All input sanitized via `sanitizeInput` middleware (removes `<script>`, event handlers, `javascript:`)
- **Rate Limiting**: Two-tier system
  - 100 req/15min for all requests
  - 30 req/15min for POST/PUT/DELETE only
- **Error Sanitization**: Production mode hides stack traces and internal details
- **Input Validation**: All requests validated with Zod before reaching business logic
- **Response Validation** (backend): Types enforced by TypeScript

## Documentation References

- **ARCHITECTURE.md**: Deep dive into design patterns and principles
- **TESTING.md**: Comprehensive testing strategy (unit, integration, E2E, contract)
- **DEPLOYMENT.md**: Production deployment guides for various platforms
- **API_DOCUMENTATION.md**: Complete API reference with examples
- **REACT_HOOK_FORM.md**: Form handling patterns and migration guide
- **MANUAL_TESTING_GUIDE.md**: Step-by-step manual testing procedures

## Production Considerations

**Not yet implemented** (documented for future):
- Authentication/Authorization (JWT/OAuth recommended)
- Database persistence (PostgreSQL/MongoDB repositories needed)
- Caching layer (Redis recommended)

**Currently using**:
- In-memory storage (data lost on restart)
- No authentication (all endpoints public)

See DEPLOYMENT.md for production deployment strategies.

## Railway Deployment

Since Railway deploys each service independently from its own directory:

- **Backend**: Builds from `/backend` directory with `npm install --legacy-peer-deps && npm run build`
- **Frontend**: Builds from `/frontend` directory with `npm install --legacy-peer-deps && npm run build`
- **Shared code**: Duplicated in each service's `src/shared/` directory

This ensures each service is completely self-contained and can build without access to other workspace packages.
