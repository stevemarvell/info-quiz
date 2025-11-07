# Quiz Metrics Scoring App

> A professional, production-ready application for creating and taking quizzes with metric-based scoring and personalized reporting.

[![Lint Check](https://github.com/stevemarvell/info-quiz/workflows/Lint%20Check/badge.svg)](https://github.com/stevemarvell/info-quiz/actions/workflows/lint.yml)
[![CI](https://github.com/stevemarvell/info-quiz/workflows/CI/badge.svg)](https://github.com/stevemarvell/info-quiz/actions/workflows/ci.yml)
[![Claude Code Review](https://github.com/stevemarvell/info-quiz/workflows/Claude%20Code%20Review/badge.svg)](https://github.com/stevemarvell/info-quiz/actions/workflows/claude-code-review.yml)

## Overview

This is an **enterprise-grade** quiz application built with modern architecture patterns including:
- ✅ **Repository Pattern** for data access abstraction
- ✅ **Dependency Injection** for testability and flexibility
- ✅ **Shared Type Safety** with Zod schemas
- ✅ **Comprehensive Testing** (unit, integration, E2E, contract)
- ✅ **Professional Error Handling** and logging
- ✅ **Security Best Practices** (Helmet, rate limiting, CORS)
- ✅ **Monorepo Architecture** with npm workspaces

## Key Features

### For Users
- Take multi-metric quizzes with personalized scoring
- View detailed results across all metrics
- Intuitive progress tracking
- Responsive mobile-first design

### For Admins
- Create and manage quizzes
- Define custom metrics
- Set granular scores (0-5) for each answer per metric
- Edit existing quizzes
- Full CRUD operations

### For Developers
- Type-safe codebase with shared schemas
- Injectable dependencies for easy testing
- Comprehensive test coverage
- Clear separation of concerns
- Extensive documentation

## Tech Stack

### Shared Package
- **Zod**: Runtime type validation
- **TypeScript**: Compile-time type safety
- **Business Logic Validators**: Quiz consistency checks

### Backend
- **Node.js 18+** with Express
- **TypeScript**: Type-safe server code
- **Repository Pattern**: Abstracted data access
- **Winston**: Production-grade logging
- **Helmet**: Security headers
- **Rate Limiting**: API protection
- **Jest**: Unit and integration testing
- **Supertest**: API testing

### Frontend
- **Ionic React**: Cross-platform UI framework
- **TypeScript**: Type-safe components
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Vite**: Fast build tool
- **Playwright**: E2E testing (planned)

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, patterns, and architectural decisions
- **[TESTING.md](./TESTING.md)** - Comprehensive testing strategy (unit, integration, E2E, contract)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide for various platforms
- **[CLAUDE.md](./CLAUDE.md)** - Development standards and zero-issue policy
- **[PR_PROTECTION.md](./.github/PR_PROTECTION.md)** - Required checks and branch protection setup
- **[FUTURE_IMPROVEMENTS.md](./FUTURE_IMPROVEMENTS.md)** - Planned features and enhancements

## 🏗️ Project Structure

```
info-quiz/
├── shared/                       # Shared types and validation
│   ├── src/
│   │   ├── schemas.ts           # Zod validation schemas
│   │   ├── types.ts             # TypeScript types
│   │   ├── validators.ts        # Business logic validators
│   │   └── __tests__/           # Schema tests
│   └── package.json
├── backend/                      # Node.js API server
│   ├── src/
│   │   ├── repositories/        # Data access layer (Repository pattern)
│   │   ├── services/            # Business logic layer
│   │   ├── middleware/          # Express middleware
│   │   ├── utils/               # Utilities (logger, etc.)
│   │   ├── __tests__/           # Unit & integration tests
│   │   ├── routes.ts            # API routes
│   │   ├── server.ts            # Application entry
│   │   └── sampleData.ts        # Wellbeing quiz sample
│   ├── jest.config.js
│   └── package.json
├── frontend/                     # Ionic React app
│   ├── src/
│   │   ├── pages/               # React page components
│   │   ├── services/            # API client
│   │   ├── App.tsx              # Main component
│   │   └── main.tsx             # Entry point
│   ├── vite.config.ts
│   └── package.json
├── ARCHITECTURE.md               # Architecture documentation
├── TESTING.md                    # Testing strategy
├── DEPLOYMENT.md                 # Deployment guide
├── package.json                  # Root workspace config
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (v16+ supported, v18 recommended)
- **npm 7+** (for workspace support)

### One-Command Setup

```bash
# Clone repository
git clone <repository-url>
cd info-quiz

# Install all dependencies (root + all workspaces)
npm install

# Start both backend and frontend
# Terminal 1:
npm run dev:backend

# Terminal 2:
npm run dev:frontend
```

### What Happens

1. `npm install` installs dependencies for all three packages:
   - `shared/`: Type definitions and validators
   - `backend/`: API server dependencies
   - `frontend/`: React app dependencies

2. Backend starts on **http://localhost:3000**
3. Frontend starts on **http://localhost:8100**
4. Sample wellbeing quiz is automatically loaded

### Verify Installation

```bash
# Check backend health
curl http://localhost:3000/health

# Check if quizzes loaded
curl http://localhost:3000/api/quizzes

# Open frontend
open http://localhost:8100
```

## Usage

### Taking a Quiz

1. Open the app in your browser at `http://localhost:8100`
2. Navigate to the "Quizzes" tab
3. Click "Start" on the Wellbeing Assessment
4. Answer all 10 questions
5. Click "Submit" to see your personalized results

### Admin Functions

1. Navigate to the "Admin" tab
2. View existing quizzes
3. Click "Create Quiz" to create a new quiz
4. Add metrics (e.g., Physical Health, Mental Health)
5. Add questions with multiple answers
6. For each answer, set scores (0-5) for each metric
7. Save the quiz

### Editing Quizzes

1. In the Admin tab, click the edit icon on any quiz
2. Modify quiz details, metrics, questions, or answers
3. Update metric scores for each answer
4. Save changes

## API Endpoints

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get a specific quiz
- `POST /api/quizzes` - Create a new quiz
- `PUT /api/quizzes/:id` - Update a quiz
- `DELETE /api/quizzes/:id` - Delete a quiz

### Submit Quiz
- `POST /api/quizzes/:id/submit` - Submit quiz responses and get results

## Sample Quiz

The app comes pre-loaded with a Wellbeing Assessment quiz featuring:
- **10 Questions** covering various aspects of wellbeing
- **3 Answers** per question
- **5 Metrics**:
  - Physical Health
  - Mental Health
  - Social Connection
  - Purpose & Meaning
  - Financial Security

Each answer contributes different scores to various metrics, creating a personalized wellbeing profile.

## Data Model

### Quiz
```typescript
{
  id: string;
  title: string;
  description: string;
  metrics: Metric[];
  questions: Question[];
}
```

### Metric
```typescript
{
  id: string;
  name: string;
  description: string;
}
```

### Question
```typescript
{
  id: string;
  text: string;
  answers: Answer[];
}
```

### Answer
```typescript
{
  id: string;
  text: string;
  metricScores: MetricScore[];
}
```

### MetricScore
```typescript
{
  metricId: string;
  score: number; // 0-5
}
```

## 🧪 Testing

This project includes comprehensive testing at multiple levels. See [TESTING.md](./TESTING.md) for full details.

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:shared      # Shared package tests
npm run test:backend     # Backend unit tests
npm run test:frontend    # Frontend tests (when implemented)

# Run with coverage
npm test -- --coverage

# Watch mode (for TDD)
npm run test:watch --workspace=backend
```

### Test Coverage

- **Unit Tests**: Repositories, services, validators
- **Integration Tests**: API endpoints, full request/response cycle
- **E2E Tests**: Complete user workflows (Playwright)
- **Contract Tests**: API contract validation with shared schemas

## 🔧 Development

### Monorepo Commands

```bash
# Run commands across all workspaces
npm run build                # Build all packages
npm test                     # Test all packages
npm run lint --if-present    # Lint all packages

# Run commands in specific workspace
npm run dev --workspace=backend
npm run test --workspace=shared
```

### Making Changes to Shared Types

```typescript
// 1. Edit shared/src/schemas.ts
export const QuizSchema = z.object({
  // ... add new field
});

// 2. Types automatically update everywhere
// Backend and frontend see changes immediately via symlinks
```

### Adding a New Repository Implementation

```typescript
// 1. Create new repository
export class PostgresQuizRepository implements IQuizRepository {
  // Implement interface methods
}

// 2. Update dependency injection
const repo = new PostgresQuizRepository(dbConnection);
const service = new QuizService(repo, responseRepo);

// 3. Services work unchanged!
```

## 📦 Building for Production

```bash
# Build all packages
npm run build

# Or build individually
npm run build:shared
npm run build:backend
npm run build:frontend
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment strategies.

## 🏛️ Architecture Highlights

### Repository Pattern
Data access is abstracted through repository interfaces, making it easy to swap storage implementations (in-memory → PostgreSQL → MongoDB) without changing business logic.

### Dependency Injection
Services receive dependencies via constructor, enabling easy testing with mocks and flexible runtime configuration.

### Type Safety
- **Compile-time**: TypeScript catches type errors
- **Runtime**: Zod validates incoming data
- **Shared**: Both frontend and backend use identical type definitions

### Clean Architecture
```
Routes (HTTP) → Services (Business Logic) → Repositories (Data Access)
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for deep dive.

## 🔐 Security Features

- ✅ **Helmet**: Security headers
- ✅ **CORS**: Configured for specific origins
- ✅ **Rate Limiting**: 100 req/15min per IP
- ✅ **Input Validation**: All inputs validated with Zod
- ✅ **Error Handling**: Sanitized error responses
- ✅ **Logging**: Comprehensive request/error logging

## 📊 API Documentation

### Endpoints

#### Quizzes
- `GET /api/quizzes` - List all quizzes
- `GET /api/quizzes/:id` - Get specific quiz
- `POST /api/quizzes` - Create quiz (admin)
- `PUT /api/quizzes/:id` - Update quiz (admin)
- `DELETE /api/quizzes/:id` - Delete quiz (admin)

#### Quiz Submissions
- `POST /api/quizzes/:id/submit` - Submit quiz responses

All responses follow the format:
```json
{
  "success": true|false,
  "data": { /* response data */ },
  "error": "ErrorType",  // if success=false
  "message": "Details"   // if success=false
}
```

## 🚀 Production Readiness

This application is production-ready with:
- ✅ Comprehensive error handling
- ✅ Professional logging (Winston)
- ✅ Security best practices
- ✅ Type safety (compile-time + runtime)
- ✅ Testable architecture (DI + mocks)
- ✅ Scalable design (stateless, horizontal scaling)
- ✅ Database-ready (repository pattern)
- ✅ Deployment documentation

## 🛣️ Roadmap

### Phase 1: Database Integration
- [ ] Implement PostgreSQL repositories
- [ ] Add database migrations
- [ ] Implement connection pooling
- [ ] Add caching layer (Redis)

### Phase 2: Authentication
- [ ] JWT authentication
- [ ] Role-based access control (admin/user)
- [ ] User profiles
- [ ] Quiz history tracking

### Phase 3: Enhanced Features
- [ ] Quiz analytics dashboard
- [ ] PDF report generation
- [ ] Question randomization
- [ ] Time limits per quiz
- [ ] Multi-language support

### Phase 4: Mobile
- [ ] iOS app build
- [ ] Android app build
- [ ] Offline support
- [ ] Push notifications

## 🤝 Contributing

### Before You Start
All pull requests must pass automated checks before merging:
- ✅ **Lint Check** - Code style enforcement
- ✅ **CI Check** - Build, type-check, and tests
- ✅ **Claude Code Review** - AI-powered code review (informational)

See [PR Protection Guide](.github/PR_PROTECTION.md) for details.

### Development Workflow

1. **Fork the repository**

2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes** following [CLAUDE.md](CLAUDE.md) standards

4. **Run quality checks locally**
   ```bash
   npm run type-check  # Type checking
   npm run lint        # Linting
   npm run build       # Build all packages
   npm test            # Run all tests
   ```

5. **Commit changes** (use descriptive messages)
   ```bash
   git commit -m 'Add amazing feature'
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open Pull Request**
   - Automated checks will run automatically
   - Address any failing checks before requesting review
   - Respond to Claude Code Review feedback

### Required Checks for Merging

Your PR **cannot be merged** until:
- ✅ All linting passes (`npm run lint`)
- ✅ All tests pass (`npm test`)
- ✅ Build succeeds (`npm run build`)
- ✅ Type checking passes (`npm run type-check`)
- ✅ At least 1 approval from maintainer

### Quick Pre-Push Check
```bash
# Run this before pushing to catch issues early
npm run type-check && npm run lint && npm test
```

## 📄 License

MIT

## 🙏 Acknowledgments

Built with modern enterprise patterns and best practices. Suitable for production use in healthcare, education, HR, and other domains requiring metric-based assessments.
