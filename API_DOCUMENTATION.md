# Quiz Metrics API Documentation

## Base URL
```
http://localhost:3000/api
```

## Response Format
All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": <response_data>
}
```

**Error:**
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Error description",
  "details": {} // Optional
}
```

## Endpoints

### Get All Quizzes
Retrieve all available quizzes.

**Endpoint:** `GET /quizzes`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "quiz-1",
      "title": "Wellbeing Assessment",
      "description": "Assess your overall wellbeing",
      "metrics": [...],
      "questions": [...]
    }
  ]
}
```

### Get Quiz by ID
Retrieve a specific quiz by its ID.

**Endpoint:** `GET /quizzes/:id`

**Parameters:**
- `id` (path): Quiz ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "quiz-1",
    "title": "Wellbeing Assessment",
    "description": "Assess your overall wellbeing",
    "metrics": [
      {
        "id": "physical",
        "name": "Physical Health",
        "description": "Your physical wellbeing"
      }
    ],
    "questions": [
      {
        "id": "q1",
        "text": "How would you rate your sleep quality?",
        "answers": [
          {
            "id": "q1a1",
            "text": "Excellent",
            "metricScores": [
              { "metricId": "physical", "score": 5 }
            ]
          }
        ]
      }
    ]
  }
}
```

### Create Quiz
Create a new quiz (Admin only).

**Endpoint:** `POST /quizzes`

**Request Body:**
```json
{
  "id": "quiz-2",
  "title": "New Quiz",
  "description": "Quiz description",
  "metrics": [
    {
      "id": "metric1",
      "name": "Metric Name",
      "description": "Metric description"
    }
  ],
  "questions": [
    {
      "id": "q1",
      "text": "Question text?",
      "answers": [
        {
          "id": "a1",
          "text": "Answer text",
          "metricScores": [
            { "metricId": "metric1", "score": 5 }
          ]
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Validation Rules:**
- Title: 1-200 characters
- Description: Max 1000 characters
- Metrics: 1-20 metrics
- Questions: 1-100 questions
- Answers: 2+ answers per question
- Metric Scores: 0-5 integer

### Update Quiz
Update an existing quiz (Admin only).

**Endpoint:** `PUT /quizzes/:id`

**Parameters:**
- `id` (path): Quiz ID

**Request Body:** Same as Create Quiz

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### Delete Quiz
Delete a quiz (Admin only).

**Endpoint:** `DELETE /quizzes/:id`

**Parameters:**
- `id` (path): Quiz ID

**Response:**
```json
{
  "success": true,
  "data": null
}
```

### Submit Quiz Response
Submit answers to a quiz and get results.

**Endpoint:** `POST /quizzes/:id/responses`

**Parameters:**
- `id` (path): Quiz ID

**Request Body:**
```json
{
  "quizId": "quiz-1",
  "answers": [
    {
      "questionId": "q1",
      "answerId": "q1a1"
    },
    {
      "questionId": "q2",
      "answerId": "q2a2"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quizId": "quiz-1",
    "metricScores": [
      {
        "metricId": "physical",
        "metricName": "Physical Health",
        "totalScore": 25,
        "maxScore": 50,
        "percentage": 50.0
      }
    ]
  }
}
```

## Error Codes

| Status Code | Error Type | Description |
|-------------|-----------|-------------|
| 400 | ValidationError | Request validation failed |
| 404 | NotFound | Resource not found |
| 429 | TooManyRequests | Rate limit exceeded |
| 500 | InternalServerError | Server error |

## Rate Limiting

**General Requests (GET):**
- 100 requests per 15 minutes per IP

**Write Operations (POST/PUT/DELETE):**
- 30 requests per 15 minutes per IP

Headers returned:
- `RateLimit-Limit`: Request limit
- `RateLimit-Remaining`: Remaining requests
- `RateLimit-Reset`: Reset time

## Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T12:00:00.000Z",
  "environment": "development",
  "uptime": 123.45
}
```

## Example Usage

### JavaScript/TypeScript
```typescript
// Get all quizzes
const response = await fetch('http://localhost:3000/api/quizzes');
const { data: quizzes } = await response.json();

// Submit quiz
const response = await fetch('http://localhost:3000/api/quizzes/quiz-1/responses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quizId: 'quiz-1',
    answers: [
      { questionId: 'q1', answerId: 'q1a1' }
    ]
  })
});
const { data: result } = await response.json();
```

### cURL
```bash
# Get all quizzes
curl http://localhost:3000/api/quizzes

# Submit quiz
curl -X POST http://localhost:3000/api/quizzes/quiz-1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": "quiz-1",
    "answers": [
      {"questionId": "q1", "answerId": "q1a1"}
    ]
  }'
```

## Notes for Production

**Authentication:** Not implemented. Add JWT/OAuth before production deployment.

**Authorization:** All endpoints are currently public. Implement role-based access control for admin endpoints.

**Database:** Currently uses in-memory storage. Switch to PostgreSQL/MongoDB for production.

**HTTPS:** Enforce HTTPS in production.
