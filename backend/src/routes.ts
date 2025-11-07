import { Router, Request, Response } from 'express';
import { QuizSchema, QuizResponseSchema } from '@quiz-app/shared';
import { QuizService } from './services/QuizService';
import { AppError, asyncHandler } from './middleware/errorHandler';
import { validateBody } from './middleware/validation';
import { logger } from './utils/logger';

export function createRouter(quizService: QuizService): Router {
  const router = Router();

  // Get all quizzes
  router.get(
    '/quizzes',
    asyncHandler(async (req: Request, res: Response) => {
      logger.info('GET /quizzes');
      const quizzes = await quizService.getAllQuizzes();
      res.json({ success: true, data: quizzes });
    })
  );

  // Get a specific quiz
  router.get(
    '/quizzes/:id',
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      logger.info(`GET /quizzes/${id}`);

      const quiz = await quizService.getQuiz(id);
      if (!quiz) {
        throw new AppError(404, 'Quiz not found');
      }

      res.json({ success: true, data: quiz });
    })
  );

  // Create a new quiz
  router.post(
    '/quizzes',
    validateBody(QuizSchema),
    asyncHandler(async (req: Request, res: Response) => {
      logger.info('POST /quizzes');
      const createdQuiz = await quizService.createQuiz(req.body);
      res.status(201).json({ success: true, data: createdQuiz });
    })
  );

  // Update a quiz
  router.put(
    '/quizzes/:id',
    validateBody(QuizSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      logger.info(`PUT /quizzes/${id}`);

      const updatedQuiz = await quizService.updateQuiz(id, req.body);
      if (!updatedQuiz) {
        throw new AppError(404, 'Quiz not found');
      }

      res.json({ success: true, data: updatedQuiz });
    })
  );

  // Delete a quiz
  router.delete(
    '/quizzes/:id',
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      logger.info(`DELETE /quizzes/${id}`);

      const deleted = await quizService.deleteQuiz(id);
      if (!deleted) {
        throw new AppError(404, 'Quiz not found');
      }

      res.status(204).send();
    })
  );

  // Submit quiz responses and calculate results
  router.post(
    '/quizzes/:id/submit',
    validateBody(QuizResponseSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      logger.info(`POST /quizzes/${id}/submit`);

      const result = await quizService.submitQuizResponse(id, req.body);
      res.json({ success: true, data: result });
    })
  );

  return router;
}
