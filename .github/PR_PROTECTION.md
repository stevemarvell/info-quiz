# PR Protection & Required Checks

This document explains how to configure required checks for pull requests to prevent merging code that doesn't meet quality standards.

## Overview

The repository has automated quality checks that run on every PR:

1. **Lint Check** (`.github/workflows/lint.yml`) - Code style enforcement
2. **CI Check** (`.github/workflows/ci.yml`) - Build, type-check, and tests
3. **Claude Code Review** (`.github/workflows/claude-code-review.yml`) - AI-powered code review

## Automated Checks

### 1. Lint Check
**Status Badge**: ![Lint](https://github.com/stevemarvell/info-quiz/workflows/Lint%20Check/badge.svg)

**What it checks**:
- ESLint rules on backend code
- ESLint rules on frontend code
- ESLint rules on shared code
- Code formatting standards
- No unused variables or imports

**Runs on**:
- All PRs to `main` or `develop`
- Direct pushes to `main` or `develop`

**Jobs**:
- `Lint Backend`: Checks backend code style
- `Lint Frontend`: Checks frontend code style
- `Lint Shared`: Checks shared package code style

**Failure reasons**:
- Linting errors in any package
- Code style violations

---

### 2. CI Check
**Status Badge**: ![CI](https://github.com/stevemarvell/info-quiz/workflows/CI/badge.svg)

**What it checks**:
- TypeScript type checking (all packages)
- Build succeeds (shared → backend → frontend)
- All tests pass (39 backend + 3 frontend smoke tests)

**Runs on**:
- All PRs to `main` or `develop`
- Direct pushes to `main` or `develop`

**Failure reasons**:
- TypeScript errors
- Build failures
- Test failures
- Type errors

---

### 3. Claude Code Review
**What it does**:
- AI-powered code review
- Checks for bugs, security issues, best practices
- Posts feedback as PR comments

**Runs on**:
- All PRs when opened or updated

**Note**: This is informational only, not a blocking check

---

## Setting Up Required Checks

To make these checks **required** for merging PRs, follow these steps:

### Step 1: Navigate to Branch Protection Settings
1. Go to your GitHub repository
2. Click **Settings** → **Branches**
3. Click **Add rule** (or edit existing rule for `main` or `develop`)

### Step 2: Configure Branch Protection Rule

**Branch name pattern**: `main` (or `develop`)

**Check these options**:
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1`
  - ✅ Dismiss stale pull request approvals when new commits are pushed

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging

  **Add required status checks**:
  - ✅ `Lint Backend / Lint Backend`
  - ✅ `Lint Frontend / Lint Frontend`
  - ✅ `Lint Shared / Lint Shared`
  - ✅ `CI / Build and Test`

- ✅ **Require conversation resolution before merging**

- ✅ **Do not allow bypassing the above settings**

### Step 3: Save Changes

Click **Create** (or **Save changes**)

---

## What Happens When Checks Fail

### If Linting Fails:
```bash
❌ Lint Backend / Lint Backend — Failed
❌ Lint Frontend / Lint Frontend — Failed
```

**How to fix**:
```bash
# Run linting locally
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### If CI Fails:
```bash
❌ CI / Build and Test — Failed
```

**How to fix**:
```bash
# Run type check
npm run type-check

# Build all packages
npm run build

# Run tests
npm test
```

### If All Pass:
```bash
✅ Lint Backend / Lint Backend — Passed
✅ Lint Frontend / Lint Frontend — Passed
✅ Lint Shared / Lint Shared — Passed
✅ CI / Build and Test — Passed
```

**Merge button enabled** ✅

---

## Local Development Workflow

### Before Pushing
```bash
# 1. Type check
npm run type-check

# 2. Lint
npm run lint

# 3. Build
npm run build

# 4. Test
npm test

# If all pass, you're good to push!
git push
```

### Pre-commit Hook (Optional)

Add to `.husky/pre-commit` (requires husky):
```bash
#!/bin/sh
npm run lint
npm run type-check
```

---

## Bypassing Checks (Emergency Only)

**⚠️ Not Recommended**

If you have admin access and need to bypass checks in an emergency:

1. Go to PR page
2. Click **Merge** dropdown
3. Select **Merge without waiting for requirements to pass**

**Only use this for**:
- Critical production hotfixes
- Infrastructure emergencies
- When checks are incorrectly failing

**Always**:
- Get approval from team lead
- Document reason in PR comments
- Fix issues in follow-up PR

---

## Check Configuration Files

| Check | Workflow File | Config File |
|-------|--------------|-------------|
| Lint | `.github/workflows/lint.yml` | `backend/.eslintrc.js` |
| CI | `.github/workflows/ci.yml` | `package.json` scripts |
| Type Check | Part of CI | `tsconfig.json` (all packages) |
| Tests | Part of CI | `jest.config.js`, `vitest.config.ts` |

---

## Troubleshooting

### "Checks have not been run on this commit"

**Cause**: Workflows didn't trigger

**Fix**:
- Push a new commit: `git commit --allow-empty -m "trigger checks"`
- Or close and reopen the PR

### "Some checks were not successful"

**Cause**: One or more checks failed

**Fix**: Click **Details** next to failed check to see logs

### "Required status checks are missing"

**Cause**: Check names don't match branch protection rules

**Fix**: Update branch protection to match exact workflow names:
- `Lint Backend` (from lint.yml job)
- `Lint Frontend` (from lint.yml job)
- `Lint Shared` (from lint.yml job)
- `Build and Test` (from ci.yml job)

---

## Adding More Checks

To add a new required check:

1. Create workflow in `.github/workflows/your-check.yml`
2. Add job name to branch protection rules
3. Test on a PR before making it required

**Example**: Add E2E tests as required check
```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on:
  pull_request:
    branches: [main, develop]

jobs:
  e2e:
    name: Run E2E Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

Then add `E2E Tests / Run E2E Tests` to required checks.

---

## Best Practices

✅ **Do**:
- Keep checks fast (< 5 minutes ideal)
- Make checks deterministic (same input = same result)
- Provide clear error messages
- Auto-fix issues when possible

❌ **Don't**:
- Make optional checks required
- Have flaky tests as required checks
- Block PRs on slow checks (>15 minutes)
- Require checks that developers can't run locally

---

## Questions?

See:
- [CLAUDE.md](/CLAUDE.md) - Development standards
- [TESTING.md](/TESTING.md) - Testing guide
- [CONTRIBUTING.md](/CONTRIBUTING.md) - Contribution guide (if exists)
