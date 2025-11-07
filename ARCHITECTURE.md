# Architecture Overview

## System Design Principles

This application follows professional enterprise patterns and best practices:

- **Repository Pattern**: Data access abstracted through repository interfaces
- **Dependency Injection**: Services receive dependencies via constructor injection
- **Type Safety**: Shared Zod schemas ensure runtime and compile-time type safety
- **Clean Architecture**: Clear separation of concerns (repositories, services, controllers)
- **SOLID Principles**: Single responsibility, interface segregation, dependency inversion

## Project Structure

```
info-quiz/
├── shared/                    # Shared types, schemas, and validators
│   ├── src/
│   │   ├── schemas.ts        # Zod validation schemas
│   │   ├── types.ts          # TypeScript types (derived from schemas)
│   │   ├── validators.ts     # Business logic validators
│   │   └── index.ts          # Public exports
│   └── package.json
├── backend/                   # Node.js/Express backend
│   ├── src/
│   │   ├── repositories/     # Data access layer
│   │   │   ├── IQuizRepository.ts
│   │   │   ├── IQuizResponseRepository.ts
│   │   │   ├── InMemoryQuizRepository.ts
│   │   │   └── InMemoryQuizResponseRepository.ts
│   │   ├── services/         # Business logic layer
│   │   │   └── QuizService.ts
│   │   ├── middleware/       # Express middleware
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── utils/            # Utilities
│   │   │   └── logger.ts
│   │   ├── __tests__/        # Tests
│   │   ├── routes.ts         # API routes
│   │   ├── server.ts         # Application entry point
│   │   └── sampleData.ts     # Sample quiz data
│   └── package.json
└── frontend/                  # Ionic React frontend
    ├── src/
    │   ├── pages/            # React page components
    │   ├── services/         # API client services
    │   └── types.ts          # Frontend types
    └── package.json
```

## Layer Responsibilities

### Shared Package (@quiz-app/shared)

**Purpose**: Single source of truth for all data structures and validation logic

- **Schemas (schemas.ts)**: Zod schemas that define the structure and validation rules
- **Types (types.ts)**: TypeScript types automatically derived from Zod schemas
- **Validators (validators.ts)**: Business logic validation (consistency checks, relationships)

**Benefits**:
- Type safety across frontend and backend
- Runtime validation
- Consistent error messages
- Reduced code duplication

### Backend

#### Repositories Layer

**Purpose**: Abstract data access, enabling easy database swapping

Interfaces:
- `IQuizRepository`: CRUD operations for quizzes
- `IQuizResponseRepository`: Store and retrieve quiz responses and results

Current Implementation:
- `InMemoryQuizRepository`: In-memory storage
- `InMemoryQuizResponseRepository`: In-memory storage

**Future Implementations**:
- `PostgresQuizRepository`
- `MongoDBQuizRepository`

#### Services Layer

**Purpose**: Business logic and orchestration

`QuizService`:
- Coordinates between repositories
- Implements business logic (score calculation, validation)
- Enforces business rules
- Transaction management (when using real databases)

#### Routes Layer

**Purpose**: HTTP request handling

- Validates requests using Zod schemas
- Calls appropriate service methods
- Formats responses
- Error handling

#### Middleware

- `errorHandler`: Centralized error handling with appropriate HTTP status codes
- `validation`: Request validation using Zod schemas
- Security: Helmet, CORS, rate limiting

## Data Flow

### Creating a Quiz

```
Client Request
    ↓
Route Handler (validates with QuizSchema)
    ↓
QuizService.createQuiz()
    ├─→ Validator.validateQuizConsistency()
    └─→ QuizRepository.create()
        ↓
Database (or in-memory store)
    ↓
Response back through layers
```

### Submitting Quiz Response

```
Client Request
    ↓
Route Handler (validates with QuizResponseSchema)
    ↓
QuizService.submitQuizResponse()
    ├─→ QuizRepository.findById()
    ├─→ Validator.validateQuizResponse()
    ├─→ QuizService.calculateResults()
    └─→ QuizResponseRepository.save()
        ↓
Result returned to client
```

## Type Safety Strategy

### Compile-Time Safety

TypeScript ensures type correctness at development time:

```typescript
// Types are inferred from Zod schemas
type Quiz = z.infer<typeof QuizSchema>;

// Compiler catches type errors
const quiz: Quiz = {
  // Must match schema structure
};
```

### Runtime Safety

Zod validates data at runtime:

```typescript
// Validates incoming request data
const result = QuizSchema.parse(req.body);
// Throws ZodError if invalid
```

### Validation Layers

1. **Schema Validation** (Zod): Structure, types, ranges
2. **Business Logic Validation**: Consistency, relationships
3. **Database Constraints**: Uniqueness, foreign keys (when using DB)

## Dependency Injection

### Why DI?

- **Testability**: Easy to inject mocks/stubs
- **Flexibility**: Swap implementations without changing consumers
- **Decoupling**: Components depend on abstractions, not implementations

### Implementation

```typescript
// Define interface
interface IQuizRepository {
  findById(id: string): Promise<Quiz | null>;
  // ...
}

// Service depends on interface
class QuizService {
  constructor(
    private readonly quizRepository: IQuizRepository,
    private readonly responseRepository: IQuizResponseRepository
  ) {}
}

// Inject concrete implementation
const repo = new InMemoryQuizRepository();
const responseRepo = new InMemoryQuizResponseRepository();
const service = new QuizService(repo, responseRepo);
```

### Testing with DI

```typescript
// Easy to inject mocks for testing
const mockRepo: IQuizRepository = {
  findById: jest.fn().mockResolvedValue(mockQuiz),
  // ...
};

const service = new QuizService(mockRepo, mockResponseRepo);
// Test service without real database
```

## Security Considerations

### Current Implementation

- **Helmet**: Sets security headers
- **CORS**: Configured for specific origins
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All inputs validated with Zod
- **Error Handling**: Doesn't leak sensitive information

### Production Recommendations

- Enable HTTPS
- Add authentication (JWT, OAuth)
- Add authorization (role-based access control)
- Implement API key management
- Add request signing
- Enable audit logging
- Add CSRF protection
- Implement API versioning

## Scalability Considerations

### Current Architecture Supports

- **Horizontal Scaling**: Stateless design
- **Database Scaling**: Repository pattern allows DB optimization
- **Caching**: Can add Redis caching layer in repositories
- **Microservices**: Clean separation allows splitting into services

### Migration Path

1. **Add Database**: Implement `PostgresQuizRepository`
2. **Add Caching**: Decorator pattern around repositories
3. **Add Queue**: For async quiz processing
4. **Split Services**: Separate quiz management from quiz-taking

## Monitoring and Observability

### Logging

Winston logger with multiple transports:
- Console (development)
- File (production)
- Future: CloudWatch, DataDog, etc.

### Metrics (Future)

- Response times
- Error rates
- Quiz completion rates
- Database query performance

### Health Checks

`/health` endpoint provides:
- Status
- Uptime
- Environment
- Future: Database connectivity, dependency health

## Error Handling

### Error Hierarchy

```
Error
  ├─→ AppError (known business errors)
  │     ├─→ 400 Validation errors
  │     ├─→ 404 Not found errors
  │     └─→ 409 Conflict errors
  ├─→ ZodError (schema validation)
  └─→ Unknown errors (500)
```

### Error Response Format

```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Human-readable message",
  "details": {} // Optional, for validation errors
}
```

## Database Migration Strategy

When moving from in-memory to real database:

1. **Keep Interfaces**: Repository interfaces stay the same
2. **Implement New Repository**: `PostgresQuizRepository implements IQuizRepository`
3. **Update DI Configuration**: Change which implementation is injected
4. **Add Migrations**: Database schema versioning
5. **No Service Changes**: Services unchanged due to DI

Example:

```typescript
// Before
const repo = new InMemoryQuizRepository();

// After
const repo = new PostgresQuizRepository(dbConnection);

// Services don't change!
const service = new QuizService(repo, responseRepo);
```
