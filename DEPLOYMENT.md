# Deployment Guide

## Overview

This application uses a **monorepo structure** with **npm workspaces** to manage three packages:
- `shared`: Common types and validation logic
- `backend`: Node.js/Express API server
- `frontend`: Ionic React application

The backend and frontend are deployed **separately** to different environments, but they share the types package for consistency.

## Monorepo Architecture for Separate Deployments

### How It Works

```
┌─────────────────────────────────────────┐
│          Monorepo (Development)         │
│                                         │
│  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │ shared │←─│backend │  │frontend│   │
│  └────────┘  └────┬───┘  └───┬────┘   │
│                   │           │         │
└───────────────────┼───────────┼─────────┘
                    │           │
            Build & Bundle      │
                    ↓           ↓
         ┌──────────────────────────┐
         │    Deployment Layer      │
         ├──────────┬───────────────┤
         ↓          ↓               ↓
    Backend    Frontend         Shared
    Server     CDN/Static      (bundled in)
```

### Key Concepts

1. **Development**: All three packages in one repo with shared dependencies
2. **Build**: Each package builds independently, embedding `shared` package
3. **Deployment**: Backend and frontend deploy separately to different infrastructure

## Build Strategy

### For Backend

The backend **bundles the shared package** into its build:

```bash
# During development
cd backend
npm install  # Creates symlink to ../shared

# During build
npm run build  # TypeScript compiles everything, including shared types
# Output: dist/ folder with all compiled code
```

**Result**: `backend/dist/` contains everything needed to run, no external dependencies on `shared`.

### For Frontend

The frontend also **bundles the shared package**:

```bash
# During development
cd frontend
npm install  # Creates symlink to ../shared

# During build
npm run build  # Vite bundles everything including shared
# Output: dist/ folder with static files
```

**Result**: `frontend/dist/` contains compiled JavaScript with all types bundled in.

## Development Setup

### Prerequisites

- Node.js v18+ (v16+ works but v18 recommended)
- npm v7+ (for workspaces support)

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd info-quiz

# Install all dependencies (root + all workspaces)
npm install

# This installs:
# - Root dependencies
# - shared/node_modules
# - backend/node_modules (with link to ../shared)
# - frontend/node_modules (with link to ../shared)
```

### Development Workflow

#### Option 1: Run services separately

```bash
# Terminal 1: Backend
npm run dev:backend
# Runs on http://localhost:3000

# Terminal 2: Frontend
npm run dev:frontend
# Runs on http://localhost:8100
```

#### Option 2: Run concurrently

```bash
# From root
npm install -D concurrently

# Add to root package.json scripts:
"dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""

# Then:
npm run dev
```

### Making Changes to Shared Package

When you modify `shared/`:

1. Changes are **immediately available** to backend/frontend (via symlinks)
2. TypeScript will re-compile automatically (in watch mode)
3. No need to rebuild or reinstall

```bash
# Edit shared/src/schemas.ts
# Backend and frontend automatically see changes
```

## Production Build

### Build All Packages

```bash
# From root
npm run build

# This runs:
# 1. npm run build --workspace=shared
# 2. npm run build --workspace=backend
# 3. npm run build --workspace=frontend
```

### Build Individual Packages

```bash
# Build only backend
npm run build:backend

# Build only frontend
npm run build:frontend
```

## Deployment Options

### Option 1: Container-Based Deployment (Recommended)

#### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

# Build shared package first
WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm ci
COPY shared/ ./
RUN npm run build

# Build backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
COPY --from=0 /app/shared /app/shared
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY backend/package*.json ./

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Build and run:

```bash
docker build -t quiz-backend -f backend/Dockerfile .
docker run -p 3000:3000 quiz-backend
```

#### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

# Build shared package first
WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm ci
COPY shared/ ./
RUN npm run build

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
COPY --from=0 /app/shared /app/shared
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Option 2: Platform-as-a-Service (PaaS)

#### Heroku

**Backend**:

```bash
# heroku.yml
build:
  docker:
    web: backend/Dockerfile

# Deploy
heroku container:push web -a quiz-backend
heroku container:release web -a quiz-backend
```

**Frontend**:
- Build frontend: `npm run build --workspace=frontend`
- Deploy `frontend/dist/` to Netlify/Vercel/S3+CloudFront

#### AWS Elastic Beanstalk

```bash
# Backend
cd backend
eb init
eb create quiz-backend-prod
eb deploy

# Frontend
cd frontend
npm run build
aws s3 sync dist/ s3://quiz-frontend-bucket/
```

### Option 3: Traditional Server Deployment

#### Backend

```bash
# On server
git clone <repo>
cd info-quiz
npm install
npm run build:backend

# Start with PM2
pm2 start backend/dist/server.js --name quiz-backend
pm2 save
pm2 startup
```

#### Frontend

```bash
# Build locally or on server
npm run build:frontend

# Copy to web server
scp -r frontend/dist/* user@server:/var/www/quiz-frontend/

# Configure nginx
server {
  listen 80;
  server_name quiz.example.com;
  root /var/www/quiz-frontend;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### Option 4: Serverless

#### Backend (AWS Lambda)

```bash
# Install serverless framework
npm install -g serverless

# backend/serverless.yml
service: quiz-backend

provider:
  name: aws
  runtime: nodejs18.x

functions:
  api:
    handler: dist/lambda.handler
    events:
      - httpApi: '*'
```

```typescript
// backend/src/lambda.ts
import serverless from 'serverless-http';
import { app } from './server';

export const handler = serverless(app);
```

#### Frontend (Netlify/Vercel)

```bash
# netlify.toml
[build]
  command = "npm run build --workspace=frontend"
  publish = "frontend/dist"

# Deploy
netlify deploy --prod
```

## Environment Variables

### Backend (.env)

```bash
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://quiz-frontend.example.com
LOG_LEVEL=info

# Database (when you add one)
DATABASE_URL=postgresql://user:pass@host:5432/quizdb

# External services
REDIS_URL=redis://host:6379
```

### Frontend (.env)

```bash
VITE_API_URL=https://api.quiz.example.com
VITE_ENV=production
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          context: .
          file: backend/Dockerfile
          push: true
          tags: registry.example.com/quiz-backend:latest

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:frontend
      - uses: actions/upload-artifact@v3
        with:
          name: frontend-dist
          path: frontend/dist/
      - name: Deploy to S3
        run: |
          aws s3 sync frontend/dist/ s3://quiz-frontend/
          aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

## Database Migration for Production

When moving from in-memory to real database:

### 1. Add Database Dependencies

```bash
cd backend
npm install pg  # PostgreSQL
# or
npm install mongodb  # MongoDB
```

### 2. Implement Database Repository

```typescript
// backend/src/repositories/PostgresQuizRepository.ts
import { Pool } from 'pg';
import { IQuizRepository } from './IQuizRepository';

export class PostgresQuizRepository implements IQuizRepository {
  constructor(private pool: Pool) {}

  async findById(id: string): Promise<Quiz | null> {
    const result = await this.pool.query(
      'SELECT * FROM quizzes WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // ... implement other methods
}
```

### 3. Update Dependency Injection

```typescript
// server.ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const quizRepository = new PostgresQuizRepository(pool);
// Rest stays the same!
```

### 4. Add Migrations

```bash
npm install knex

# Create migration
npx knex migrate:make create_quizzes_table

# Run migrations
npx knex migrate:latest
```

## Scaling Considerations

### Horizontal Scaling

Both backend and frontend can scale horizontally:

**Backend**:
- Run multiple instances behind load balancer
- Stateless design supports this
- Use Redis for shared session state (if needed)

**Frontend**:
- Served from CDN (already globally distributed)
- Unlimited scaling

### Database Scaling

When using real database:
- Read replicas for read-heavy workloads
- Connection pooling
- Query optimization
- Caching layer (Redis)

### Caching Strategy

```typescript
// Add caching layer in repository
export class CachedQuizRepository implements IQuizRepository {
  constructor(
    private baseRepo: IQuizRepository,
    private cache: Redis
  ) {}

  async findById(id: string): Promise<Quiz | null> {
    // Try cache first
    const cached = await this.cache.get(`quiz:${id}`);
    if (cached) return JSON.parse(cached);

    // Fall back to database
    const quiz = await this.baseRepo.findById(id);
    if (quiz) {
      await this.cache.set(`quiz:${id}`, JSON.stringify(quiz), 'EX', 3600);
    }
    return quiz;
  }
}
```

## Monitoring

### Application Monitoring

```typescript
// Add APM (Application Performance Monitoring)
import * as Sentry from '@sentry/node';

Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Health Checks

Already implemented at `/health`:

```bash
# Monitor health endpoint
curl http://api.quiz.example.com/health

# Response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "uptime": 86400
}
```

### Logging

Winston logger outputs to:
- Console (development)
- Files (production)
- External service (CloudWatch, DataDog, etc.)

## Security Checklist

- [ ] HTTPS enabled (TLS certificates)
- [ ] Environment variables secured (not in code)
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] Authentication implemented (if needed)
- [ ] Secrets rotation policy
- [ ] Security headers (Helmet middleware)
- [ ] Database credentials encrypted
- [ ] API keys managed securely
- [ ] Regular dependency updates
- [ ] Vulnerability scanning (npm audit)

## Rollback Strategy

### Backend Rollback

```bash
# Docker/Kubernetes
kubectl rollout undo deployment/quiz-backend

# Heroku
heroku releases:rollback v123 -a quiz-backend

# Traditional
pm2 stop quiz-backend
git checkout <previous-commit>
npm run build
pm2 restart quiz-backend
```

### Frontend Rollback

```bash
# S3 versioning
aws s3api list-object-versions --bucket quiz-frontend
aws s3api copy-object --copy-source quiz-frontend/index.html?versionId=XXX

# Netlify
netlify rollback

# Vercel
vercel rollback
```

## Troubleshooting

### Common Issues

**Issue**: "Cannot find module '@quiz-app/shared'"

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
rm -rf */node_modules */package-lock.json
npm install
```

**Issue**: Types not updating after changing shared package

**Solution**:
```bash
cd shared
npm run build
# Restart backend/frontend dev servers
```

**Issue**: CORS errors in production

**Solution**: Update backend CORS configuration:
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN,  // Set to frontend URL
  credentials: true
}));
```

## Performance Optimization

### Backend

- Enable gzip compression
- Implement caching
- Optimize database queries
- Use connection pooling
- Enable HTTP/2

### Frontend

- Code splitting
- Lazy loading routes
- Image optimization
- Service worker (PWA)
- CDN delivery

## Support

For deployment issues:
- Check logs: `pm2 logs quiz-backend`
- Health check: `curl /health`
- Database connectivity: Check connection strings
- Network: Check firewall rules and security groups
