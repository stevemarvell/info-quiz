import { Router, Request, Response } from 'express';
import { store } from './store';
import { Quiz, QuizResponse, QuizResult } from './types';

const router = Router();

// Get all quizzes
router.get('/quizzes', (req: Request, res: Response) => {
  const quizzes = store.getAllQuizzes();
  res.json(quizzes);
});

// Get a specific quiz
router.get('/quizzes/:id', (req: Request, res: Response) => {
  const quiz = store.getQuiz(req.params.id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  res.json(quiz);
});

// Create a new quiz
router.post('/quizzes', (req: Request, res: Response) => {
  const quiz: Quiz = req.body;

  // Basic validation
  if (!quiz.id || !quiz.title || !quiz.questions || !quiz.metrics) {
    return res.status(400).json({ error: 'Invalid quiz data' });
  }

  const createdQuiz = store.createQuiz(quiz);
  res.status(201).json(createdQuiz);
});

// Update a quiz
router.put('/quizzes/:id', (req: Request, res: Response) => {
  const quiz: Quiz = req.body;
  const updatedQuiz = store.updateQuiz(req.params.id, quiz);

  if (!updatedQuiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  res.json(updatedQuiz);
});

// Delete a quiz
router.delete('/quizzes/:id', (req: Request, res: Response) => {
  const deleted = store.deleteQuiz(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  res.status(204).send();
});

// Submit quiz responses and calculate results
router.post('/quizzes/:id/submit', (req: Request, res: Response) => {
  const quizId = req.params.id;
  const response: QuizResponse = req.body;

  const quiz = store.getQuiz(quizId);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  // Calculate metric scores
  const metricTotals = new Map<string, number>();
  const metricMaxScores = new Map<string, number>();

  // Initialize metrics
  quiz.metrics.forEach(metric => {
    metricTotals.set(metric.id, 0);
    metricMaxScores.set(metric.id, 0);
  });

  // Calculate scores based on answers
  response.answers.forEach(answer => {
    const question = quiz.questions.find(q => q.id === answer.questionId);
    if (question) {
      const selectedAnswer = question.answers.find(a => a.id === answer.answerId);
      if (selectedAnswer) {
        selectedAnswer.metricScores.forEach(metricScore => {
          const currentTotal = metricTotals.get(metricScore.metricId) || 0;
          metricTotals.set(metricScore.metricId, currentTotal + metricScore.score);
        });
      }
    }
  });

  // Calculate max possible scores
  quiz.questions.forEach(question => {
    question.answers.forEach(answer => {
      answer.metricScores.forEach(metricScore => {
        const currentMax = metricMaxScores.get(metricScore.metricId) || 0;
        if (metricScore.score > currentMax) {
          metricMaxScores.set(metricScore.metricId, currentMax + (metricScore.score - currentMax));
        }
      });
    });
  });

  // Build result
  const result: QuizResult = {
    quizId,
    metricScores: quiz.metrics.map(metric => {
      const totalScore = metricTotals.get(metric.id) || 0;
      const maxScore = quiz.questions.length * 5; // Max score of 5 per question
      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

      return {
        metricId: metric.id,
        metricName: metric.name,
        totalScore,
        maxScore,
        percentage: Math.round(percentage * 10) / 10
      };
    })
  };

  res.json(result);
});

export default router;
