# Quiz Metrics Scoring App

A full-stack application for creating and taking quizzes with metric-based scoring. Built with Ionic React (TypeScript) frontend and Node.js (TypeScript) backend.

## Features

- **Admin Interface**: Create and manage quizzes with multiple choice questions
- **Metric-Based Scoring**: Each answer can contribute to multiple metrics with scores from 0-5
- **Personalized Reports**: View detailed results showing scores across all metrics
- **Sample Quiz**: Pre-loaded wellbeing assessment with 10 questions, 3 answers each, and 5 metrics

## Tech Stack

### Frontend
- Ionic React
- TypeScript
- React Router
- Axios
- Vite

### Backend
- Node.js
- Express
- TypeScript
- In-memory data store

## Project Structure

```
info-quiz/
├── backend/
│   ├── src/
│   │   ├── server.ts         # Express server setup
│   │   ├── routes.ts         # API endpoints
│   │   ├── store.ts          # In-memory data store
│   │   ├── types.ts          # TypeScript types
│   │   └── sampleData.ts     # Sample wellbeing quiz
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # React pages/components
│   │   ├── services/         # API service
│   │   ├── types.ts          # TypeScript types
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:8100`

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

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm start
```

### Building for Production

Backend:
```bash
cd backend
npm run build
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

## Future Enhancements

- Persistent database (PostgreSQL, MongoDB)
- User authentication and profiles
- Quiz history and tracking
- More detailed analytics and visualizations
- PDF report generation
- Mobile app builds (iOS/Android)
- Quiz sharing and collaboration
- Question randomization
- Time limits and quiz settings

## License

MIT
