import { Router, Request, Response } from 'express';
import { assessmentService } from '../services/assessment/assessmentService';
import { clinicalSafetyEngine } from '../services/safety/safetyEngine';
import { runAssessmentWorkflowTestSuite } from '../services/assessment/assessmentTestSuite';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';
import { Language } from '../types/questionnaire';

export const assessmentRouter = Router();

/**
 * 1. POST /api/v1/assessments/evaluate
 * Pure non-persisted evaluation using the clinical safety engine
 */
assessmentRouter.post('/assessments/evaluate', (req: Request, res: Response) => {
  try {
    const { selectedSymptomIds, answers, language, sessionId } = req.body;

    if (!selectedSymptomIds || !Array.isArray(selectedSymptomIds)) {
      return res.status(400).json({ error: 'selectedSymptomIds array is required' });
    }

    const result = clinicalSafetyEngine.evaluateAssessment(selectedSymptomIds, answers || {}, {
      language: (language as Language) || 'en',
      sessionId,
    });

    res.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error('Error evaluating assessment:', err);
    res.status(500).json({ error: 'Failed to evaluate assessment' });
  }
});

/**
 * 2. POST /api/v1/assessments/submit
 * Complete evaluation + relational database persistence
 */
assessmentRouter.post('/assessments/submit', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { selectedSymptomIds, answers, language, sessionId } = req.body;

    if (!selectedSymptomIds || !Array.isArray(selectedSymptomIds)) {
      return res.status(400).json({ error: 'selectedSymptomIds array is required' });
    }

    const patientId = req.user ? req.user.id : undefined;
    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';

    const result = await assessmentService.submitAssessment({
      selectedSymptomIds,
      answers: answers || {},
      patientId,
      language: (language as Language) || 'en',
      sessionId,
      ipAddress,
    });

    res.status(201).json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error('Error submitting assessment:', err);
    res.status(500).json({ error: 'Failed to submit and store assessment' });
  }
});

/**
 * 3. GET /api/v1/assessments/patient-dashboard
 * Fetches current & previous assessments with strict patient data isolation
 */
assessmentRouter.get('/assessments/patient-dashboard', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user!.id;
    const dashboard = await assessmentService.getPatientDashboard(patientId);

    res.json({
      success: true,
      patientId,
      dashboard,
    });
  } catch (err: any) {
    console.error('Error fetching patient dashboard:', err);
    res.status(500).json({ error: 'Failed to fetch patient assessment dashboard' });
  }
});

/**
 * 4. GET /api/v1/assessments/:id
 * Fetches single assessment detail (enforces cross-patient data access protection)
 */
assessmentRouter.get('/assessments/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const assessmentId = Number(req.params.id);
    if (isNaN(assessmentId)) {
      return res.status(400).json({ error: 'Invalid assessment ID' });
    }

    const requestingUserId = req.user!.id;
    const role = req.user!.role;

    const detail = await assessmentService.getAssessmentDetail(assessmentId, requestingUserId, role);

    res.json({
      success: true,
      assessment: detail,
    });
  } catch (err: any) {
    if (err.message && err.message.includes('403')) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to view this assessment.' });
    }
    console.error('Error fetching assessment detail:', err);
    res.status(500).json({ error: 'Failed to fetch assessment detail' });
  }
});

/**
 * 5. PATCH /api/v1/assessments/:id/follow-up
 * Updates follow-up status on an assessment
 */
assessmentRouter.patch('/assessments/:id/follow-up', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const assessmentId = Number(req.params.id);
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Follow-up status is required' });
    }

    const updated = await assessmentService.updateFollowUpStatus(
      assessmentId,
      status,
      notes,
      req.user?.id
    );

    res.json({
      success: true,
      updated,
    });
  } catch (err: any) {
    console.error('Error updating follow up:', err);
    res.status(500).json({ error: 'Failed to update follow-up status' });
  }
});

/**
 * 6. POST /api/v1/assessments/run-tests
 * Executes the automated Phase 6 Assessment Workflow Test Suite
 */
assessmentRouter.post('/assessments/run-tests', async (req: Request, res: Response) => {
  try {
    const report = await runAssessmentWorkflowTestSuite();
    res.json(report);
  } catch (err: any) {
    console.error('Error running Phase 6 test suite:', err);
    res.status(500).json({ error: 'Failed to execute Phase 6 test suite' });
  }
});
