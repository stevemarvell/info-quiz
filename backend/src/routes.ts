import { Router, Request, Response } from 'express';
import { AssessmentSchema, AssessmentSelectionSchema } from './shared';
import { AssessmentService } from './services/AssessmentService';
import { AppError, asyncHandler } from './middleware/errorHandler';
import { validateBody } from './middleware/validation';
import { logger } from './utils/logger';

export function createRouter(assessmentService: AssessmentService): Router {
  const router = Router();

  // Get all assessments
  router.get(
    '/assessments',
    asyncHandler(async (req: Request, res: Response) => {
      logger.info('GET /assessments');
      const assessments = await assessmentService.getAllAssessments();
      res.json({ success: true, data: assessments });
    })
  );

  // Get a specific assessment
  router.get(
    '/assessments/:id',
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      logger.info(`GET /assessments/${id}`);

      const assessment = await assessmentService.getAssessment(id);
      if (!assessment) {
        throw new AppError(404, 'Assessment not found');
      }

      res.json({ success: true, data: assessment });
    })
  );

  // Create a new assessment
  router.post(
    '/assessments',
    validateBody(AssessmentSchema),
    asyncHandler(async (req: Request, res: Response) => {
      logger.info('POST /assessments');
      const createdAssessment = await assessmentService.createAssessment(req.body);
      res.status(201).json({ success: true, data: createdAssessment });
    })
  );

  // Update an assessment
  router.put(
    '/assessments/:id',
    validateBody(AssessmentSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      logger.info(`PUT /assessments/${id}`);

      const updatedAssessment = await assessmentService.updateAssessment(id, req.body);
      if (!updatedAssessment) {
        throw new AppError(404, 'Assessment not found');
      }

      res.json({ success: true, data: updatedAssessment });
    })
  );

  // Delete an assessment
  router.delete(
    '/assessments/:id',
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      logger.info(`DELETE /assessments/${id}`);

      const deleted = await assessmentService.deleteAssessment(id);
      if (!deleted) {
        throw new AppError(404, 'Assessment not found');
      }

      res.status(204).send();
    })
  );

  // Submit assessment selection and calculate results
  router.post(
    '/assessments/:id/selections',
    validateBody(AssessmentSelectionSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      logger.info(`POST /assessments/${id}/selections`);

      const result = await assessmentService.submitAssessmentSelection(id, req.body);
      res.json({ success: true, data: result });
    })
  );

  return router;
}
