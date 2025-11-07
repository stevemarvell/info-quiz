# Testing Strategy

This document describes the testing setup and available tests for the Quiz Metrics Scoring Application.

## Test Coverage Overview

The application has three layers of testing:

### 1. ✅ **Backend Unit & Integration Tests** (Fully Implemented)
- **Location**: `backend/src/__tests__/`
- **Framework**: Jest
- **Coverage**: 75% statements, 59% branches
- **Status**: **Production Ready**

**Test Files**:
- `routes.test.ts` - API endpoint integration tests (39 tests)
- `QuizService.test.ts` - Business logic unit tests (6 tests)
- `sanitization.test.ts` - XSS prevention tests (8 tests)
- `store.test.ts` - Data store tests

**Run Tests**:
```bash
npm run test:backend
```

---

### 2. ⚠️ **Frontend Component Tests** (Infrastructure Ready)
- **Location**: `frontend/src/pages/__tests__/`
- **Framework**: Vitest + React Testing Library
- **Status**: **Test Infrastructure Ready, Smoke Tests Passing**

**Test Files Created**:
- `Home.test.tsx` - Home page component tests  
- `TakeQuiz.test.tsx` - Quiz taking flow tests
- `AdminQuizCreate.test.tsx` - Quiz creation form tests
- `smoke.test.tsx` - Basic smoke tests ✅ (passing)

**Run Tests**:
```bash
# Smoke tests (currently passing)
npm run test:frontend -- smoke.test

# With UI
npm run test:frontend -- --ui
```

---

### 3. 📝 **E2E Tests** (Ready for Execution)
- **Location**: `e2e/`
- **Framework**: Playwright
- **Status**: **Ready to Run**

**Test Files Created**:
- `quiz-creation.spec.ts` - Admin creates quiz flow (3 tests)
- `quiz-taking.spec.ts` - User takes quiz flow (5 tests)
- `quiz-editing.spec.ts` - Admin edits quiz flow (5 tests)

**Run Tests**:
```bash
npm run test:e2e
```

---

## Test Commands Summary

```bash
# Backend tests (✅ working)
npm run test:backend

# Frontend smoke tests (✅ working)
npm run test:frontend -- smoke.test

# E2E tests (📝 ready)
npm run test:e2e

# All workspace tests
npm test
```
