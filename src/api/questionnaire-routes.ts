import { Router, Request, Response } from 'express';
import { symptomRegistry } from '../services/questionnaire/symptomTaxonomy';
import { questionnaireRuleEngine } from '../services/questionnaire/ruleEngine';
import { runQuestionnaireTestSuite } from '../services/questionnaire/testSuite';
import { QUESTION_LIBRARY } from '../services/questionnaire/questionLibrary';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';
import { db } from '../db/index';
import { auditLogs } from '../db/schema';
import { Language } from '../types/questionnaire';

export const questionnaireRouter = Router();

/**
 * 1. GET /api/v1/questionnaire/symptoms
 * Retrieves the full structured symptom taxonomy with search & category filtering
 */
questionnaireRouter.get('/questionnaire/symptoms', (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const bodySystem = req.query.system as string;
    const lang = (req.query.lang as Language) || 'en';

    let list = query ? symptomRegistry.search(query, lang) : symptomRegistry.getAll();

    if (bodySystem && bodySystem !== 'all') {
      list = list.filter((item) => item.bodySystem === bodySystem);
    }

    res.json({
      success: true,
      count: list.length,
      symptoms: list,
    });
  } catch (err: any) {
    console.error('Error fetching symptom taxonomy:', err);
    res.status(500).json({ error: 'Failed to retrieve symptom taxonomy' });
  }
});

/**
 * 2. POST /api/v1/questionnaire/next-question
 * Evaluates rule engine dynamically for given selected symptoms and answers
 */
questionnaireRouter.post('/questionnaire/next-question', (req: Request, res: Response) => {
  try {
    const { selectedSymptomIds, currentAnswers } = req.body;

    if (!selectedSymptomIds || !Array.isArray(selectedSymptomIds)) {
      return res.status(400).json({ error: 'selectedSymptomIds array is required' });
    }

    const answers = currentAnswers || {};
    const nextQuestion = questionnaireRuleEngine.getNextQuestion(selectedSymptomIds, answers);
    const progress = questionnaireRuleEngine.calculateProgress(selectedSymptomIds, answers);

    res.json({
      success: true,
      nextQuestion,
      progress,
    });
  } catch (err: any) {
    console.error('Error evaluating next question:', err);
    res.status(500).json({ error: 'Failed to evaluate next question' });
  }
});

/**
 * 3. POST /api/v1/questionnaire/validate
 * Validates a single answer input against question rules
 */
questionnaireRouter.post('/questionnaire/validate', (req: Request, res: Response) => {
  try {
    const { questionId, value } = req.body;

    const question = QUESTION_LIBRARY.find((q) => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const validation = questionnaireRuleEngine.validateAnswer(question, value);
    res.json(validation);
  } catch (err: any) {
    console.error('Error validating answer:', err);
    res.status(500).json({ error: 'Failed to validate answer' });
  }
});

/**
 * 4. POST /api/v1/questionnaire/summary
 * Generates the structured non-diagnostic clinical summary
 */
questionnaireRouter.post('/questionnaire/summary', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { selectedSymptomIds, answers, language, sessionId } = req.body;

    if (!selectedSymptomIds || !Array.isArray(selectedSymptomIds)) {
      return res.status(400).json({ error: 'selectedSymptomIds array is required' });
    }

    const summary = questionnaireRuleEngine.generateStructuredClinicalSummary(
      selectedSymptomIds,
      answers || {},
      {
        language: language || 'en',
        sessionId,
      }
    );

    // If authenticated, record an audit event for intake completion
    if (req.user) {
      try {
        await db.insert(auditLogs).values({
          userId: req.user.id,
          action: 'QUESTIONNAIRE_INTAKE_COMPLETED',
          resourceType: 'clinical_questionnaire',
          resourceId: summary.metadata.sessionId,
          detailsJson: {
            symptomsCount: selectedSymptomIds.length,
            hasRedFlags: summary.safetyScreening.hasRedFlagsDetected,
            answersCount: Object.keys(answers || {}).length,
          },
          ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
        });
      } catch (logErr) {
        console.warn('Audit log write error for questionnaire:', logErr);
      }
    }

    res.json({
      success: true,
      summary,
    });
  } catch (err: any) {
    console.error('Error generating summary:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

/**
 * 5. POST /api/v1/questionnaire/run-tests
 * Executes automated test suite for questionnaire engine
 */
questionnaireRouter.post('/questionnaire/run-tests', async (req: Request, res: Response) => {
  try {
    const testReport = await runQuestionnaireTestSuite();
    res.json(testReport);
  } catch (err: any) {
    console.error('Error running test suite:', err);
    res.status(500).json({ error: 'Failed to execute questionnaire test suite' });
  }
});
